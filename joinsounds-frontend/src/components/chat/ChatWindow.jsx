import React, { useState } from "react";
import useChat from "./useChat";

function ChatWindow({ currentUserId, otherUserId, onClose }) {
  const { messages, sendMessage } = useChat(currentUserId, otherUserId);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Chat</h3>
        <button onClick={onClose}>X</button>
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-message ${
              m.sender.id === currentUserId ? "sent" : "received"
            }`}
          >
            <span>{m.content}</span>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
