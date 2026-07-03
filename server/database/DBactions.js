import DBconnection from "./DBconnection.js";

export async function InsertSession(sessionid, userId){
    try{
        let conn = await DBconnection();

        await conn.execute("INSERT INTO login_sessions (sessionId, userId) VALUES (?, ?)", [sessionid, userId]);

        return;
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function InsertUser(data){
    try{
        let conn = await DBconnection();

        let [check] = await conn.execute("SELECT id FROM users WHERE email = ?", [data.email]);
        if(check.length > 0){
            return false;
        }

        let [res] = await conn.execute("INSERT INTO users (firstName, lastName, email, password, profileImage, lastUpdate) VALUES (?, ?, ?, ?, ?, NOW())", [data.firstName ?? "", data.lastName ?? "", data.email ?? "", data.password ?? "", data.profileImage ?? ""]);

        return res.insertId;
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function CheckUser(email){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("SELECT id, email, password FROM users WHERE email = ?", [email]);

        return res[0];
    }catch(err){
        console.log(err);
        throw err;
    }
}

export async function GetUser(sessionId){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("SELECT u.id, u.firstName, u.lastName, u.email, u.profileImage, u.lastUpdate FROM users u JOIN login_sessions ls ON ls.userId = u.id WHERE ls.sessionId = ?", [sessionId]);

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

        let [res] = await conn.execute("UPDATE users u JOIN login_sessions ls ON ls.userId = u.id SET u.firstName = ?, u.lastName = ?, u.email = ?, u.lastUpdate = NOW() WHERE u.id = ? AND ls.sessionId = ?", [data.firstName, data.lastName,  data.email, data.id, sessionid]);

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

        let [res] = await conn.execute("UPDATE users u JOIN login_sessions ls ON ls.userId = u.id SET u.password = ? WHERE ls.sessionId = ?", [newpass, sessionId]);

        return res.affectedRows;
    }catch(err){
        console.log(err)
        throw err;
    }
}

export async function DeleteAccount(sessionid){
    try{
        let conn = await DBconnection();

        let [res] = await conn.execute("DELETE u, ls FROM users u JOIN login_sessions ls ON ls.userId = u.id WHERE ls.sessionId = ?", [sessionid]);

        return res.affectedRows;
    }catch(err){
        console.log(err)
        throw err;
    }
}