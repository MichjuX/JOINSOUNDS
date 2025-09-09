import React, { useState, useEffect, useRef } from "react";
import joinsoundsSquare from "../../assets/images/JOINSOUNDS_square.png";
import "./ChatWindow.css";

const ChatWindow = ({ currentUser, otherUser, messages = [], sendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // przewijanie do najnowszej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (newMessage.trim() === "") return;

    sendMessage({
      senderId: currentUser.id,
      recipientId: otherUser.id,
      content: newMessage.trim(),
    });

    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-window">
      {/* Główny nagłówek */}
      <div className="chat-header">
        <div className="chat-user-info">
          <img
            src={otherUser.profilePictureUrl || joinsoundsSquare}
            alt={otherUser.username}
            className="chat-avatar"
          />
          <span className="chat-username">{otherUser.username}</span>
        </div>
        <button className="chat-close-btn" onClick={onClose}>
          ✖
        </button>
      </div>

      {/* Wiadomości */}
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isMine = msg.sender.id === currentUser.id;
            const sender = isMine ? currentUser : otherUser;

            return (
              <div key={idx} className={`chat-message ${isMine ? "mine" : "theirs"}`}>
                {!isMine && (
                  <img
                    src={sender.profilePictureUrl || joinsoundsSquare}
                    alt={sender.username}
                    className="message-avatar"
                  />
                )}
                <div className="message-content">
                  {!isMine && <span className="message-username">{sender.username}</span>}
                  <p>{msg.content}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-messages">No messages yet</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
        />
        <button onClick={handleSend} className="send-btn">
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
