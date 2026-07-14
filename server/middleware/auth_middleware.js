import { event } from "../controllers/controller.js";

export default function authMiddleware(req, res, next){
    let activity = "";
    if(req.url == "/updateUser")
        activity = "update";
    else if(req.url == "/updateProfileImage")
        activity = "update";
    else if(req.url == "/changePassword")
        activity = "changePassword";
    else if(req.url == "/logout")
        activity = "logout";
    else if(req.url == "/deleteAccount")
        activity = "deactivate";

    if(req.url != "/login" && req.url != "/signup"){
        let sessionId = getSessionId(req);
        if(!sessionId){
            if(req.url != "/user")
                event.emit("log", {userID: null, activity: activity, status: "failed"});

            res.statusCode = 401;
            res.end(JSON.stringify({status: "failed", msg: "Session expired. Please login again."}));
            return;
        }
        req.sessionId = sessionId;
    }
    next();
}

function getSessionId(request){
    let cookie = request.headers.cookie;

    if(!cookie) return null;

    return cookie.split("=")[1];
}