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

function Vote() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [id_nickname, set_id_nickname] = useState([]);
  const [voted, set_voted] = useState(false);

  const vote = ({id}) => {
    if (voted) {
        console.log(`You voted already.`);
    } else {
        socket.emit(SOCKET_EVENT.VOTE, {id});
        set_voted(true);
    }
  };
  socket.on(SOCKET_EVENT.END_GAME, () => {
    set_voted(false);
  });
  socket.on(SOCKET_EVENT.VOTE_START, ({data}) => {
    set_id_nickname(data);
    set_voted(false);
  });

  
  return (
    <>
    <StyledButton onClick={()=> setModalIsOpen(true)}>Modal Open</StyledButton>
  
	  <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)}>
      
        {id_nickname.map((obj) => {
          return (
            <StyledButton onClick={() => vote({id: obj.id})}>{obj.nickname}</StyledButton>
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

export default Vote;