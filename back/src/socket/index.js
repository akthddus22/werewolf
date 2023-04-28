const SOCKET_EVENT = {
    JOIN_ROOM: "JOIN_ROOM",
    UPDATE_NICKNAME: "UPDATE_NICKNAME",
    SEND_MESSAGE: "SEND_MESSAGE",
    RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
};

module.exports = function(socketio) {
    socketio.on("connection", function (socket) {

        const roomName = "room 1";
        console.log("socket connection succeeded");

        socket.on("disconnect", reason => {
            console.log(`disconnect:${reason}`);
        });

        socket.on(SOCKET_EVENT.JOIN_ROOM, requestData => {
            socket.join(roomName);
            const responseData = {
                ...requestData,
                type: SOCKET_EVENT.JOIN_ROOM,
                time: new Date(),
            };

            socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
            console.log(`${SOCKET_EVENT.JOIN_ROOM} is fired with data:${JSON.stringify(responseData)}`);
        });

        socket.on(SOCKET_EVENT.UPDATE_NICKNAME, requestData => {
            const responseData = {
                ...requestData,
                type: SOCKET_EVENT.UPDATE_NICKNAME,
                time: new Date(),
            };
            socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
            console.log(`${SOCKET_EVENT.UPDATE_NICKNAME} is fired with data: ${JSON.stringify(responseData)}`);
        });

        socket.on(SOCKET_EVENT.SEND_MESSAGE, requestData => {
            const responseData = {
                ...requestData,
                type: SOCKET_EVENT.SEND_MESSAGE,
                time: new Date(),
            };
            socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
            console.log(`${SOCKET_EVENT.SEND_MESSAGE} is fired with data: ${JSON.stringify(responseData)}`);
        });

    });
}