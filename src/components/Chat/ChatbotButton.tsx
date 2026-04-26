import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { MessageCircle } from "lucide-react";

interface ChatbotButtonProps {
  open: boolean;
  onToggle: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ open, onToggle }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const baseBtn =
    "fixed bottom-5 right-5 w-14 h-14 sm:w-16 sm:h-16 z-[9999] " +
    "text-white rounded-full flex items-center justify-center " +
    "transition-shadow transition-transform duration-200 " +
    "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";

  if (isMobile) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className={[
          baseBtn,
          open
            ? "bg-sky-600 shadow-lg shadow-sky-500/30 ring-2 ring-white/90"
            : "bg-sky-600 hover:bg-sky-500 shadow-lg shadow-slate-900/20",
        ].join(" ")}
        title={open ? "Close help" : "Help and support"}
        aria-label={open ? "Close help chat" : "Open help and support chat"}
        aria-pressed={open}
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} aria-hidden />
      </button>
    );
  }

  return (
    <Draggable position={position} onDrag={(_, data) => setPosition({ x: data.x, y: data.y })} bounds="parent" handle=".drag-handle">
      <button
        type="button"
        onClick={onToggle}
        className={[
          "drag-handle",
          baseBtn,
          open
            ? "bg-sky-600 shadow-lg shadow-sky-500/30 ring-2 ring-white/80 cursor-grab"
            : "bg-sky-600 hover:bg-sky-500 shadow-lg cursor-grab",
        ].join(" ")}
        title={open ? "Close help" : "Help and support (drag to move)"}
        aria-label={open ? "Close help chat" : "Open help and support chat (draggable)"}
        aria-pressed={open}
      >
        <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} aria-hidden />
      </button>
    </Draggable>
  );
};

export default ChatbotButton;
