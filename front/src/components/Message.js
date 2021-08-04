import React from 'react';
function Message(props) {
  const { idx, username, message } = props;

  return (
    <li
      key={idx}
      className={
        message.type === 'JOIN' || message.type === 'LEAVE'
          ? 'event-message'
          : message.sender === username
          ? 'chat-message-right'
          : 'chat-message'
      }
    >
      {message.type === 'JOIN' || message.type === 'LEAVE' ? (
        <p>{`${message.sender} ${
          message.type === 'JOIN' ? 'joined' : 'left'
        }!`}</p>
      ) : (
        <>
          <span>{message.sender}</span>
          <p>{message.content}</p>
        </>
      )}
    </li>
  );
}

export default Message;
