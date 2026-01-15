/* eslint-disable */
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
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDrag = (e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
  };

  // On mobile, render a fixed button (no dragging)
  if (isMobile) {
    return (
      <button
        onClick={onToggle}
        className="
          fixed bottom-5 right-5
          w-14 h-14
          bg-blue-500 hover:bg-blue-600
          text-white rounded-full
          shadow-lg flex items-center justify-center
          z-[9999]
          cursor-pointer
          active:bg-blue-700
          active:scale-95
          transition-transform
        "
        title="Need Help? Chat with us"
        style={{
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  // On desktop, render with dragging
  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      bounds="parent"
      handle=".drag-handle"
    >
      <button
        onClick={onToggle}
        className="
          fixed bottom-5 right-5
          w-14 h-14 sm:w-16 sm:h-16
          bg-blue-500 hover:bg-blue-600
          text-white rounded-full
          shadow-lg flex items-center justify-center
          z-[9999]
          cursor-move drag-handle
        "
        title="Need Help? Chat with us"
      >
        <MessageCircle size={28} />
      </button>
    </Draggable>
  );
};

export default ChatbotButton;