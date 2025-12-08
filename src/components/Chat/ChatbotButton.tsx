/* eslint-disable */
import React, { useState } from "react";
import Draggable from "react-draggable";
import { MessageCircle } from "lucide-react";

interface ChatbotButtonProps {
  open: boolean;
  onToggle: () => void;
}

const ChatbotButton: React.FC<ChatbotButtonProps> = ({ open, onToggle }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleDrag = (e: any, data: any) => {
    setPosition({ x: data.x, y: data.y });
  };

  return (
    <Draggable
      position={position}
      onDrag={handleDrag}
      bounds="parent"
    >
      <button
        onClick={onToggle}
        className="
          fixed bottom-5 right-5
          w-14 h-14 sm:w-16 sm:h-16
          bg-blue-500 hover:bg-blue-600
          text-white rounded-full
          shadow-lg flex items-center justify-center
          z-50
        "
        title="Need Help? Chat with us"
      >
        <MessageCircle size={28} />
      </button>
    </Draggable>
  );
};

export default ChatbotButton;
