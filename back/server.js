const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const socketio = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});
const socket = require("./src/socket/index");

const port = 4000;

app.use(cors({ origin: "http://localhost:3000", credentials: true}));
socket(socketio);

server.listen(port, () => {
    console.log("Server is Running");
});