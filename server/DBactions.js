import DBconnection from "./DBconnection.js";

export async function InsertSession(sessionid, email, password){
    try{
        let conn = await DBconnection();

        await conn.execute("INSERT INTO login_sessions (sessionId, email, password) VALUES (?, ?, ?)", [sessionid, email, password]);

        return;
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function InsertUser(data){
    try{
        let conn = await DBconnection();

        await conn.execute("INSERT INTO users (firstName, lastName, email, password, profileImage, lastUpdate) VALUES (?, ?, ?, ?, ?, NOW())", [data.firstName ?? "", data.lastName ?? "", data.email ?? "", data.password ?? "", data.profileImage ?? ""]);

        return {status: "ok", msg: "data insert successfully"};
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function CheckUser(data){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("SELECT * FROM users WHERE email = ? AND password = ?", [data.email ?? "", data.password ?? ""]);

        return res[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function GetUser(sessionId){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("SELECT u.* FROM users u JOIN login_sessions ls On ls.email = u.email AND ls.password = u.password WHERE ls.sessionId = ?", [sessionId]);

        return res[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function DeleteSession(sessionId){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("DELETE FROM login_sessions WHERE sessionId = ?", [sessionId]);

        return res.affectedRows;
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function UpdateUser(data, sessionid){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("UPDATE users SET firstName = ?, lastName = ?, email = ?, lastUpdate = NOW() WHERE id = ?", [data.firstname, data.lastname, data.email, data.id]);

        let [res2] = await conn.execute("UPDATE login_sessions SET email = ? WHERE sessionId = ?", [data.email, sessionid]);

        return res.affectedRows;
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function UpdateProfileImage(data){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("UPDATE users SET profileImage = ? WHERE id = ?", [data.image, data.id]);

        return res.affectedRows;
    }catch(err){
        console.log(err)
        throw err;
    }
}

export async function ChangePassword(newpass, sessionId){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("UPDATE users u JOIN login_sessions ls ON ls.email = u.email AND u.password = ls.password SET u.password = ?, ls.password = ? WHERE ls.sessionId = ?", [newpass, newpass, sessionId]);

        return res.affectedRows;
    }catch(err){
        console.log(err)
        throw err;
    }
}

export async function DeleteAccount(sessionid){
    try{
        let conn = await DBconnection();

        // let [res] = await conn.execute("DELETE u, ls FROM users u JOIN login_sessions ls ON ls.email = u.email AND ls.password = u.password WHERE ls.sessionId = ?", [sessionid]);

        // if(res.affectedRows){
            let [img] = await conn.execute("SELECT profileImage FROM users u JOIN login_sessions ls ON ls.email = u.email AND ls.password = u.password WHERE ls.sessionId = ?", [sessionid]);
        // }

        return img[0];
    }catch(err){
        console.log(err)
        throw err;
    }
}