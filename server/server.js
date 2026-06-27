import http from 'http';
import formidable from 'formidable';
import * as actions from './DBactions.js';
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";

const sessions = {};

dotenv.config();
const port = process.env.PORT;

let server = http.createServer( async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if(req.method == "OPTIONS"){
        res.statusCode = 204;
        res.end();
        return;
    }

    if(req.method == "POST" && req.url == "/signup"){
        try{
            let form = await uploadMedia(req);
            let fields = form.fields;
            let files = form.files;

            let reqData = {
                firstName: fields.firstname[0],
                lastName: fields.lastname[0],
                email: fields.email[0],
                password: fields.password[0],
                profileImage: files?.profilePhoto?.[0]?.newFilename
            }

            let insertUser = await actions.InsertUser(reqData);

            if(!insertUser){
                if(files?.profilePhoto?.[0].filepath){
                    fs.unlink(files?.profilePhoto?.[0].filepath, (err) => {});
                }
                res.statusCode = 409;
                res.end(JSON.stringify({status: "failed", msg: "Email address already exist."}));
                return;
            }

            let sessionId = crypto.randomBytes(8).toString('hex');
            let insterSession = await actions.InsertSession(sessionId, reqData.email, reqData.password);

            res.setHeader("Set-Cookie", `sessionId=${sessionId}; path=/; HttpOnly; SameSite=Lax`);
            res.end(JSON.stringify({status: "ok"}));
        }catch(err){
            console.log(err);
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
        }
        return;
    }

    if(req.method == "POST" && req.url == "/login"){
        try{
            let data = ""
            req.on("data", chunk => data += chunk);
            req.on("end", async () => {
                data = JSON.parse(data);

                let user = await actions.CheckUser(data);

                if(!user){
                    res.statusCode = 404;
                    res.end(JSON.stringify({status: "failed", msg: "Invalid email or password"}));
                    return;
                }

                let sessionId = crypto.randomBytes(8).toString('hex');
                await actions.InsertSession(sessionId, user.email, user.password);
                
                res.statusCode = 200;
                res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; SameSite=Lax`);
                res.end(JSON.stringify({status: "ok", data: user}));
            });
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
        }
        return;
    }

    if(req.method == "GET" && req.url == "/user"){
        try{
            let cookie = req.headers.cookie;
            if(!cookie){
                res.statusCode = 401;
                res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again!"}));
                return;
            }
            let sessionId = cookie.split("=")[1];

            let user = await actions.GetUser(sessionId);

            if(!user){
                res.statusCode = 404;
                res.end(JSON.stringify({status: "failed", msg: "User not found"}));
                return;
            }

            res.statusCode = 200;
            res.end(JSON.stringify({status: "ok", data: user}));
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
        }
        return;
    }

    if(req.method == "POST" && req.url == "/logout"){
        try{
            let cookie = req.headers.cookie;
            if(!cookie){
                res.statusCode = 401;
                res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
                return;
            }
            let sessionId = cookie.split("=")[1];

            let d = await actions.DeleteSession(sessionId);

            if(!d){
                res.statusCode = 400;
                res.end(JSON.stringify({status: "failed", msg: "failed to logout"}));
                return;
            }

            res.statusCode = 200;
            res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; HttpOnly");
            res.end(JSON.stringify({status: "ok", msg: "logout successfuly"}));
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "ok", msg: "Internal server error"}));
        }
        return;
    }

    if(req.method == "POST" && req.url == "/updateUser"){
        try{
            let cookie = req.headers.cookie;
            if(!cookie){
                res.statusCode = 401;
                res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
                return;
            }
            let sessionId = cookie.split("=")[1];

            let data = "";
            req.on("data", chunk => data += chunk);
            req.on("end", async () => {
                data = JSON.parse(data);

                let update = await actions.UpdateUser(data, sessionId);

                if(!update){
                    res.statusCode = 400;
                    res.end(JSON.stringify({status: "failed", msg: "Failed to update data, please try again!"}));
                    return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({status: "ok", msg: "Data updated successfully"}))
            });
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Internal server error"}))
        }
        return;
    }

    if(req.method == "POST" && req.url == "/updateProfileImage"){
        try{
            let form = await uploadMedia(req);
            let fields = form.fields;
            let files = form.files;

            let id = parseInt(fields?.id?.[0]);
            let image = files?.profileImage?.[0].newFilename ?? "";

            let updateImage = await actions.UpdateProfileImage({image: image, id: id});

            if(!updateImage){
                res.statusCode = 400;
                res.end(JSON.stringify({status: "failed", msg: "Failed to update profile image."}));
                return;
            }

            let oldImage = path.join(import.meta.dirname, "../client/public/assets/profileImages/", fields?.oldImageName?.[0])
            if(fs.existsSync(oldImage)){
                fs.unlink(oldImage, (err) => {});
            }

            res.statusCode = 200;
            res.end(JSON.stringify({status: "ok", msg: "Profile Image update successfully.", image: image}));
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Interal server error"}));
        }
        return;
    }

    if(req.method == "POST" && req.url == "/changePassword"){
        try{
            let cookie = req.headers.cookie;
            if(!cookie){
                res.statusCode = 401;
                res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again!"}));
                return;
            }
            let sessionid = cookie.split("=")[1];

            let data = "";
            req.on("data", chunk => data += chunk);
            req.on("end", async () => {
                data = JSON.parse(data);

                let change = await actions.ChangePassword(data.currPass, data.newPass, sessionid);

                if(!change){
                    res.statusCode = 400;
                    res.end(JSON.stringify({status: "failed", msg: "Failed to change password !"}));
                    return;
                }

                res.statusCode = 200;
                res.end(JSON.stringify({status: "ok", msg: "Password changed successfully."}));
            });
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
        }
        return;
    }

    if(req.method == "POST" && req.url == "/deleteAccount"){
        try{
            let cookie = req.headers.cookie;
            if(!cookie){
                res.statusCode = 400;
                res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again!"}));
                return;
            }
            let sessionid = cookie.split("=")[1];

            let del = await actions.DeleteAccount(sessionid);

            if(!del.res){
                res.statusCode = 400;
                res.end(JSON.stringify({status: "failed", msg: "Failed to delete account !"}));
                return;
            }

            if(del.img){
                let oldImage = path.join(import.meta.dirname, "../client/public/assets/profileImages/", del.img);
                if(fs.existsSync(oldImage)){
                    fs.unlink(oldImage, (err) => {});
                }
            }

            res.statusCode = 200;
            res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; HttpOnly");
            res.end(JSON.stringify({status: "ok", msg: "Account deleted successfully."}));
        }catch(err){
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
        }
        return;
    }

    res.end("No Route Found");
    return;
});

server.listen(port, () => console.log("server start"));

function uploadMedia(request){
    let form = formidable({
        uploadDir: path.join(import.meta.dirname, "../client/public/assets/profileImages/"),
        keepExtensions: true
    });

    return new Promise((res, rej) => {
        form.parse(request, (err, fields, files) => {
            if(err) rej(err);
            res({fields, files});
        });
    });
}
