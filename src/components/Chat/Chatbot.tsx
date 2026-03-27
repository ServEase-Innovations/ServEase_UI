/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { X, Send, ArrowLeft, ChevronDown, MessageCircle, Phone, Mail } from "lucide-react";
import Draggable from "react-draggable";
import { Button, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  
  const [showViewAllBtn, setShowViewAllBtn] = useState(false);
  const [showAccordion, setShowAccordion] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [mongoUser, setMongoUser] = useState<any>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const accordionRef = useRef<HTMLDivElement | null>(null);
  const draggableNodeRef = useRef<HTMLDivElement | null>(null);

  /* ---------------- DETECT MOBILE DEVICE ---------------- */
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = window.innerWidth <= 768 || 
        ('ontouchstart' in window) || 
        (navigator.maxTouchPoints > 0);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  /* ---------------- AUTO SCROLL TO ACCORDION ---------------- */
  useEffect(() => {
    if (showAccordion && accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAccordion]);

  /* ---------------- FAQ CLICK ---------------- */
  const handleQuestionClick = (faq: any) => {
    setMessages((prev) => [
      ...prev,
      { content: faq.question, sender: "user" },
      { content: faq.answer, sender: "bot" }
    ]);
    setShowViewAllBtn(true);
    setShowAccordion(false);
  };

  /* ---------------- BACK BUTTON HANDLER ---------------- */
  const handleBackClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setChatOpen(false);
    setIsLiveChat(false);
    setShowAccordion(true);
    setShowViewAllBtn(false);
    setMessages([
      { content: "Namaste! Welcome to ServEaso. How can we assist you today?", sender: "bot" }
    ]);
  };

  /* ---------------- CLOSE BUTTON HANDLER ---------------- */
  const handleCloseClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  /* ---------------- START LIVE CHAT ---------------- */
  const startLiveChat = async () => {
    if (!appUser) return;

    try {
      const { data: userData } = await axios.post(
        `${ENDPOINT}/api/user/find-or-create`,
        {
          name: appUser.name,
          email: appUser.email,
        }
      );

      setMongoUser(userData);

      const { data: chatData } = await axios.post(
        `${ENDPOINT}/api/chat`,
        {
          userId: ADMIN_ID,
          currentUserId: userData._id,
        }
      );

      setSelectedChat(chatData);

      socketRef.current?.emit("join chat", chatData._id);

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
      
      setShowViewAllBtn(false);
      setShowAccordion(false);

    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

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

  const allFaqs = appUser?.role === "CUSTOMER" 
    ? [...generalFaqData, ...customerFaqData]
    : generalFaqData;

  const chatContent = (
    <div className="fixed bottom-20 right-2 z-[9998] w-[320px]">
      <Card className="shadow-2xl border rounded-xl bg-white flex flex-col max-h-[75vh] overflow-hidden">
        <DialogHeader className="chatbot-header">
          <div className="flex justify-between items-center w-full">
            {chatOpen && (
              <Button
                onClick={handleBackClick}
                onTouchStart={handleBackClick}
                sx={{
                  minWidth: "auto",
                  padding: "4px",
                  marginLeft: "-8px",
                  color: "#fff",
                  zIndex: 10,
                  cursor: "pointer"
                }}
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h2 className="text-sm font-bold flex-grow text-center">
              Chat Support
            </h2>
            <button 
              onClick={handleCloseClick}
              onTouchStart={handleCloseClick}
              style={{ zIndex: 10, cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>
        </DialogHeader>

        <CardContent className="flex flex-col flex-grow overflow-hidden p-0">
          <div className="flex flex-col flex-grow overflow-y-auto p-3 bg-gray-50 space-y-2">
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

            {!isLiveChat && (
              <>
                {showAccordion && (
                  <div ref={accordionRef} className="mt-3">
                    <div className="mb-2 text-sm font-semibold text-gray-700">
                      FAQs:
                    </div>
                    {allFaqs.map((faq, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography className="text-sm font-medium">
                            {faq.question}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography className="text-sm text-gray-600">
                            {faq.answer}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </div>
                )}

                {showViewAllBtn && !showAccordion && (
                  <Button
                    variant="text"
                    onClick={() => setShowAccordion(true)}
                    className="w-full text-blue-600"
                  >
                    View All FAQs
                  </Button>
                )}

                {showViewAllBtn && showAccordion && (
                  <Button
                    variant="text"
                    onClick={() => setShowAccordion(false)}
                    className="w-full text-blue-600"
                  >
                    Hide FAQs
                  </Button>
                )}

                <div className="border-t my-3"></div>

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
                
                <div className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 shadow-sm text-center">
                  <Mail size={16} className="text-blue-500" />
                  <span className="text-sm text-gray-700">
                    support@serveaso.com
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 shadow-sm mt-2 text-center">
                  <Phone size={16} className="text-green-500" />
                  <span className="text-sm text-gray-700">
                    080-123456789
                  </span>
                </div>
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

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
  );

  // Disable dragging on mobile devices to prevent touch event conflicts
  if (isMobile) {
    return chatContent;
  }

  return (
    <Draggable 
      bounds="parent" 
      handle=".chatbot-header"
      nodeRef={draggableNodeRef}
    >
      <div ref={draggableNodeRef}>
        {chatContent}
      </div>
    </Draggable>
  );
};

export default Chatbot;