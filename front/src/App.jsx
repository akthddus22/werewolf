import React, { useCallback, useRef, useState, useEffect } from "react";

import { socket, SocketContext, SOCKET_EVENT } from "./service/socket";
import NicknameForm from "./components/NicknameForm";
import ChatRoom from "./components/chatRoom";
import StartButton from "./components/startButton";
import UseAbility from "./components/useAbility";
import Vote from "./components/vote";

function App() {

  const prevNickname = useRef(null);
  const [nickname, setNickname] = useState("마송연");

  /*useEffect(() => {
    return () => {
      socket.disconnect();
    }
  }, []);*/

  /*useEffect(() => {
    if (prevNickname.current) {
      socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, {
        prevNickname: prevNickname.current,
        nickname,
      });
    } else {
      socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
    }
  }, [nickname]);*/

  useEffect(() => {
    if(!prevNickname.current) {
      socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
    }
  }, [nickname]);


  const handleSubmitNickname = useCallback(newNickname => {
    socket.on(SOCKET_EVENT.REQUEST_ADMIT, () => {
      prevNickname.current = newNickname;
      setNickname(newNickname);
      socket.removeAllListeners(SOCKET_EVENT.REQUEST_REJECT);
      socket.removeAllListeners(SOCKET_EVENT.REQUEST_ADMIT);
    });
    socket.on(SOCKET_EVENT.REQUEST_REJECT, () => {
      socket.removeAllListeners(SOCKET_EVENT.REQUEST_ADMIT);
      socket.removeAllListeners(SOCKET_EVENT.REQUEST_REJECT);
    });
    socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, {
      prevNickname: prevNickname.current,
      nickname: newNickname, //nickname,
    });
  }, [nickname]);
  
  return (
    <div>
    <SocketContext.Provider value={socket}>
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <NicknameForm handleSubmitNickname={handleSubmitNickname} />
        <ChatRoom nickname={nickname}/>
        <StartButton nickname={nickname}/>
      </div>
    </SocketContext.Provider>
    <UseAbility>aa</UseAbility>
    <Vote>aa</Vote>
    </div>
  );
}

export default App;