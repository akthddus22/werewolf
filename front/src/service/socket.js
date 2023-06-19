import { createContext } from "react";
import socketIo from "socket.io-client";
import dayjs from "dayjs";

export const SOCKET_EVENT = {
    JOIN_ROOM: "JOIN_ROOM",
    UPDATE_NICKNAME: "UPDATE_NICKNAME",
    SEND_MESSAGE: "SEND_MESSAGE",
    RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
    REQUEST_ADMIT: "REQUEST_ADMIT",
    REQUEST_REJECT: "REQUEST_REJECT",
    START_GAME: "START_GAME",
    JOIN_JOB: "JOIN_JOB",
    ORACLE: "ORACLE",
    ROBBER: "ROBBER",
    TROUBLEMAKER: "TROUBLEMAKER",
    VOTE_START: "VOTE_START",
    VOTE: "VOTE",
    END_GAME: "END_GAME",
};

export const NIGHT_JOB = {
    WEREWOLF1: "NIGHT_WEREWOLF1",
    WEREWOLF2: "NIGHT_WEREWOLF2",
    ORACLE: "NIGHT_ORACLE",
    ROBBER: "NIGHT_ROBBER",
    TROUBLEMAKER: "NIGHT_TROUBLEMAKER",
    CITIZEN1: "NIGHT_CITIZEN1",
    CITIZEN2: "NIGHT_CITIZEN2",
    CITIZEN3: "NIGHT_CITIZEN3",
    NULL: "NIGHT_NULL",
}

export const DAY_JOB = {
    WEREWOLF1: "DAY_WEREWOLF1",
    WEREWOLF2: "DAY_WEREWOLF2",
    ORACLE: "DAY_ORACLE",
    ROBBER: "DAY_ROBBER",
    TROUBLEMAKER: "DAY_TROUBLEMAKER",
    CITIZEN1: "DAY_CITIZEN1",
    CITIZEN2: "DAY_CITIZEN2",
    CITIZEN3: "DAY_CITIZEN3",
    NULL: "DAY_NULL",
}

export const socket = socketIo(String(process.env.REACT_APP_BACK_URL));
export const SocketContext = createContext(socket);
export let job = "";

export const makeMessage = pongData => {
    const { prevNickname, nickname, content, type, time } = pongData;

    let nicknameLabel;
    let contentLabel="";

    switch (type) {
        case SOCKET_EVENT.JOIN_ROOM: {
            contentLabel = `${nickname} has join the room.`;
            break;
        }
        case SOCKET_EVENT.UPDATE_NICKNAME: {
            contentLabel = `User's name has been changed.\n${prevNickname} => ${nickname}.`
            break;
        }
        case SOCKET_EVENT.SEND_MESSAGE: {
            contentLabel = String(content);
            nicknameLabel = nickname;
            break;
        }
        default:
    }

    return {
        nickname: nicknameLabel,
        content: contentLabel,
        time: dayjs(time).format("HH:mm"),
    }
}

socket.on("connect", () => {
  console.log("socket server connected.");
});

socket.on("disconnect", () => {
  console.log("socket server disconnected.");
});

socket.on(SOCKET_EVENT.JOIN_JOB, function (requestData) {
    job = requestData.j;
    console.log(job); //
});