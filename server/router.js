import * as controller from "./controllers/controller.js"

export default function router(request, response){
    if(request.method == "POST" && request.url == "/signup"){
        return controller.userSignup(request, response);
    }

    if(request.method == "POST" && request.url == "/login"){
        return controller.userLogin(request, response);
    }

    if(request.method == "GET" && request.url == "/user"){
        return controller.getUser(request, response);
    }

    if(request.method == "POST" && request.url == "/updateUser"){
        return controller.userUpdate(request, response);
    }

    if(request.method == "POST" && request.url == "/updateProfileImage"){
        return controller.userUpdateImage(request, response);
    }

    if(request.method == "POST" && request.url == "/changePassword"){
        return controller.userChangePassword(request, response);
    }

    if(request.method == "POST" && request.url == "/logout"){
        return controller.userLogout(request, response);
    }

    if(request.method == "POST" && request.url == "/deleteAccount"){
        return controller.userDelete(request, response);
    }

    response.statusCode = 500;
    response.end(JSON.stringify({status: "error", msg: "No Route Found"}));
    return;
}