import styled from "styled-components";
import React, { useState, useCallback, useContext } from "react";
import { SocketContext, SOCKET_EVENT } from "./../service/socket";

function StartButton({ nickname }) {
    const socket = useContext(SocketContext);

    const send = useCallback(() => {
        socket.emit(SOCKET_EVENT.START_GAME, { nickname });
    })

    return <StyledButton onClick={send}>Start</StyledButton>;
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

export default StartButton;