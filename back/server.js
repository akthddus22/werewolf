const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
const socketio = require("socket.io")(server, {cors: {credentials: true}});
const socket = require("./src/socket/index");

const port = 4000;

//app.use(cors({ origin: "http://localhost:3000", credentials: true}));
app.set("port", port);
app.use(cors({credentials: true}));
socket(socketio);

server.listen(port, () => {
    console.log("Server is Running");
});