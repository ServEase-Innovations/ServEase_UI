/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { X, Send, ArrowLeft, ChevronDown, MessageCircle, Phone, Mail } from "lucide-react";
import Draggable from "react-draggable";
import { Button, Card, CardContent } from "@mui/material";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "../../context/AppUserContext";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const ENDPOINT = "https://chat-b3wl.onrender.com";
const ADMIN_ID = "698ace8b8ea84c91bdc93678";

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

interface MessageType {
  _id?: string;
  content: string;
  sender: "user" | "admin" | "bot";
}

const generalFaqData = [
  { question: "What services do you offer?", answer: "We offer services for HomeCook, Cleanning Help, and Caregiver." },
  { question: "How do I book a service?", answer: "You can book a service by selecting a provider and scheduling a time." },
  { question: "Are the service providers verified?", answer: "Yes, all our service providers go through a verification process." },
  { question: "Can I cancel a booking?", answer: "Yes, you can cancel a booking from your profile under 'My Bookings'." },
  { question: "How do I contact customer support?", answer: "You can reach out to our support team via chat or email." }
];

const customerFaqData = [
  { question: "How do I track my booking?", answer: "You can track your booking status in the 'My Bookings' section." },
  { question: "Can I reschedule my service?", answer: "Yes, you can reschedule your service from the booking details page." },
  { question: "How do I make a payment?", answer: "Payments can be made via credit card, debit card, or UPI." }
];


const Chatbot: React.FC<ChatbotProps> = ({ open, onClose }) => {
  const { appUser } = useAppUser();

  const [chatOpen, setChatOpen] = useState(false);
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([
    { content: "Namaste! Welcome to ServEaso. How can we assist you today?", sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");
  const [showAllFaq, setShowAllFaq] = useState(true);

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [mongoUser, setMongoUser] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- SOCKET CONNECT ---------------- */
  useEffect(() => {
    socketRef.current = io(ENDPOINT, { transports: ["websocket"] });

    socketRef.current.on("message recieved", (newMessage: any) => {
      setMessages((prev) => [
        ...prev,
        { content: newMessage.content, sender: "admin" }
      ]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- FAQ CLICK ---------------- */
  const handleQuestionClick = (faq: any) => {
    setMessages((prev) => [
      ...prev,
      { content: faq.question, sender: "user" },
      { content: faq.answer, sender: "bot" }
    ]);
    setShowAllFaq(false);
  };

  /* ---------------- START LIVE CHAT ---------------- */
  const startLiveChat = async () => {
    if (!appUser) return;

    try {
      // find or create Mongo user
      const { data: userData } = await axios.post(
        `${ENDPOINT}/api/user/find-or-create`,
        {
          name: appUser.name,
          email: appUser.email,
        }
      );

      setMongoUser(userData);

      // access chat with admin
      const { data: chatData } = await axios.post(
        `${ENDPOINT}/api/chat`,
        {
          userId: ADMIN_ID,
          currentUserId: userData._id,
        }
      );

      setSelectedChat(chatData);

      socketRef.current?.emit("join chat", chatData._id);

      // load previous messages
      const messageData = await axios.get(
        `${ENDPOINT}/api/message/${chatData._id}`
      );

      const formatted = messageData.data.map((m: any) => ({
        content: m.content,
        sender: m.sender._id === userData._id ? "user" : "admin"
      }));

      setMessages((prev) => [...prev, ...formatted]);

      setIsLiveChat(true);
      setChatOpen(true);

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    // If not in live chat, treat as FAQ conversation
    if (!isLiveChat) {
      setMessages((prev) => [
        ...prev,
        { content: inputText, sender: "user" }
      ]);
      setInputText("");
      return;
    }

    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        {
          content: inputText,
          chatId: selectedChat._id,
          senderId: mongoUser._id,
        }
      );

      socketRef.current?.emit("new message", data);

      setMessages((prev) => [
        ...prev,
        { content: data.content, sender: "user" }
      ]);

      setInputText("");

    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <Draggable bounds="parent" handle=".chatbot-header">
      <div className="fixed bottom-20 right-2 z-[9998] w-[320px]">
        <Card className="shadow-2xl border rounded-xl bg-white flex flex-col max-h-[75vh] overflow-hidden">

          <DialogHeader className="chatbot-header">
            <div className="flex justify-between items-center w-full">
              {chatOpen && (
                <Button onClick={() => setChatOpen(false)}>
                  <ArrowLeft size={20} />
                </Button>
              )}
              <h2 className="text-sm font-bold flex-grow text-center">
                Chat Support
              </h2>
              <button onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </DialogHeader>

          <CardContent className="flex flex-col flex-grow overflow-hidden p-0">

            {/* MESSAGE AREA */}
            {/* MESSAGE AREA */}
<div className="flex flex-col flex-grow overflow-y-auto p-3 bg-gray-50 space-y-2">

  {/* Chat Messages */}
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`p-2 rounded-xl text-sm max-w-[75%] ${
        msg.sender === "user"
          ? "bg-blue-500 text-white self-end"
          : msg.sender === "admin"
          ? "bg-gray-300 text-black self-start"
          : "bg-gray-200 text-gray-800 self-start"
      }`}
    >
      {msg.content}
    </div>
  ))}

  {/* FAQ SECTION (Only before live chat starts) */}
  {!isLiveChat && (
    <>
      <div className="mt-3 space-y-2">
        {(appUser?.role === "CUSTOMER"
          ? [...generalFaqData, ...customerFaqData]
          : generalFaqData
        ).map((faq, index) => (
          <Button
            key={index}
            variant="outlined"
            className="w-full text-left normal-case"
            onClick={() => handleQuestionClick(faq)}
          >
            {faq.question}
          </Button>
        ))}
      </div>

      <div className="border-t my-3"></div>

      {/* Live Chat Button */}
      {appUser ? (
        <Button
          variant="contained"
          onClick={startLiveChat}
          className="w-full"
        >
          <MessageCircle size={16} className="mr-2" />
          Chat with Assistant
        </Button>
      ) : (
        <div className="text-sm text-center text-gray-500">
          Please login to chat with our support team.
        </div>
      )}
    </>
  )}

  <div ref={messagesEndRef} />
</div>


            {/* INPUT */}
            {chatOpen && (
              <div className="flex items-center border-t p-2 bg-gray-100">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && handleSendMessage()
                  }
                  className="flex-grow p-2 border rounded-lg outline-none"
                  placeholder="Type your message..."
                />
                <Button onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Draggable>
  );
};

export default Chatbot;
