import http from 'http';
import formidable from 'formidable';
import path from "path";
import fs from "fs";
import crypto from "crypto";
import dotenv from "dotenv";
import router from './router.js';

const sessions = {};

dotenv.config();
const port = process.env.PORT;

let server = http.createServer( async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    router(req, res);
});

server.listen(port, () => console.log("server start"));