/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable */
import React, { useState } from 'react';

const CustomContextMenu: React.FC<{ position: { x: number; y: number }; data: any; onClose: () => void }> = ({ position, data, onClose }) => {
    return (
        <div style={{ position: 'absolute', top: position.y, left: position.x, background: 'white', border: '1px solid #ccc', zIndex: 1000 }}>
            <button onClick={() => { console.log('Edit:', data); onClose(); }}>Edit</button>
            <button onClick={() => { console.log('Action:', data); onClose(); }}>Action</button>
        </div>
    );
};

export default CustomContextMenu;
