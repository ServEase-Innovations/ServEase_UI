import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Send,
  ArrowLeft,
  MessageCircle,
  Phone,
  Mail,
  Loader2,
  Headset,
} from "lucide-react";
import Draggable from "react-draggable";
import { Button, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, Typography, CircularProgress } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DialogHeader } from "../ProviderDetails/CookServicesDialog.styles";
import { useAppUser } from "../../context/AppUserContext";
import axios from "axios";
import { io, type Socket } from "socket.io-client";
import { urls } from "src/config/urls";

const CHAT_ENDPOINT = urls.chat;
const ADMIN_ID = process.env.REACT_APP_CHAT_ADMIN_ID || "698ace8b8ea84c91bdc93678";

interface ChatbotProps {
  open: boolean;
  onClose: () => void;
}

type Sender = "user" | "admin" | "bot";

interface MessageType {
  _id: string;
  content: string;
  sender: Sender;
  at: number;
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const generalFaqData = [
  { question: "What services do you offer?", answer: "We offer Home cook, cleaning help, and caregiver services, with more types coming soon." },
  { question: "How do I book a service?", answer: "Select a service type, choose a provider, pick a time, and complete payment when prompted." },
  { question: "Are the service providers verified?", answer: "Yes, providers go through a verification process before they can take bookings on ServEase." },
  { question: "Can I cancel a booking?", answer: "You can manage bookings from your profile and bookings section, subject to the cancellation policy shown at booking time." },
  { question: "How do I contact customer support?", answer: "Use this chat, the email or phone below, or connect to live support when you are signed in." },
];

const customerFaqData = [
  { question: "How do I track my booking?", answer: "Open Bookings in your account to see status and visit details for each engagement." },
  { question: "Can I reschedule my service?", answer: "Where supported, use the booking details or contact support; rules depend on the service type and timing." },
  { question: "How do I make a payment?", answer: "You can pay with supported UPI, cards, or other methods shown at checkout for your booking." },
];

const botReplyForFreetext = (q: string): string => {
  const s = q.toLowerCase().trim();
  if (s.length < 2) return "Ask a short question, open a quick question below, or tap “Connect to live support”.";
  if (/\b(boo?k|schedule|reserv|appointment)\b/.test(s)) {
    return "To book: choose a service, pick a provider, select a time slot, then check out. If something fails, use live support with a screenshot.";
  }
  if (/\b(pay|payment|upi|razor|refund|money|invoice)\b/.test(s)) {
    return "Payments and refunds are handled in the app at checkout. For failed payments or refund questions, connect to live support and share your engagement id if you have one.";
  }
  if (/\b(cancel|refund|complaint)\b/.test(s)) {
    return "Cancellation and refund rules depend on your booking type. Check My Bookings in the app, or connect to live support for a specific booking.";
  }
  if (/\b(hi|hello|help|namaste|hey)\b/.test(s)) {
    return "Hi! Try the quick questions, or type words like book, pay, or cancel. For account help, use Connect to live support when signed in.";
  }
  return "Thanks for writing in. I don’t have a specific auto-reply for that. Use the quick questions, or connect to live support to talk with our team.";
};

const Chatbot: React.FC<ChatbotProps> = ({ open, onClose }) => {
  const { appUser } = useAppUser();

  const [isLiveChat, setIsLiveChat] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sendBusy, setSendBusy] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageType[]>([
    {
      _id: "welcome",
      content: "Namaste! I’m the ServEase assistant. How can I help you today?",
      sender: "bot",
      at: Date.now(),
    },
  ]);
  const [inputText, setInputText] = useState("");

  const [showViewAllBtn, setShowViewAllBtn] = useState(false);
  const [showAccordion, setShowAccordion] = useState(true);

