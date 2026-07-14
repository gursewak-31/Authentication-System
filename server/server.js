import http from 'http';
import dotenv from "dotenv";
import router from './router.js';
import path from 'path';
import authMiddleware from './middleware/auth_middleware.js';

const sessions = {};

let envPath = path.join(import.meta.dirname, "/.env");
dotenv.config({
    path: envPath
});
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

    authMiddleware(req, res, () => router(req, res));
});

server.listen(port, () => console.log("server start"));