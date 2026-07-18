import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";

let envPath = path.join(import.meta.dirname, "../.env");
dotenv.config({
    path: envPath
});

async function DBsetup(params) {
    try{
        let conn = await mysql.createConnection({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD
        });

        await conn.query("CREATE DATABASE IF NOT EXISTS authentication_system_db");
        await conn.query("USE authentication_system_db");

        await conn.query(`CREATE TABLE IF NOT EXISTS users (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                firstName VARCHAR(20),
                                lastName VARCHAR(20),
                                email VARCHAR(50),
                                password VARCHAR(62),
                                profileImage VARCHAR(100),
                                lastUpdate DATETIME
        )`);

        await conn.query(`CREATE TABLE IF NOT EXISTS login_sessions (
                                sessionId VARCHAR(20) PRIMARY KEY,
                                userId INT,
                                expireAt DATETIME
        )`);

        await conn.execute(`CREATE TABLE IF NOT EXISTS activity_logger (
                                id INT AUTO_INCREMENT PRIMARY KEY,
                                user_id INT,
                                event_type VARCHAR(20),
                                status VARCHAR(10),
                                created_at DATETIME,
                                CONSTRAINT log_status CHECK (status IN ('success', 'failed'))
        )`);

        console.log("Database setup");
        await conn.end();
    }catch(err){
        console.log("failed to setup database ", err);
    }
}

DBsetup();