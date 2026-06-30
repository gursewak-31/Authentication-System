import * as actions from "../database/DBactions.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import formidable from "formidable"

export async function userLogin(req, res){
    try{
        let data = await getReqData(req);
        console.log(data)
        let user = await actions.CheckUser(data);

        let isValid = await bcrypt.compare(data?.password ?? "", user?.password ?? "");

        if(!isValid){
            res.statusCode = 404;
            res.end(JSON.stringify({status: "failed", msg: "Invalid email or password"}));
            return;
        }

        let sessionId = crypto.randomBytes(8).toString('hex');
        await actions.InsertSession(sessionId, user.email, user.password);

        res.statusCode = 200;
        res.setHeader("Set-Cookie", `sessionId=${sessionId}; HttpOnly; SameSite=Lax`);
        res.end(JSON.stringify({status: "ok", data: user}));
    }catch(err){
        console.log(err)
        res.statusCode = 500;
        res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
    }
}

export async function userSignup(req, res){
    try{
        let form = await uploadMedia(req);
        let fields = form.fields;
        let files = form.files;

        console.log(fields.password[0]);
        let hashedPass = await bcrypt.hash(fields.password[0], 12);

        let reqData = {
            firstName: fields.firstname[0],
            lastName: fields.lastname[0],
            email: fields.email[0],
            password: hashedPass,
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
}

export async function getUser(req, res){
    try{
        let sessionId = getSessionId(req);
        if(!sessionId){
            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }

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
}

export async function userUpdate(req, res){
    try{
        let sessionId = getSessionId(req);
        if(!sessionId){
            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }

        let data = await getReqData(req);

        let update = await actions.UpdateUser(data, sessionId);

        if(!update){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Failed to update data, please try again!"}));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({status: "ok", msg: "Data updated successfully"}));
    }catch(err){
        res.statusCode = 500;
        res.end(JSON.stringify({status: "error", msg: "Internal server error"}))
    }
}

export async function userUpdateImage(req, res){
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
}

export async function userChangePassword(req, res){
    try{
        let sessionId = getSessionId(req);
        if(!sessionId){
            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }

        let data = await getReqData(req);
            
        let change = await actions.ChangePassword(data.currPass, data.newPass, sessionid);

        if(!change){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Failed to change password !"}));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({status: "ok", msg: "Password changed successfully."}));
    }catch(err){
        res.statusCode = 500;
        res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
    }
}

export async function userLogout(req, res){
    try{
        let sessionId = getSessionId(req);
        if(!sessionId){
            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }

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
}

export async function userDelete(req, res){
    try{
        let sessionId = getSessionId(req);
        if(!sessionId){
            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }

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
}

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

function getSessionId(request){
    let cookie = request.headers.cookie;

    if(!cookie) return null;

    return cookie.split("=")[1];
}

function getReqData(req){
    let data = "";
    return new Promise((res, rej) => {
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            try{
                res(JSON.parse(data));
            }catch(err){
                rej(err);
            }
        });
        req.on("error", rej);
    });
}