const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Socket.IO server for real-time chat
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      // add deployed frontend origin(s) here if needed
    ],
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('joinSession', ({ sessionId }) => {
    if (!sessionId) return;
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('sendMessage', (incomingMessage) => {
    try {
      if (!incomingMessage || !incomingMessage.sessionId) {
        return;
      }

      const message = {
        ...incomingMessage,
        createdAt: incomingMessage.createdAt || new Date().toISOString(),
      };

      // emit to all clients in the same session room
      io.to(incomingMessage.sessionId).emit('receiveMessage', message);
    } catch (err) {
      console.error('Error handling sendMessage:', err);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

// Serve static files from the React app (optional for production)
app.use(express.static(path.join(__dirname, '..', 'build')));

// API endpoint (optional)
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from Express API!' });
});

// Catch-all to serve React app for any route (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
