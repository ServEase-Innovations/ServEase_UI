import React from "react";
import { motion } from "framer-motion";
import { AppWindow, Camera, Music, Settings, MessageSquare, Clock } from "lucide-react";

export function Card({ children, className }) {
  return <div className={`p-4 bg-white rounded-lg shadow ${className}`}>{children}</div>;
}

const apps = [
  { name: "Safari", icon: <AppWindow size={40} /> },
  { name: "Camera", icon: <Camera size={40} /> },
  { name: "Music", icon: <Music size={40} /> },
  { name: "Settings", icon: <Settings size={40} /> },
  { name: "Messages", icon: <MessageSquare size={40} /> },
  { name: "Clock", icon: <Clock size={40} /> },
];

 

export default function AppleHomeScreen() {
  return (
    <div> Our Services 
    <div style={{display :'flex'}}>
      <div style={{width:'30%' , border:'1px solid'}} >
        <p>Maid</p>
        <div>
          <p> 1. Maid services highlight 1 </p>
          <p> 2. Maid services highlight 2 </p>
          <p> 3. Maid services highlight 3 </p> 
          <p> 4. Maid services highlight 4 </p>
        </div>
      </div>
      <div style={{width:'30%' , border:'1px solid'}}>
        <p>Cook</p>
        <div>
          <p> 1. Cook Point </p>
          <p> 2. Cook Point  </p>
          <p> 3. Cook Point </p>
          <p> 4. Cook Point</p>
        </div>
      </div>
      <div style={{width:'30%' , border:'1px solid'}}>
        <p> Nanny </p>
        <div>
          <p>1. Nanny Point</p>
          <p>1. Nanny Point</p>
          <p>1. Nanny Point</p>
          <p>1. Nanny Point</p>
        </div>
      </div>
    </div>
    <div>
      <div style={{display:'flex'}}>
        <div style={{width : '50%'}}>
          Our Promise
        </div>
        <div style={{width : '50%'}}>
          What we offer 
        </div>
      </div>
    </div>
    </div>
  );
}
