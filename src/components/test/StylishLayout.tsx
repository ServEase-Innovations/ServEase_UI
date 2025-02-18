import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const topItems = [
  { name: "Item 1", color: "bg-blue-500", content: "Content for Item 1" },
  { name: "Item 2", color: "bg-red-500", content: "Content for Item 2" },
  { name: "Item 3", color: "bg-green-500", content: "Content for Item 3" },
];

export default function StylishLayout() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % topItems.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col justify-between items-center bg-gradient-to-br from-gray-900 to-gray-700 p-6 relative">
      {/* Top Items */}
      <div className="flex gap-6 mt-10">
        {topItems.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.1 }}
            onMouseEnter={() => setActiveIndex(index)}
            className={`p-6 rounded-xl shadow-lg ${item.color} text-white text-lg font-semibold cursor-pointer`}
          >
            {item.name}
          </motion.div>
        ))}
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center flex-1 text-white text-lg font-semibold">
        <div className="p-6 bg-white/20 backdrop-blur-lg rounded-xl shadow-lg">
          {topItems[activeIndex].content}
        </div>
      </div>

      {/* Bottom Fixed Sections */}
      <div className="absolute bottom-4 flex gap-6">
        <div className="p-6 bg-white/20 backdrop-blur-lg rounded-xl shadow-lg text-white text-lg font-semibold">
          Fixed Left
        </div>
        <div className="p-6 bg-white/20 backdrop-blur-lg rounded-xl shadow-lg text-white text-lg font-semibold">
          Fixed Right
        </div>
      </div>
    </div>
  );
}
