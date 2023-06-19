import styled from "styled-components";
import React, { useState, useCallback, useEffect } from 'react';
import Modal from 'react-modal';
import { socket, SocketContext, SOCKET_EVENT } from "./../service/socket";

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

function UseAbility() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [id_nickname, set_id_nickname] = useState([]);
  const [job, set_job] = useState("");

  

  

  let id_list = [];
  const ability = ({job, id}) => {
    switch (job) {
      case NIGHT_JOB.ROBBER:
        console.log(`Used robber ability.`);
        socket.emit(SOCKET_EVENT.ROBBER, {id: id});
        break;

      case NIGHT_JOB.TROUBLEMAKER:
        id_list.push(id);
        if (id_list.length == 2) {
          console.log(`Used troublemaker ability.`);
          socket.emit(SOCKET_EVENT.TROUBLEMAKER, {id_list: id_list});
          id_list = [];
        }
        break;

      default:
        console.log(`Used none ability.`);
        break;
    }
  }

  const handleJobReceive = ({job, data}) => {
    set_id_nickname(data);
    set_job(job);
    console.log(`Your job is ${job}.`);
    console.log("obj: %o", data);

    socket.removeAllListeners(SOCKET_EVENT.JOIN_JOB);
  };

  useEffect(() => {
    socket.on(SOCKET_EVENT.JOIN_JOB, handleJobReceive);
    return (() => {})
  }, [socket, handleJobReceive]);

  /*{for (let key of id_nickname.keys()) {
    return (
      <div>
        <StyledButton onClick={handler(id)}>{nickname}</StyledButton>
      </div>
    );
  }}*/

  
  return (
    <>
    <StyledButton onClick={()=> setModalIsOpen(true)}>Modal Open</StyledButton>
  
	  <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
      
        {id_nickname.map((obj) => {
          return (
            <StyledButton onClick={() => ability({job: job, id: obj.id})}>{obj.nickname}</StyledButton>
          );
        })}
      
    </Modal>
    
    </>
  );
}

const StyledButton = styled.button`
  margin: 0;
  border: none;
  cursor: pointer;
  font-family: "Noto Sans KR", sans-serif;
  font-size: var(--button-font-size, 1rem);
  padding: var(--button-padding, 12px 16px);
  border-radius: var(--button-radius, 8px);
  background: var(--button-bg-color, #0d6efd);
  color: var(--button-color, #ffffff);

  &:active,
  &:hover,
  &:focus {
    background: var(--button-hover-bg-color, #025ce2);
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
    background: var(--button-bg-color, #025ce2);
  }
`;

export default UseAbility;