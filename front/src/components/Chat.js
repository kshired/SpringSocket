import React, { useState, useRef } from 'react';
import * as StompJs from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import Message from './Message';

function Chat() {
  const client = useRef();
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);
  const [username, setUsername] = useState('');
  const [start, setStart] = useState(false);

  const startConnection = () => {
    connect();
    setStart(true);

    return () => disconnect();
  };

  const connect = () => {
    client.current = new StompJs.Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        subscribe();
        addUser();
      },
    });

    client.current.activate();
  };

  const disconnect = () => {
    client.current.deactivate();
  };

  const subscribe = () => {
    client.current.subscribe(`/topic/public`, ({ body }) => {
      const message = JSON.parse(body);

      setChatMessages((_chatMessages) => {
        return [..._chatMessages, message];
      });
    });
  };

  const addUser = () => {
    if (!client.current.connected) {
      return;
    }
    client.current.publish({
      destination: '/app/chat.addUser',
      body: JSON.stringify({
        sender: username,
        content: '',
        type: 'JOIN',
      }),
    });

    setMessage('');
  };

  const publish = () => {
    if (!client.current.connected) {
      return;
    }
    client.current.publish({
      destination: '/app/chat.sendMessage',
      body: JSON.stringify({
        sender: username,
        content: message,
        type: 'CHAT',
      }),
    });

    setMessage('');
  };

  return (
    <>
      {start === false ? (
        <div id="username-page">
          <div className="username-page-container">
            <h1 className="title">username을 입력하세요</h1>
            <form id="usernameForm" name="usernameForm">
              <div className="form-group">
                <input
                  type="text"
                  id="name"
                  placeholder="Username"
                  autoComplete="off"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="form-group">
                <button
                  className="accent username-submit"
                  onClick={(e) => {
                    e.preventDefault();
                    if (username.length === 0) {
                      alert('username length must be greater than 0');
                      return;
                    }
                    startConnection();
                  }}
                >
                  채팅 시작하기
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div id="chat-page">
          <div className="chat-container">
            <div className="chat-header">
              <h2>Spring + React Chat</h2>
            </div>
            {connected ? null : <div className="connecting">연결중</div>}
            <ul id="messageArea">
              {chatMessages.map((chatMessage, idx) => (
                <Message
                  key={idx}
                  idx={idx}
                  message={chatMessage}
                  username={username}
                />
              ))}
            </ul>
            <form id="messageForm" name="messageForm">
              <div className="form-group">
                <div className="input-group clearfix">
                  <input
                    type="text"
                    id="message"
                    placeholder="Type a message..."
                    autoComplete="off"
                    className="form-control"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                  <button
                    className="primary"
                    onClick={(e) => {
                      e.preventDefault();
                      publish();
                    }}
                  >
                    보내기
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Chat;
