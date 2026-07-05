import * as actions from "../database/DBactions.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import formidable from "formidable"

export async function userLogin(req, res){
    try{
        let data = await getReqData(req);

        let user = await actions.CheckUser(data.email);

        let isValid = await bcrypt.compare(data?.password ?? "", user?.password ?? "");

        if(!isValid || !user){
            res.statusCode = 404;
            res.end(JSON.stringify({status: "failed", msg: "Invalid email or password"}));
            return;
        }

        let sessionId = crypto.randomBytes(8).toString('hex');
        await actions.InsertSession(sessionId, user.id);

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

        
        let validateData = checkFields({firstName: fields.firstname[0], lastName: fields.lastname[0], email: fields.email[0], password: fields.password[0]});
        if(!validateData){
            if(files?.profilePhoto?.[0].filepath){
                fs.unlink(files?.profilePhoto?.[0].filepath, (err) => {});
            }
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Invalid data, Please fill valid credentials."}));
            return;
        }

        let hashedPass = await bcrypt.hash(fields.password[0], 12);

        let reqData = {
            firstName: fields.firstname[0],
            lastName: fields.lastname[0],
            email: fields.email[0],
            password: hashedPass,
            profileImage: files?.profilePhoto?.[0]?.newFilename
        }

        let checkUser = await actions.CheckUser(reqData.email);

        if(checkUser){
            if(files?.profilePhoto?.[0].filepath){
                fs.unlink(files?.profilePhoto?.[0].filepath, (err) => {});
            }
            res.statusCode = 409;
            res.end(JSON.stringify({status: "failed", msg: "Email address already exist."}));
            return;
        }

        let insertUser = await actions.InsertUser(reqData); // it return user id on inserted user

        let sessionId = crypto.randomBytes(8).toString('hex');
        let insterSession = await actions.InsertSession(sessionId, insertUser);

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
        let validateData = checkFields({firstName: data.firstName, lastName: data.lastName, email: data.email});
        if(!validateData){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Invalid data, Please fill valid credentials."}));
            return;
        }

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
        let sessionId = getSessionId(req);
        if(!sessionId){
            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }

        let form = await uploadMedia(req);
        let fields = form.fields;
        let files = form.files;

        let id = parseInt(fields?.id?.[0]);
        let image = files?.profileImage?.[0].newFilename ?? "";
        let oldImage = fields?.oldImageName?.[0] ?? "";

        let updateImage = await actions.UpdateProfileImage({image: image, id: id});
        if(!updateImage){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Failed to update profile image."}));
            return;
        }

        if(oldImage){
            let oldImage = path.join(import.meta.dirname, "../client/public/assets/profileImages/", )
            if(fs.existsSync(oldImage)){
                fs.unlink(oldImage, (err) => {});
            }
        }

        res.statusCode = 200;
        res.end(JSON.stringify({status: "ok", msg: "Profile Image update successfully.", image: image}));
    }catch(err){
        console.log(err)
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
        let validateData = checkFields({password: data.newPass, password: data.currPass});
        if(!validateData){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Invalid data, Please fill valid credentials."}));
            return;
        }

        let getuser = await actions.GetUser(sessionId);
        let user = await actions.CheckUser(getuser.email);

        let isValid = await bcrypt.compare(data.currPass, user?.password ?? '');

        if(!isValid){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "wrong current password !"}));
            return;
        }

        let password = await bcrypt.hash(data.newPass, 12);
            
        let change = await actions.ChangePassword(password, sessionId);

        if(!change){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Failed to change password !"}));
            return;
        }

        res.statusCode = 200;
        res.end(JSON.stringify({status: "ok", msg: "Password changed successfully."}));
    }catch(err){
        console.log(err)
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

        let user = await actions.GetUser(sessionId);
        let del = await actions.DeleteAccount(sessionId);

        if(!del){
            res.statusCode = 400;
            res.end(JSON.stringify({status: "failed", msg: "Failed to delete account !"}));
            return;
        }

        if(user.profileImage != ''){
            let oldImage = path.join(import.meta.dirname, "../../client/public/assets/profileImages/", user.profileImage);
            if(fs.existsSync(oldImage)){
                fs.unlink(oldImage, (err) => {});
            }
        }

        res.statusCode = 200;
        res.setHeader("Set-Cookie", "sessionId=; Max-Age=0; HttpOnly");
        res.end(JSON.stringify({status: "ok", msg: "Account deleted successfully."}));
    }catch(err){
        console.log(err);
        res.statusCode = 500;
        res.end(JSON.stringify({status: "error", msg: "Internal server error"}));
    }
}

function uploadMedia(request){
    let form = formidable({
        uploadDir: path.join(import.meta.dirname, "../../client/public/assets/profileImages/"),
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

function checkFields(data){
    let isValid = true;
    for(let [field, value] of Object.entries(data)){
        switch(field){
            case "firstName":
                if(!/^[a-zA-Z\s]+$/.test(value))
                    isValid = false;
                break;
            case "lastName":
                if(!/^[a-zA-Z\s]*$/.test(value))
                    isValid = false;
                break;
            case "email":
                if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                    isValid = false;
                break;
            case "password":
                if(!/^.{8,}$/.test(value))
                    isValid = false;
                break;
        }
        if(!isValid) break;
    }     
    return isValid;
}