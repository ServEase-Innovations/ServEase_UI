/* eslint-disable */
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

type UserType = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};

type Message = {
  _id?: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  chat: {
    _id: string;
  };
  createdAt?: string;
};

type ChatType = {
  _id: string;
  users: UserType[];
};

const ENDPOINT = "https://chat-b3wl.onrender.com";
const ADMIN_ID = "698ace8b8ea84c91bdc93678";

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [input, setInput] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const selectedChatRef = useRef<ChatType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- SOCKET CONNECT ---------------- */
  useEffect(() => {
    socketRef.current = io(ENDPOINT, {
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("✅ Admin socket connected");
    });

    socketRef.current.on("message recieved", (newMessage: Message) => {
      const activeChat = selectedChatRef.current;
      if (!activeChat) return;

      if (newMessage.chat._id === activeChat._id) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === newMessage._id);
          return exists ? prev : [...prev, newMessage];
        });
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  /* ---------------- FETCH ALL CHATS ---------------- */
  const fetchChats = async () => {
    try {
      const { data } = await axios.get(
        `${ENDPOINT}/api/chat?currentUserId=${ADMIN_ID}`
      );
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats", err);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  /* ---------------- FETCH MESSAGES ---------------- */
  const fetchMessages = async (chat: ChatType) => {
    try {
      setSelectedChat(chat);
      selectedChatRef.current = chat;

      // Get customer (exclude admin)
      const customer = chat.users.find((u) => u._id !== ADMIN_ID) || null;
      setSelectedUser(customer);

      const { data } = await axios.get(
        `${ENDPOINT}/api/message/${chat._id}`
      );

      setMessages(data);

      socketRef.current?.emit("join chat", chat._id);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!input.trim() || !selectedChat) return;

    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        {
          content: input,
          chatId: selectedChat._id,
          senderId: ADMIN_ID,
        }
      );

      socketRef.current?.emit("new message", data);
      setMessages((prev) => [...prev, data]);
      setInput("");
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* LEFT PANEL */}
      <div
        style={{
          width: "300px",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        {chats.map((chat) => {
          const customer = chat.users.find((u) => u._id !== ADMIN_ID);

          return (
            <div
              key={chat._id}
              onClick={() => fetchMessages(chat)}
              style={{
                padding: "15px",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
                background:
                  selectedChat?._id === chat._id ? "#f0f0f0" : "white",
              }}
            >
              <strong>{customer?.name || "Unknown User"}</strong>
            </div>
          );
        })}
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

        {selectedChat ? (
          <>
            {/* HEADER */}
            <div
              style={{
                padding: "15px",
                borderBottom: "1px solid #ddd",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <strong>{selectedUser?.name}</strong>

              <button
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  padding: "6px 12px",
                  background: "#1976d2",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showDetails ? "Hide Details" : "View Details"}
              </button>
            </div>

            {/* BODY */}
            <div style={{ flex: 1, display: "flex" }}>

              {/* CHAT AREA */}
              <div style={{ flex: 1, padding: "15px", overflowY: "auto" }}>
                {messages.map((m) => (
                  <div
                    key={m._id}
                    style={{
                      marginBottom: "10px",
                      textAlign:
                        m.sender._id === ADMIN_ID ? "right" : "left",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "10px",
                        borderRadius: "8px",
                        background:
                          m.sender._id === ADMIN_ID
                            ? "#1976d2"
                            : "#eee",
                        color:
                          m.sender._id === ADMIN_ID
                            ? "white"
                            : "black",
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* DETAILS PANEL */}
              {showDetails && selectedUser && (
                <div
                  style={{
                    width: "250px",
                    borderLeft: "1px solid #ddd",
                    padding: "15px",
                    background: "#fafafa",
                  }}
                >
                  <h4>User Details</h4>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone || "N/A"}</p>
                  <p><strong>User ID:</strong> {selectedUser._id}</p>
                </div>
              )}
            </div>

            {/* INPUT */}
            <div style={{ display: "flex", borderTop: "1px solid #ddd" }}>
              <input
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  outline: "none",
                }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                style={{
                  padding: "12px 20px",
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                }}
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: "20px" }}>
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
