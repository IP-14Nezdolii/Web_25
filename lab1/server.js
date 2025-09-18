import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { doServer } from "./connection.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __indexPath = path.resolve(__dirname, "public", "index.html");
const PORT = 8080;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const rooms = new Map();

app.get("/page", (_, res) => {
    fs.readFile(__indexPath, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error loading page");
        }
        res.setHeader("Content-Type", "text/html");
        res.send(data);
    });
});

wss.on("connection", (ws) => {
    console.log("🔗 New connection");
    doServer(wss, ws, rooms);
});

server.listen(PORT, () => {
    console.log(`Server page: http://localhost:${PORT}/page`);
});


