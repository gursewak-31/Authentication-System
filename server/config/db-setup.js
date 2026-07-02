import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({
    path: "./Authentication-System/server/.env"
});

async function DBsetup(params) {
    try{
        let conn = await mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD
        });

        await conn.execute("CREATE DATABASE IF NOT EXISTS authentication_system_db");
        await conn.execute("USE authentication_system_db");

        await conn.execute(`CREATE IF NOT EXISTS TABLE users (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                firstName VARCHAR(20),
                                lastName VARCHAR(20),
                                email VARCHAR(50),
                                password VARCHAR(62),
                                profileImage VARCHAR(100),
                                lastUpdate DATETIME
        )`);

        await conn.execute(`CREATE IF NOT EXISTS TABLE login_sessions (
                                sessionId VARCHAR(20) PRIMARY KEY,
                                email VARCHAR(50),
                                password VARCHAR(62)
        )`);               

        console.log("Database setup");
        await conn.end();
    }catch(err){
        console.log("failed to setup database ", err);
    }
}

DBsetup();