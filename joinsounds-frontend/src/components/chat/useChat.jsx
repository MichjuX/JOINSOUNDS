import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";

const useChat = (currentUserId, otherUserId) => {
  const [messages, setMessages] = useState([]);
  const stompClientRef = useRef(null);

  // 🔹 1. Pobierz historię czatu z backendu REST
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/public/history/${currentUserId}/${otherUserId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Błąd pobierania historii:", err);
      }
    };

    if (currentUserId && otherUserId) {
      fetchHistory();
    }
  }, [currentUserId, otherUserId]);

  // 🔹 2. WebSocket nasłuchuje na nowe wiadomości
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe("/topic/chat", (payload) => {
          const msg = JSON.parse(payload.body);
          if (
            (msg.sender.id === currentUserId && msg.receiver.id === otherUserId) ||
            (msg.sender.id === otherUserId && msg.receiver.id === currentUserId)
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        });
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [currentUserId, otherUserId]);

  // 🔹 3. Funkcja wysyłania
  const sendMessage = (content) => {
    if (stompClientRef.current && content.trim() !== "") {
      stompClientRef.current.publish({
        destination: "/app/chat.sendMessage",
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: otherUserId,
          content,
        }),
      });
    }
  };

  return { messages, sendMessage };
};

export default useChat;
