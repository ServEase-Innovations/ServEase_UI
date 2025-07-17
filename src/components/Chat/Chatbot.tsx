/* eslint-disable */
import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ArrowLeft, ChevronDown } from "lucide-react";
import Draggable from "react-draggable";
import { Button, Card, CardContent } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

const generalFaqData = [
  { question: "What services do you offer?", answer: "We offer services for Cooks, Maids, and Nannies." },
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

const Chatbot: React.FC<ChatbotProps> = ({ open, onClose }) =>  {
  const user = useSelector((state: any) => state.user?.value);
  const dispatch = useDispatch();
  const customerId = user?.customerDetails?.customerId || null;
  const currentLocation = user?.customerDetails?.currentLocation;
  const role = user?.role;
  const firstName = user?.customerDetails?.firstName;
  const lastName = user?.customerDetails?.lastName;
  const customerName = `${firstName} ${lastName}`;
  const faqData = role === "CUSTOMER" ? [...generalFaqData, ...customerFaqData] : generalFaqData;

  const [opens, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: `Namaste ! Welcome to ServEase. How can we assist you today?`, sender: "bot" }
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
    // After clicking a question, hide the FAQs (show View All button)
    setShowAllFaq(false);
  };

  const handleSendMessage = () => {
    if (inputText.trim() !== "") {
      setMessages((prevMessages) => [...prevMessages, { text: inputText, sender: "user" }]);
      setInputText("");
    }
  };

  return (
    <Draggable>
      <div className="fixed bottom-24 right-10 z-50 flex flex-col items-end">
        {open && (
          <Card className="w-[28rem] shadow-2xl border border-gray-300 rounded-xl p-4 bg-white max-h-[75vh] flex flex-col overflow-hidden">
            <CardContent className="flex flex-col flex-grow overflow-hidden">
              
              {/* Header Section */}
              <div className="flex justify-between items-center border-b pb-2">
                {chatOpen && (
                  <Button onClick={() => setChatOpen(false)} className="mr-2">
                    <ArrowLeft size={28} />
                  </Button>
                )}
                <h2 className="text-xl font-bold text-gray-900 flex-grow text-center">
                  Chat Support
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Messages and FAQ Section */}
              <div className="flex flex-col flex-grow overflow-y-auto space-y-3 p-2 border rounded-lg bg-gray-50" style={{ maxHeight: "70vh", scrollbarWidth: "thin" }}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl text-sm shadow-md max-w-xs transition-opacity duration-300 ease-in-out ${
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
                    {/* Show either all FAQs or the View All button */}
                    {showAllFaq ? (
                      faqData.map((faq, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          className="w-full text-left px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                          onClick={() => handleQuestionClick(faq)}
                        >
                          {faq.question}
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="outlined"
                        className="w-full text-left px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => setShowAllFaq(true)}
                      >
                        View All FAQs
                        <ChevronDown size={16} className="ml-2" />
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      className="w-full text-left px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                      onClick={() => setChatOpen(true)}
                    >
                      Chat with Assistant
                    </Button>
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Section */}
              {chatOpen && (
                <div className="flex items-center border-t p-4 bg-gray-100">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-grow p-2 border rounded-lg outline-none"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="ml-2 p-2">
                    <Send size={20} />
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