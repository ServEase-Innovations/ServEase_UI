/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { X, Send, ArrowLeft, ChevronDown, MessageCircle, Phone, Mail } from "lucide-react";
import Draggable from "react-draggable";
import { Button, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

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

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ open, onClose }) => {
  const user = useSelector((state: any) => state.user?.value);
  const dispatch = useDispatch();
  const role = user?.role;
  const faqData = role === "CUSTOMER" ? [...generalFaqData, ...customerFaqData] : generalFaqData;

  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: `Namaste ! Welcome to ServEaso. How can we assist you today?`, sender: "bot" }
  ]);
  const [inputText, setInputText] = useState("");
  const [showAllFaq, setShowAllFaq] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuestionClick = (faq) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: faq.question, sender: "user" },
      { text: faq.answer, sender: "bot" }
    ]);
    setShowAllFaq(false);
  };

  const handleSendMessage = () => {
    if (inputText.trim() !== "") {
      setMessages((prevMessages) => [...prevMessages, { text: inputText, sender: "user" }]);
      setInputText("");
    }
  };

  // Disable dragging for mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <Draggable disabled={isMobile}>
      <div className="fixed bottom-20 right-2 sm:right-10 z-50 flex flex-col items-end w-full sm:w-auto">
        {open && (
          <Card
            className="
              w-[90%] max-w-[320px]   /* mobile: small width */
              sm:w-[26rem] sm:max-w-none  /* tablet/desktop: bigger width */
              shadow-2xl border border-gray-300 rounded-xl 
              p-2 sm:p-4 bg-white 
              max-h-[70vh] sm:max-h-[75vh] 
              flex flex-col overflow-hidden
            "
          >
            <CardContent className="flex flex-col flex-grow overflow-hidden p-0">

              {/* Header Section */}
              <div className="flex justify-between items-center border-b px-2 sm:px-4 py-2">
                {chatOpen && (
                  <Button onClick={() => setChatOpen(false)} className="min-w-0 mr-2">
                    <ArrowLeft size={22} />
                  </Button>
                )}
                <h2 className="text-sm sm:text-lg font-bold text-gray-900 flex-grow text-center">
                  Chat Support
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X size={22} />
                </button>
              </div>


{/* Messages + FAQ + Contact */}
<div
  className="flex flex-col flex-grow overflow-y-auto space-y-2 p-2 bg-gray-50"
  style={{ scrollbarWidth: "thin" }}
>
  {messages.map((msg, index) => (
    <div
      key={index}
      className={`p-2 sm:p-3 rounded-xl text-xs sm:text-sm shadow-md max-w-[75%] transition-opacity duration-300 ease-in-out ${
        msg.sender === "user"
          ? "bg-blue-500 text-white self-end rounded-br-none"
          : "bg-gray-200 text-gray-800 self-start rounded-bl-none"
      }`}
    >
      {msg.text}
    </div>
  ))}

  {!chatOpen && (
    <>
      {/* FAQs */}
      {showAllFaq ? (
        faqData.map((faq, index) => (
          <Button
            key={index}
            variant="outlined"
            className="w-full text-left px-2 py-1 sm:px-4 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-100 normal-case text-xs sm:text-sm"
            onClick={() => handleQuestionClick(faq)}
          >
            {faq.question}
          </Button>
        ))
      ) : (
        <Button
          variant="outlined"
          className="w-full text-left px-2 py-1 sm:px-4 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-between normal-case text-xs sm:text-sm"
          onClick={() => setShowAllFaq(true)}
        >
          View All FAQs
          <ChevronDown size={14} className="ml-2" />
        </Button>
      )}

     {/* Divider */}
<div className="border-t border-gray-300 my-2"></div>

{/* Email Support */}
<div
  className="flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer hover:bg-gray-50 w-full"
  onClick={() => window.open("mailto:support@serveaso.com")}
>
  <Mail size={18} className="text-blue-600" />
  <span className="text-xs sm:text-sm text-gray-700 font-medium">
    support@serveaso.com
  </span>
</div>

{/* Call Support */}
<div
  className="flex items-center justify-center gap-2 p-2 rounded-lg border border-gray-200 bg-white shadow-sm cursor-pointer hover:bg-gray-50 w-full"
  onClick={() => window.open("tel:080123456789")}
>
  <Phone size={18} className="text-green-600" />
  <span className="text-xs sm:text-sm text-gray-700 font-medium">
    080-123456789
  </span>
</div>


      {/* Chat with Assistant */}
      <Button
        variant="contained"
        className="w-full text-left px-2 py-2 sm:px-4 sm:py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 normal-case text-xs sm:text-sm flex items-center justify-center"
        onClick={() => setChatOpen(true)}
      >
        <MessageCircle size={16} className="mr-2" />
        Chat with Assistant
      </Button>
    </>
  )}
  <div ref={messagesEndRef} />
</div>

              {/* Input */}
              {chatOpen && (
                <div className="flex items-center border-t p-2 sm:p-3 bg-gray-100">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-grow p-2 border rounded-lg outline-none text-xs sm:text-sm"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="ml-2 min-w-0 p-2">
                    <Send size={18} />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Draggable>
  );
};

export default Chatbot;
