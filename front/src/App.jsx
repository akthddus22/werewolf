import React, { useCallback, useRef, useState, useEffect } from "react";

import { socket, SocketContext, SOCKET_EVENT } from "./service/socket";
import NicknameForm from "./components/NicknameForm";
import ChatRoom from "./components/chatRoom";
import StartButton from "./components/startButton";
import UseAbility from "./components/useAbility";
import Vote from "./components/vote";
import "./App.css";

function App() {

  const prevNickname = useRef(null);
  const [nickname, setNickname] = useState("마송연");

  const [chatWidth, setChatWidth] = useState(1000);
  const [dragging, setDragging] = useState(false); // 드래그 여부 추적
  const [initialX, setInitialX] = useState(0); // 클릭 시 초기 X 좌표 저장

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

  const handleDividerClick = useCallback((e) => {
    setDragging(true); // 드래그 상태로 설정
    setInitialX(e.clientX); // 클릭 시 초기 X 좌표 저장
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (dragging) {
      const newWidth = chatWidth - e.clientX + initialX; // 현재 너비에서 이동 거리를 더하여 새로운 너비 계산
      const minWidth = 500; // 최소 너비 (500px로 설정)

      // 최소 너비 제한 조건 처리
      const clampedWidth = Math.max(minWidth, newWidth);

      setChatWidth(clampedWidth);
      setInitialX(e.clientX); // 현재 X 좌표 저장
    }
  }, [chatWidth, dragging, initialX]);

  const handleMouseUp = useCallback(() => {
    setDragging(false); // 드래그 상태 종료
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove); // 마우스 이동 이벤트 리스너 추가
    document.addEventListener("mouseup", handleMouseUp); // 마우스 업 이벤트 리스너 추가

    return () => {
      document.removeEventListener("mousemove", handleMouseMove); // 컴포넌트 언마운트 시 이벤트 리스너 제거
      document.removeEventListener("mouseup", handleMouseUp); // 컴포넌트 언마운트 시 이벤트 리스너 제거
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <div>
    <SocketContext.Provider value={socket}>
      <div id="rightscreen" style={{ width: chatWidth }}>
        <div className="divider" onMouseDown={handleDividerClick}>
        </div>
        <div className="chatbox">
          <NicknameForm handleSubmitNickname={handleSubmitNickname} />
          <ChatRoom nickname={nickname}/>
        </div>
      </div>
    <StartButton nickname={nickname}/>
    </SocketContext.Provider>
    <UseAbility>aa</UseAbility>
    <Vote>aa</Vote>
    </div>
  );
}

export default App;