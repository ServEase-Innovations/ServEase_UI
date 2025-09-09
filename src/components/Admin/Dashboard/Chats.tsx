/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { DefaultEventsMap } from "@socket.io/component-emitter";

type ChatMessage = {
  createdAt: string;
  sessionId: string;
  senderId: number;
  senderRole: "User" | "Admin" | "SuperAdmin";
  senderName: string;
  message: string;
  type: "text" | "image" | "file";
};

const Chat: React.FC = () => {
  const userId = 2;
  const senderRole: "User" | "Admin" = "Admin";
  const senderName = "RonitMaity";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(null);
  const chatStartedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Connect socket once on mount
  useEffect(() => {
    const socket = io("https://payments-j5id.onrender.com", { transports: ["websocket"] });
    socketRef.current = socket;

    // Join admin room
    socket.emit("joinAdminRoom", { userName: "RonitMaity", userId: "admin-001" });

    // Update chat list
    socket.on("updateChatList", (sessions) => {
      setChatList(sessions);
    });

    // New chat alert
    socket.on("newChatAlert", (data) => {
      if (window.confirm(`📢 New chat from ${data.from}: "${data.preview}"`)) {
        // Add chat to chat list if not already present
        setChatList((prev) => {
          const exists = prev.some((c) => c.sessionId === data.sessionId);
          if (exists) return prev;
          return [
            ...prev,
            {
              sessionId: data.sessionId,
              userName: data.from,
              lastMessage: data.preview,
            },
          ];
        });
    
        // Auto-open the chat
        openChat(data.sessionId);
      }
    });

    // Receive messages for selected session
    socket.on("receiveMessage", (message: ChatMessage) => {
      if (message.sessionId === selectedSession) {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) =>
              m.createdAt === message.createdAt &&
              m.senderId === message.senderId &&
              m.message === message.message
          );
          return isDuplicate ? prev : [...prev, message];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedSession]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Open chat & join its session
  const openChat = React.useCallback((sessionId: string) => {
    setSelectedSession(sessionId);
    setMessages([]);
    
    // Only start chat if not already in this session
    if (!chatStartedRef.current) {
      socketRef.current?.emit("startChat", {
        sessionId,
        fromId: userId,
        fromName: senderName,
      });
      chatStartedRef.current = true;
    }
  
    socketRef.current?.emit("joinSession", {
      sessionId,
      userName: senderName,
      userId: "admin-001",
      role: "admin",
    });
  }, []);

  // Send a message
  const sendMessage = () => {
    if (!input.trim() || !selectedSession) return;
  
    const newMessage: ChatMessage = {
      sessionId: selectedSession,
      senderId: userId,
      senderRole,
      senderName,
      message: input.trim(),
      type: "text",
      createdAt: new Date().toISOString(),
    };
  
    socketRef.current?.emit("sendMessage", newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Left Panel */}
      <div style={{ width: "300px", borderRight: "1px solid #ccc", overflowY: "auto" }}>
        {chatList.map((chat) => (
          <div
            key={chat.sessionId}
            onClick={() => openChat(chat.sessionId)}
            style={{
              padding: "10px",
              cursor: "pointer",
              background: selectedSession === chat.sessionId ? "#f0f0f0" : "white",
            }}
          >
            <b>{chat.userName}</b>
            <p>{chat.lastMessage}</p>
          </div>
        ))}
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, padding: "10px", display: "flex", flexDirection: "column" }}>
        {selectedSession ? (
          <>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {messages.map((m, i) => (
                <p key={i}>
                  <b>{m.senderName}:</b> {m.message}
                </p>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
              <input
                style={{ flex: 1, padding: "10px", border: "none", outline: "none" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                style={{ padding: "10px 15px", background: "#4CAF50", color: "white", border: "none" }}
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p>Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
