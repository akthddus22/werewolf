const SOCKET_EVENT = {
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

const NIGHT_JOB = {
    WEREWOLF: "NIGHT_WEREWOLF",
    ORACLE: "NIGHT_ORACLE",
    ROBBER: "NIGHT_ROBBER",
    TROUBLEMAKER: "NIGHT_TROUBLEMAKER",
    CITIZEN: "NIGHT_CITIZEN",
    NULL: "NIGHT_NULL",
}

const DAY_JOB = {
    WEREWOLF: "DAY_WEREWOLF",
    ORACLE: "DAY_ORACLE",
    ROBBER: "DAY_ROBBER",
    TROUBLEMAKER: "DAY_TROUBLEMAKER",
    CITIZEN: "DAY_CITIZEN",
    NULL: "DAY_NULL",
}

const WEREWOLF_TEAM = {
    WEARWOLF: "DAY_WEREWOLF",
}

const three_players = []
const four_players = []
const five_players = []

function day_parsing(job) { return job.split("_")[1] };
function day_job(job) { return "DAY_"+day_parsing(job) };
function night_job(job) { return "NIGHT_"+day_parsing(job) };

function system_message(msg) {
    return {
        prevNickname: "SYSTEM",
        nickname: "SYSTEM",
        content: msg,
        type: SOCKET_EVENT.SEND_MESSAGE,
        time: new Date(),
    };
} 



module.exports = function(socketio) {

    // 서버 전체에서 처리해야 하는 변수를 선언.
    let is_gaming = false;
    let id_socket = new Map();
    let id_nickname = new Map();
    let id_night = new Map();
    let id_day = new Map();
    let vote_map = new Map();
    
    let robber_turn = false;
    let troublemaker_turn = false;
    let oracle_turn = false;
    let vote_turn = false;

    let turn_time = 30000;


    socketio.on("connection", function (socket) {

        const roomName = "room 1";
        console.log("socket connection succeeded");
        id_socket.set(socket.id, socket);

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

            //id_socket.forEach((v, k) => {console.log(k)});
        });

        socket.on(SOCKET_EVENT.UPDATE_NICKNAME, requestData => {
            if (Array.from(id_nickname.values()).includes(requestData.nickname)) {
                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `You cannot make duplicated nickname.`
                ));
                socket.emit(SOCKET_EVENT.REQUEST_REJECT, {});
            } else if (is_gaming) {
                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `You cannot change nickname while game is running.`
                ));
                socket.emit(SOCKET_EVENT.REQUEST_REJECT, {});
            } else {
                const responseData = {
                    ...requestData,
                    type: SOCKET_EVENT.UPDATE_NICKNAME,
                    time: new Date(),
                };
                socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
                id_nickname.set(socket.id, requestData.nickname);
                console.log(id_nickname);
                console.log(`${SOCKET_EVENT.UPDATE_NICKNAME} is fired with data: ${JSON.stringify(responseData)}`);
                socket.emit(SOCKET_EVENT.REQUEST_ADMIT, {});
            }
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

        // 투표
        socket.on(SOCKET_EVENT.VOTE, ({id}) => {
            console.log(`${id} got voted.`);
            if (vote_turn) {
                if (vote_map.has(id)) {
                    vote_map.set(id, vote_map.get(id)+1);
                } else {
                    vote_map.set(id, 1);
                }
            } else {
                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `Not Voting time.`
                ));
            }
        });
        // 투표

        // 직업
        socket.on(SOCKET_EVENT.ROBBER, ({id}) => {
            if (robber_turn) {
                console.log(`Robber ability used.`);
                let job = id_day.get(id);
                let robber_job = id_day.get(socket.id);
                id_day.set(socket.id, job);
                id_day.set(id, robber_job);

                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `The Job was ${ job }.`
                ));}
            else {
                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `It is not your turn.`
                ));
            }
        });

        socket.on(SOCKET_EVENT.TROUBLEMAKER, ({id_list}) => {
            if (troublemaker_turn) {
                console.log(`Troublemaker ability used.`);
                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `Troublemaker ability used.`
                ));
                let job1 = id_day.get(id_list[0]);
                let job2 = id_day.get(id_list[1]);
                id_day.set(id_list[0], job2);
                id_day.set(id_list[1], job1);}
            else {
                socket.emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `It is not your turn.`
                ));
            }
        });

        // 직업

        socket.on(SOCKET_EVENT.START_GAME, requestData => {

            const nickname = requestData.nickname;
            const user_num = id_socket.size;
            const user_lower_bound = 3;
            const user_upper_bound = 5;

            if (is_gaming) { // If game is already running, you can't start the game.
                const responseData = {
                    prevNickname: "SYSTEM",
                    nickname: "SYSTEM",
                    content: "Game is already running",
                    type: SOCKET_EVENT.SEND_MESSAGE,
                    time: new Date(),
                };
                socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);

            } else if (user_num < user_lower_bound || user_num > user_upper_bound) { // To start the game, there should be at least 3 players.
                const responseData = {
                    prevNickname: "SYSTEM",
                    nickNAME: "SYSTEM",
                    content: `The game needs at least ${ user_lower_bound } players. Maximum ${ user_upper_bound } But only have ${ user_num } players.`,
                    type: SOCKET_EVENT.SEND_MESSAGE,
                    time: new Date(),
                };
                socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
            } else if (id_nickname.size != user_num) {
                socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `Cannot start the game if there are one or more player who have default nickname.`
                ));
            } else  {
                is_gaming = true;

                //Send System Message
                const responseData = {
                    prevNickname: "SYSTEM",
                    nickNAME: "SYSTEM",
                    content: `The game started with ${ user_num } players.`,
                    type: SOCKET_EVENT.SEND_MESSAGE,
                    time: new Date(),
                };
                socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData)
                console.log(`${nickname} started the game. User num is ${ user_num }`);

                // Make array which contains usable job on the game
                let usable_job = [NIGHT_JOB.WEREWOLF, NIGHT_JOB.WEREWOLF, NIGHT_JOB.ORACLE, NIGHT_JOB.ROBBER, NIGHT_JOB.TROUBLEMAKER, NIGHT_JOB.CITIZEN];
                switch (user_num) {
                    case 4:
                        usable_job.push(NIGHT_JOB.CITIZEN);
                        break;
                    case 5:
                        usable_job.push(NIGHT_JOB.CITIZEN);
                        usable_job.push(NIGHT_JOB.CITIZEN);
                        break;
                }

                // Sort jobs randomly. First 3 elements will be hidden job.                
                usable_job.sort(() => Math.random() - 0.5);

                // 플레이어들에게 직업 랜덤 배분 후 시스템 메세지.
                var index = 0;
                id_socket.forEach((v, k) => {
                    let job = usable_job[index+3];
                    //console.log(job); //
                    //console.log(socket); //
                    //console.log(v); //

                    id_night.set(k, job);
                    id_day.set(k, day_job(job));

                    v.join(job);

                    let responseData = {
                        prevNickname: "SYSTEM",
                        nickname: "SYSTEM",
                        content: `Your job is ${ job }.`,
                        type:SOCKET_EVENT.SEND_MESSAGE,
                        TIME: new Date(),
                    }
                    socketio.to(job).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);

                    console.log(id_nickname);
                    let id_nickname_array = Array.from(id_nickname, ([id, nickname]) => ({ id, nickname }));
                    console.log(id_nickname_array);
                    let responseData2 = {
                        job: job,
                        data: id_nickname_array,
                    }
                    socketio.to(job).emit(SOCKET_EVENT.JOIN_JOB, responseData2);

                    index += 1;
                });
                // 직업 배분 완료. 밤 시작.
                // 첫 번째 순서: 늑대인간
                // 늑대인간들에게 늑대인간의 정체를 알려준다.
                let werewolf_list = "";
                id_night.forEach((v,k) => {
                    if (v == NIGHT_JOB.WEREWOLF) {
                        werewolf_list += (id_nickname.get(k)+" ");
                    }
                });
                socketio.to(NIGHT_JOB.WEREWOLF).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `WEREWOLVES are ${ werewolf_list }.`
                ));
                // 두 번째 순서: 예언자
                // 사용되지 않은 직업 세 가지 중 하나를 알 수 있다.
                socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `ORACLE turn started.`
                ));
                socket.on(SOCKET_EVENT.ORACLE, requestData => {
                });
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `ORACLE turn ended.`
                    ));
                    socket.removeAllListeners(SOCKET_EVENT.ORACLE);
                }, 1 * turn_time);
                // 세 번째 순서: 강도
                // 플레이어를 하나 골라 그 사람과 직업을 바꾼다. 그 뒤 가져온 직업을 확인한다.
                setTimeout(function() {socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                    `ROBBER turn started.`
                    ));
                    robber_turn = true;
                }, 1 * turn_time);
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `ROBBER turn ended.`
                    ));
                    robber_turn = false;
                }, 2 * turn_time);

                // 네 번째 순서: 말썽쟁이
                // 자신을 제외한 플레이어를 둘 골라 서로 직업을 바꾼다.
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `TROUBLEMAKER turn started.`
                    ));
                    troublemaker_turn = true;
                }, 2 * turn_time);
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `TROUBLEMAKER turn ended.`
                    ));
                    troublemaker_turn = false;
                }, 3 * turn_time);

                // 낮 시간
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `Day time started.`
                    ));
                }, 3 * turn_time);
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `Day time ended.`
                    ));
                }, 13 * turn_time);

                // 투표
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `Vote started.`
                    ));
                    let id_nickname_array = Array.from(id_nickname, ([id, nickname]) => ({ id, nickname }));
                    socketio.to(roomName).emit(SOCKET_EVENT.VOTE_START, {data: id_nickname_array});
                    vote_turn = true;
                }, 13 * turn_time);
                setTimeout(function() {
                    socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                        `Vote ended.`
                    ));
                    vote_turn = false;

                    let max_vote = 0;
                    let voted_id = [];

                    vote_map.forEach((v, k) => {
                        if (v > max_vote) { max_vote = v; }
                    });
                    vote_map.forEach((v, k) => {
                        if (v == max_vote) { voted_id.push(k); }
                    });

                    voted_id.forEach(id => {
                        socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                            `${id_nickname.get(id)} died.\n` + `He was ${id_day.get(id)}.`
                        ));
                    });

                    let werewolf_won = true;
                    voted_id.forEach(id => {
                        if (Object.values(WEREWOLF_TEAM).includes(id_day.get(id))) {
                            werewolf_won = false;
                        }
                    });

                    let won = [];
                    if (werewolf_won) {
                        id_nickname.forEach((v,k) => {
                            if (Object.values(WEREWOLF_TEAM).includes(id_day.get(k))) {
                                won.push(id_nickname.get(k));
                            }
                        });
                    } else {
                        id_nickname.forEach((v,k) => {
                            if (!Object.values(WEREWOLF_TEAM).includes(id_day.get(k))) {
                                won.push(id_nickname.get(k));
                            }
                        });
                    }
                    won.forEach(nickname => {
                        socketio.to(roomName).emit(SOCKET_EVENT.RECEIVE_MESSAGE, system_message(
                            `${nickname} won the game.`
                        ));
                    });


                    socketio.to(roomName).emit(SOCKET_EVENT.END_GAME, []);
                    is_gaming = false;
                    id_day = new Map();
                    id_night = new Map();

                }, 15 * turn_time);
        }

        });
    })}