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

let server = http.createServer((req, res) => {
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
        let form = formidable({
            uploadDir: path.join(import.meta.dirname, "../client/public/assets/profileImages/"),
            keepExtensions: true
        });

        form.parse(req, (err, fields, files) => {
            if(err){
                res.statusCode = 500;
                res.end(JSON.stringify({error: err}));
                return;
            }

            let reqData = {
                firstName: fields.firstname[0],
                lastName: fields.lastname[0],
                email: fields.email[0],
                password: fields.password[0],
                profileImage: files?.profilePhoto?.[0]?.newFilename
            }

            actions.InsertUser(reqData).then((result) => {
                res.statusCode = 200;
                res.end(JSON.stringify(result));
            }).catch((err) => {
                res.statusCode = 500;
                res.end(JSON.stringify({status: "error", error: err}));
            })
        });
        return;
    }

    if(req.method == "POST" && req.url == "/login"){
        let data = ""
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            data = JSON.parse(data);

            actions.CheckUser(data).then((result) => {
                res.statusCode = 200;
                if(result){
                    let sessionId = crypto.randomBytes(8).toString('hex');
                    actions.InsertSession(sessionId, result.email, result.password).then(() => {
                        res.setHeader("Set-cookie", `sessionId=${sessionId}; HttpOnly; SameSite=Lax`);
                        res.end(JSON.stringify({status: "ok", data: result}));
                    });
                }else{
                    res.end(JSON.stringify({status: "error", status: "Not Found"}));
                }
            }).catch((err) => {
                res.statusCode = 500;
                res.end(JSON.stringify({status: "error", error: err}));
            });
        });
        return;
    }

    if(req.method == "GET" && req.url == "/user"){
        let cookie = req.headers.cookie;
        if(!cookie){
            res.statusCode = 200;
            res.end(JSON.stringify({status: "Session Expire"}));
            return;
        }
        let sessionId = cookie.split("=")[1];

        actions.GetUser(sessionId).then((result) => {
            res.statusCode = 200;
            if(result){
                res.end(JSON.stringify({status: "ok", data: result}));
            }else{
                res.end(JSON.stringify({status: "session expire or not set"}));
            }
        })
        
        return;
    }

    if(req.method == "POST" && req.url == "/logout"){
        let cookie = req.headers.cookie;
        let sessionId = cookie.split("=")[1];

        actions.DeleteSession(sessionId).then((result) => {
            res.statusCode = 200;
            if(result){
                res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; HttpOnly");
                res.end(JSON.stringify({status: "ok"}));
            }else{
                res.end(JSON.stringify({status: "session not deleted"}));
            }
        });

        return;
    }

    if(req.method == "POST" && req.url == "/updateUser"){
        let cookie = req.headers.cookie;
        let sessionId = cookie.split("=")[1];
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            data = JSON.parse(data);
            actions.UpdateUser(data, sessionId).then((result) => {
                res.statusCode = 200;
                if(result){
                    res.end(JSON.stringify({status: "ok", msg: "Data updated successfully"}))
                }else{
                    res.end(JSON.stringify({status: "not update", msg: "Data not update, please try again"}));
                }
            }).catch((err) => {
                res.statusCode = 500;
                res.end(JSON.stringify({status: "error", error: err}));
            });
        });
        return;
    }

    if(req.method == "POST" && req.url == "/updateProfileImage"){
        let form = formidable({
            uploadDir: path.join(import.meta.dirname, "../client/public/assets/profileImages/"),
            keepExtensions: true
        });

        form.parse(req, (err, fields, files) => {
            if(err){
                res.statusCode = 500;
                res.end(JSON.stringify({status: "error", error: err}));
                return;
            }

            let id = parseInt(fields?.id?.[0]);
            let image = files?.profileImage?.[0].newFilename ?? "";

            let oldImage = path.join(import.meta.dirname, "../client/public/assets/profileImages/", fields?.oldImageName?.[0])
            if(fs.existsSync(oldImage)){
                fs.unlink(oldImage, (err) => {
                    if(err){
                        res.statusCode = 500;
                        res.end(JSON.stringify({status: "error", error: err}));
                        return;
                    }
                });
            }
            
            actions.UpdateProfileImage({image: image, id: id}).then((result) => {
                res.statusCode = 200;
                if(result){
                    res.end(JSON.stringify({status: "ok", image: image}));
                }else{
                    res.end(JSON.stringify({status: "not update"}));
                }
            }).catch((err) => {
                res.statusCode = 500;
                res.end(JSON.stringify({status: "error", error: err}))
            })
        })
        return;
    }

    if(req.method == "POST" && req.url == "/changePassword"){
        let cookie = req.headers.cookie;
        if(!cookie){
            res.statusCode = 200;
            res.end(JSON.stringify({status: "Session Expire"}));
            return;
        }
        let sessionid = cookie.split("=")[1];
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            data = JSON.parse(data);
            actions.ChangePassword(data.newPass, sessionid).then((result) => {
                res.statusCode = 200;
                if(result){
                    res.end(JSON.stringify({status: "ok", msg: "password changed"}));
                }else{
                    res.end(JSON.stringify({status: "not ok", msg: "password can't changed"}));
                }
            }).catch((err) => {
                res.statusCode = 500;
                res.end(JSON.stringify({status: "error", error: err}));
            })
        });
        return;
    }

    if(req.method == "POST" && req.url == "/deleteAccount"){
        let cookie = req.headers.cookie;
        if(!cookie){
            res.statusCode = 200;
            res.end(JSON.stringify({status: "Session Expire"}));
            return;
        }
        let sessionid = cookie.split("=")[1];
        actions.DeleteAccount(sessionid).then((result) => {
            res.statusCode = 200;
            console.log(result);
            if(result.res){
                if(result.img.profileImage){
                    let oldImage = path.join(import.meta.dirname, "../client/public/assets/profileImages/", result.img.profileImage);
                    if(fs.existsSync(oldImage)){
                        fs.unlink(oldImage, (err) => {
                            if(err){
                                res.statusCode = 500;
                                res.end(JSON.stringify({status: "error", error: err}));
                                return;
                            }
                        });
                    }
                }
                res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; HttpOnly");
                res.end(JSON.stringify({status: "ok", msg: "account deleted"}));
            }else{
                res.end(JSON.stringify({status: "not delete", msg: "account not deleted"}));
            }
        }).catch((err) => {
            res.statusCode = 500;
            res.end(JSON.stringify({status: "error", error: err}));
        })
        return;
    }

    res.end("No Route Found");
    return;
});

server.listen(port, () => console.log("server start"));