  const [selectedChat, setSelectedChat] = useState<{ _id: string } | null>(null);
  const [mongoUser, setMongoUser] = useState<{ _id: string } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const accordionRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const w = () => setIsMobile(window.innerWidth < 640);
    w();
    window.addEventListener("resize", w);
    return () => window.removeEventListener("resize", w);
  }, []);

  const allFaqs = useMemo(
    () => (appUser?.role === "CUSTOMER" ? [...generalFaqData, ...customerFaqData] : generalFaqData),
    [appUser?.role]
  );

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }));
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd, showAccordion]);

  useEffect(() => {
    if (showAccordion && accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showAccordion]);

  /* —— Socket: only for live support, and only when panel is open —— */
  useEffect(() => {
    if (!open || !isLiveChat || !selectedChat?._id) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socket: Socket = io(CHAT_ENDPOINT, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join chat", selectedChat._id);
    });

    socket.on("message recieved", (newMessage: { content?: string; sender?: { _id?: string } }) => {
      const c = newMessage?.content;
      if (c == null || !String(c).trim()) return;
      const text = String(c);
      const fromSelf =
        newMessage.sender?._id != null &&
        mongoUser?._id != null &&
        String(newMessage.sender._id) === String(mongoUser._id);
      setMessages((prev) => [
        ...prev,
        { _id: genId(), content: text, sender: fromSelf ? "user" : "admin", at: Date.now() },
      ]);
    });

    return () => {
      socket.off("message recieved");
      socket.off("connect");
      socket.disconnect();
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [open, isLiveChat, selectedChat?._id, mongoUser?._id]);

  const handleQuestionClick = (faq: { question: string; answer: string }) => {
    const at = Date.now();
    setMessages((prev) => [
      ...prev,
      { _id: genId(), content: faq.question, sender: "user", at },
      { _id: genId(), content: faq.answer, sender: "bot", at: at + 1 },
    ]);
    setShowViewAllBtn(true);
    setShowAccordion(false);
  };

  const startLiveChat = async () => {
    if (!appUser || connecting) return;
    setConnecting(true);
    setLiveError(null);
    try {
      const { data: userData } = await axios.post(`${CHAT_ENDPOINT}/api/user/find-or-create`, {
        name: appUser.name,
        email: appUser.email,
      });

      setMongoUser(userData);

      const { data: chatData } = await axios.post(`${CHAT_ENDPOINT}/api/chat`, {
        userId: ADMIN_ID,
        currentUserId: userData._id,
      });
      setSelectedChat(chatData);

      const { data: history } = await axios.get(`${CHAT_ENDPOINT}/api/message/${chatData._id}`);

      const formatted: MessageType[] = (history || []).map((m: { _id: string; content: string; sender: { _id: string } }) => ({
        _id: m._id || genId(),
        content: m.content,
        sender: m.sender?._id === userData._id ? "user" : "admin",
        at: Date.now(),
      }));

      setMessages((prev) => [...prev, ...formatted]);
      setIsLiveChat(true);
      setShowViewAllBtn(false);
      setShowAccordion(false);
    } catch (e: unknown) {
      console.error(e);
      const msg = axios.isAxiosError(e) && e.response?.data?.message ? String(e.response.data.message) : "Could not start live support. Please try again or use email/phone below.";
      setLiveError(msg);
    } finally {
      setConnecting(false);
    }
  };

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || sendBusy) return;

    if (!isLiveChat) {
      setMessages((prev) => [
        ...prev,
        { _id: genId(), content: text, sender: "user", at: Date.now() },
        { _id: genId(), content: botReplyForFreetext(text), sender: "bot", at: Date.now() + 1 },
      ]);
      setInputText("");
      return;
    }

    if (!selectedChat?._id || !mongoUser?._id) {
      return;
    }

    setSendBusy(true);
    try {
      const { data } = await axios.post<{
        _id?: string;
        content?: string;
      }>(`${CHAT_ENDPOINT}/api/message`, {
        content: text,
        chatId: selectedChat._id,
        senderId: mongoUser._id,
      });
      socketRef.current?.emit("new message", data);
      const outText = data?.content != null && String(data.content).trim() !== "" ? String(data.content) : text;
      setMessages((prev) => [
        ...prev,
        { _id: data?._id || genId(), content: outText, sender: "user", at: Date.now() },
      ]);
      setInputText("");
    } catch (e) {
      console.error(e);
      setLiveError("Message failed to send. Check your connection and try again.");
    } finally {
      setSendBusy(false);
    }
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsLiveChat(false);
    setSelectedChat(null);
    setMongoUser(null);
    setShowAccordion(true);
    setShowViewAllBtn(false);
    setLiveError(null);
    setMessages([
      {
        _id: "welcome",
        content: "Namaste! I’m the ServEase assistant. How can I help you today?",
        sender: "bot",
        at: Date.now(),
      },
    ]);
  };

  const handlePanelClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <Draggable disabled={isMobile} bounds="parent" handle=".chatbot-header" cancel="button, a, [role=button]">
      <div
        className="fixed bottom-20 right-2 z-[9998] w-[min(100vw-1rem,380px)]"
        role="dialog"
        aria-label="Support chat"
        aria-modal="false"
      >
        <Card
          className="shadow-2xl border border-slate-200/80 rounded-2xl bg-white flex flex-col overflow-hidden"
          style={{ maxHeight: "min(80vh, 600px)" }}
        >
          <DialogHeader
            className="chatbot-header"
            style={{ cursor: isMobile ? "default" : "move", userSelect: "none" as const }}
          >
            <div className="flex items-center w-full gap-1">
              {isLiveChat && (
                <Button
                  onClick={handleBack}
                  sx={{ minWidth: 36, p: 0.5, color: "#fff" }}
                  aria-label="Back to FAQs and assistant"
                >
                  <ArrowLeft size={20} />
                </Button>
              )}
              <div className="flex-1 min-w-0 text-center pr-1">
                <h2 className="text-sm font-bold text-white">ServEase help</h2>
                <p className="text-[11px] text-sky-100/95 truncate">
                  {isLiveChat ? "Live support" : "FAQs & auto-reply"}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePanelClose}
                className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition text-white"
                aria-label="Close support chat"
              >
                <X size={20} />
              </button>
            </div>
          </DialogHeader>

          <CardContent className="flex flex-col min-h-0 p-0 flex-1" sx={{ display: "flex", flexDirection: "column" }}>
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2.5 bg-gradient-to-b from-slate-50 to-slate-100/90">
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                const isAdmin = msg.sender === "admin";
                return (
                  <div
                    key={msg._id}
                    className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={[
                        "max-w-[88%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm",
                        isUser
                          ? "bg-sky-600 text-white rounded-br-sm"
                          : isAdmin
                            ? "bg-white text-slate-900 border border-slate-200/90 rounded-bl-sm"
                            : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-sm",
                      ].join(" ")}
                    >
                      {!isUser && (
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                          {isAdmin ? "Support" : "Assistant"}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {!isLiveChat && (
                <>
                  {showAccordion && (
                    <div ref={accordionRef} className="mt-1 space-y-1">
                      <p className="text-xs font-semibold text-slate-600">Quick questions</p>
                      {allFaqs.map((faq, index) => (
                        <Accordion
                          key={index}
                          disableGutters
                          elevation={0}
                          className="!bg-white !rounded-xl !border !border-slate-200/90 before:hidden"
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon className="text-slate-500" />}
                            className="!min-h-0 !px-2"
                          >
                            <Typography className="text-sm font-medium text-slate-800 pr-1">{faq.question}</Typography>
                          </AccordionSummary>
                          <AccordionDetails className="!pt-0 !px-2 !pb-2 !space-y-2">
                            <Typography className="text-sm text-slate-600">{faq.answer}</Typography>
                            <Button
                              type="button"
                              size="small"
                              variant="outlined"
                              onClick={() => handleQuestionClick(faq)}
                              className="!normal-case !text-sky-700 !border-sky-300"
                            >
                              Add to chat
                            </Button>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </div>
                  )}

                  {showViewAllBtn && !showAccordion && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setShowAccordion(true)}
                      className="w-full !text-sky-700"
                      size="small"
                    >
                      View all quick questions
                    </Button>
                  )}

                  {showViewAllBtn && showAccordion && (
                    <Button
                      type="button"
                      variant="text"
                      onClick={() => setShowAccordion(false)}
                      className="w-full !text-slate-500"
                      size="small"
                    >
                      Collapse list
                    </Button>
                  )}

                  {liveError && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-2 py-1.5">{liveError}</p>}

                  <div className="h-px bg-slate-200/90 my-2" />

                  {appUser ? (
                    <Button
                      type="button"
                      variant="contained"
                      onClick={startLiveChat}
                      disabled={connecting}
                      className="!w-full !py-2 !normal-case !rounded-xl !font-semibold !bg-emerald-600 hover:!bg-emerald-700 !text-white !shadow"
                      startIcon={connecting ? <CircularProgress size={18} color="inherit" /> : <Headset className="w-4 h-4" />}
                    >
                      {connecting ? "Connecting…" : "Connect to live support"}
                    </Button>
                  ) : (
                    <p className="text-sm text-center text-slate-600">Sign in to connect with our support team.</p>
                  )}

                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-2 text-center text-sm text-slate-700">
                    <Mail size={16} className="shrink-0 text-sky-500" />
                    <a
                      className="text-sky-700 font-medium hover:underline truncate"
                      href="mailto:support@serveaso.com"
                    >
                      support@serveaso.com
                    </a>
                  </div>
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-2 py-2 text-center text-sm text-slate-700">
                    <Phone size={16} className="shrink-0 text-emerald-500" />
                    <a className="text-slate-800 font-medium hover:underline" href="tel:080123456789">
                      080-123456789
                    </a>
                  </div>
                </>
              )}

              {isLiveChat && liveError && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">{liveError}</p>
              )}

              <div ref={messagesEndRef} className="h-px" />
            </div>

            <div className="shrink-0 border-t border-slate-200 bg-white p-2.5">
              <div className="flex items-end gap-2">
                <input
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void handleSendMessage();
                    }
                  }}
                  className="flex-1 min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500"
                  placeholder={isLiveChat ? "Message support…" : "Type a question, or use quick questions…"}
                  disabled={isLiveChat && !appUser}
                />
                <Button
                  type="button"
                  onClick={() => void handleSendMessage()}
                  disabled={!inputText.trim() || sendBusy}
                  className="!min-w-0 !rounded-xl !h-10 !w-10 !p-0 !shrink-0"
                  color="primary"
                  variant="contained"
                  aria-label="Send message"
                >
                  {sendBusy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
              {isLiveChat && (
                <p className="text-[11px] text-slate-500 text-center mt-1.5">
                  You’re in a live queue — messages go to the team. Tap ← to return to the assistant.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Draggable>
  );
};

export default Chatbot;
