/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { X, Send, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "../../components/Button/button";
import { useAppUser } from "../../context/AppUserContext";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const ENDPOINT = "https://chat-b3wl.onrender.com";
const ADMIN_ID = "698ace8b8ea84c91bdc93678";

interface MessageType {
  _id?: string;
  content: string;
  sender: "user" | "admin" | "bot";
  timestamp?: Date;
}

interface ChatInterfaceProps {
  open: boolean;
  onClose: () => void;
  bookingDetails?: {
    id: number;
    serviceType: string;
    providerName: string;
    bookingDate: string;
  } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  open, 
  onClose,
  bookingDetails 
}) => {
  const { appUser } = useAppUser();

  const [messages, setMessages] = useState<MessageType[]>([
    { 
      content: bookingDetails 
        ? `Namaste! How can I help you with your ${bookingDetails.serviceType} booking #${bookingDetails.id}?` 
        : "Namaste! Welcome to ServEaso. How can we assist you today?", 
      sender: "bot" 
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLiveChat, setIsLiveChat] = useState(false);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [mongoUser, setMongoUser] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // FAQ data
  const generalFaqData = [
    { question: "What services do you offer?", answer: "We offer services for HomeCook, Cleaning Help, and Caregiver." },
    { question: "How do I book a service?", answer: "You can book a service by selecting a provider and scheduling a time." },
    { question: "Are the service providers verified?", answer: "Yes, all our service providers go through a verification process." },
    { question: "Can I cancel a booking?", answer: "Yes, you can cancel a booking from your profile under 'My Bookings'." },
    { question: "How do I contact customer support?", answer: "You can reach out to our support team via chat or email." }
  ];

  const bookingSpecificFaq = bookingDetails ? [
    { 
      question: `Cancel booking #${bookingDetails.id}`, 
      answer: `To cancel booking #${bookingDetails.id}, please go to your bookings page and click on "Cancel Booking". Would you like me to connect you with a support agent to help with cancellation?` 
    },
    { 
      question: `Reschedule booking #${bookingDetails.id}`, 
      answer: `To reschedule your ${bookingDetails.serviceType} booking, you can modify it from your bookings page. Need help with rescheduling?` 
    },
    { 
      question: `Contact provider for booking #${bookingDetails.id}`, 
      answer: `Your provider for this booking is ${bookingDetails.providerName}. Would you like me to connect you with support to help you contact them?` 
    },
  ] : [];

  /* ---------------- SOCKET CONNECT ---------------- */
  useEffect(() => {
    socketRef.current = io(ENDPOINT, { transports: ["websocket"] });

    socketRef.current.on("message recieved", (newMessage: any) => {
      setMessages((prev) => [
        ...prev,
        { content: newMessage.content, sender: "admin", timestamp: new Date() }
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
      { content: faq.question, sender: "user", timestamp: new Date() },
      { content: faq.answer, sender: "bot", timestamp: new Date() }
    ]);
  };

  /* ---------------- START LIVE CHAT ---------------- */
  const startLiveChat = async () => {
    if (!appUser) return;

    setIsConnecting(true);

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

      // Create context message about booking if available
      let contextMessage = "";
      if (bookingDetails) {
        contextMessage = `[Booking Context] Customer is inquiring about booking #${bookingDetails.id} (${bookingDetails.serviceType}) with provider ${bookingDetails.providerName}`;
        
        // Send context message to admin
        setTimeout(async () => {
          try {
            await axios.post(`${ENDPOINT}/api/message`, {
              content: contextMessage,
              chatId: selectedChat?._id,
              senderId: userData._id,
              isSystemMessage: true
            });
          } catch (error) {
            console.error("Error sending context message:", error);
          }
        }, 1000);
      }

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
        sender: m.sender._id === userData._id ? "user" : "admin",
        timestamp: new Date(m.createdAt)
      }));

      setMessages((prev) => {
        // Keep the first bot message, then add previous messages
        const botMessage = prev[0];
        return [botMessage, ...formatted];
      });

      setIsLiveChat(true);

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { 
          content: "Sorry, we're having trouble connecting to live chat. Please try again later or contact support via email.", 
          sender: "bot" 
        }
      ]);
    } finally {
      setIsConnecting(false);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    setInputText("");

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      { content: userMessage, sender: "user", timestamp: new Date() }
    ]);

    // If not in live chat, treat as FAQ conversation
    if (!isLiveChat) {
      // Simple response for non-live chat mode
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { 
            content: "Would you like to connect with a live support agent for more personalized assistance?", 
            sender: "bot" 
          }
        ]);
      }, 1000);
      return;
    }

    // Live chat mode
    try {
      const { data } = await axios.post(
        `${ENDPOINT}/api/message`,
        {
          content: userMessage,
          chatId: selectedChat._id,
          senderId: mongoUser._id,
        }
      );

      socketRef.current?.emit("new message", data);

    } catch (err) {
      console.error(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Chat Card */}
      <div className="relative w-full sm:w-[380px] h-[600px] sm:h-[550px] bg-white rounded-t-xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center gap-2">
            {isLiveChat && (
              <button 
                onClick={() => setIsLiveChat(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="font-semibold text-sm">
                {isLiveChat ? "Live Support" : "Chat Support"}
              </h3>
              {bookingDetails && (
                <p className="text-xs text-blue-100">
                  Booking #{bookingDetails.id} • {bookingDetails.serviceType}
                </p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : msg.sender === "admin"
                    ? "bg-purple-100 text-gray-800 rounded-bl-none"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                }`}
              >
                {msg.content}
                {msg.timestamp && (
                  <p className={`text-[10px] mt-1 ${
                    msg.sender === "user" ? "text-blue-200" : "text-gray-500"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          {/* FAQ Section (Only when not in live chat) */}
          {!isLiveChat && messages.length <= 2 && (
            <div className="mt-4 space-y-2">
              <p className="text-xs text-gray-500 font-medium mb-2">Quick Help:</p>
              
              {/* Booking-specific FAQs */}
              {bookingDetails && bookingSpecificFaq.map((faq, index) => (
                <button
                  key={`booking-${index}`}
                  onClick={() => handleQuestionClick(faq)}
                  className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  {faq.question}
                </button>
              ))}
              
              {/* General FAQs */}
              {generalFaqData.slice(0, 3).map((faq, index) => (
                <button
                  key={`general-${index}`}
                  onClick={() => handleQuestionClick(faq)}
                  className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  {faq.question}
                </button>
              ))}
              
              <div className="pt-3 mt-2 border-t border-gray-200">
                <button
                  onClick={startLiveChat}
                  disabled={isConnecting}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={16} />
                      Chat with Live Agent
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {/* Typing indicator for live chat */}
          {isLiveChat && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-600 p-3 rounded-xl rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-center gap-2">
            <input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder={isLiveChat ? "Type your message..." : "Ask a question..."}
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          {!appUser && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Please login to chat with our support team.
            </p>
          )}
        </div>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        
        @media (min-width: 640px) {
          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInterface;