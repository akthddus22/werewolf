import React, { useCallback, useRef, useState, useEffect } from "react";

import { socket, SocketContext, SOCKET_EVENT } from "./service/socket";
import NicknameForm from "./components/NicknameForm";
import ChatRoom from "./components/chatRoom";

function App() {

  const prevNickname = useRef(null);
  const [nickname, setNickname] = useState("마송연");

  /*useEffect(() => {
    return () => {
      socket.disconnect();
    }
  }, []);*/

  useEffect(() => {
    if (prevNickname.current) {
      socket.emit(SOCKET_EVENT.UPDATE_NICKNAME, {
        prevNickname: prevNickname.current,
        nickname,
      });
    } else {
      socket.emit(SOCKET_EVENT.JOIN_ROOM, { nickname });
    }
  }, [nickname]);

  const handleSubmitNickname = useCallback(newNickname => {
    prevNickname.current = nickname;
    setNickname(newNickname);
  }, [nickname]);
  
  return (
    <SocketContext.Provider value={socket}>
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <NicknameForm handleSubmitNickname={handleSubmitNickname} />
        <ChatRoom nickname={nickname}/>
      </div>
    </SocketContext.Provider>
  );
}

export default App;