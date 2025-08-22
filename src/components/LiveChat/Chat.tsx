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

type ChatProps = {
  sessionId: string;
  userId: number;
  senderRole: "User" | "Admin" | "SuperAdmin";
  senderName: string;
};

const Chat: React.FC<ChatProps> = ({
  sessionId,
  userId,
  senderRole,
  senderName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const socketRef = useRef<Socket<DefaultEventsMap, DefaultEventsMap> | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = io("http://localhost:5000", { transports: ["websocket"] });
    socketRef.current = socket;
  
    socket.emit("joinSession", { userName: "test", userId: "admin-001", sessionId });
  
    socket.off("receiveMessage").on("receiveMessage", (message: ChatMessage) => {
      // Prevent adding duplicate if same sender and timestamp already exists
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) =>
            m.createdAt === message.createdAt &&
            m.senderId === message.senderId &&
            m.message === message.message
        );
        return alreadyExists ? prev : [...prev, message];
      });
    });
  
    return () => {
      socket.off("receiveMessage");
      socket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
  
    const newMessage: ChatMessage = {
      sessionId,
      senderId: userId,
      senderRole,
      senderName,
      message: input,
      type: "text",
      createdAt: new Date().toISOString(),
    };
  
    // Emit to server
    socketRef.current?.emit("sendMessage", newMessage);
  
    // Immediately add own message to UI (since server won't send back to us)
    setMessages((prev) => [...prev, newMessage]);
  
    setInput("");
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => {
          const isSender = msg.senderId === userId;
          return (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: isSender ? "flex-end" : "flex-start",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  background: isSender ? "#DCF8C6" : "#FFF",
                  color: "#000",
                  padding: "8px 12px",
                  borderRadius: "12px",
                  maxWidth: "60%",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "0.8rem", color: "#555" }}>
                  {msg.senderName}
                </div>
                <div>{msg.message}</div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#888",
                    textAlign: "right",
                  }}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputContainer}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button style={styles.button} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  chatContainer: {
    width: "400px",
    height: "500px",
    border: "1px solid #e0e7ff",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(180deg, #f9fbff 0%, #eef3ff 100%)",
  },
  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    background: "transparent",
  },
  inputContainer: {
    display: "flex",
    borderTop: "1px solid #ccc",
  },
  input: {
    flex: 1,
    border: "none",
    padding: "10px",
    outline: "none",
  },
  button: {
    border: "none",
    background: "#4CAF50",
    color: "#fff",
    padding: "10px 15px",
    cursor: "pointer",
  },
};

export default Chat;
