import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let conn = null;
export default async function DBconnection(params) {
    try{
        if(!conn){
            conn = await mysql.createConnection({
                host: process.env.HOST,
                user: process.env.USER,
                database: process.env.DATABASE,
                password: process.env.PASSWORD
            });
        }

        console.log("connected to Database");
        return conn;
    }catch(err){
        console.log("failed to connect database ", err);
    }
}
