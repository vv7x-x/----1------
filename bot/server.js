
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the dashboard directory
app.use(express.static(path.join(__dirname, '../dashboard')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard', 'index.html'));
});

io.on('connection', (socket) => {
  console.log('a user connected to dashboard');
  socket.on('disconnect', () => {
    console.log('user disconnected from dashboard');
  });
});

function startServer(eventEmitter) {
  server.listen(PORT, () => {
    console.log(`Dashboard server running on http://localhost:${PORT}`);
  });

  // Forward events from the bot to the dashboard
  eventEmitter.on('qr', (qr) => io.emit('qr', qr));
  eventEmitter.on('status', (status) => io.emit('status', status));
  eventEmitter.on('chats', (chats) => io.emit('chats', chats));
  eventEmitter.on('message', (message) => io.emit('message', message));
}

module.exports = { startServer, io };
