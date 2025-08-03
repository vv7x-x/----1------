
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dashboard')));

// Simple authentication (in production, use proper auth)
const AUTH_TOKEN = 'secret_token_123'; // Change this in production

// In-memory storage for chats and messages (in production, use database)
let chats = {};
let messages = {};

// Serve static files from the dashboard directory
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard', 'index.html'));
});

// API Routes
// Authentication
app.post('/api/auth', (req, res) => {
  const { token } = req.body;
  if (token === AUTH_TOKEN) {
    res.json({ success: true, message: 'Authentication successful' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Get all chats
app.get('/api/chats', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  res.json({ success: true, chats: Object.values(chats) });
});

// Get messages for a specific chat
app.get('/api/chats/:id/messages', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const chatId = req.params.id;
  const chatMessages = messages[chatId] || [];
  res.json({ success: true, messages: chatMessages });
});

// Send message
app.post('/api/send', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const { chatId, message } = req.body;
  if (!chatId || !message) {
    return res.status(400).json({ success: false, message: 'Chat ID and message are required' });
  }
  
  try {
    // This would normally send the message through WhatsApp
    // For now, we'll just simulate it
    const response = { 
      success: true, 
      message: 'Message sent successfully',
      messageId: Date.now().toString()
    };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
});

// Mark message as read (ghost mode)
app.post('/api/read', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  const { chatId, messageId } = req.body;
  // In ghost mode, we don't actually send read receipts
  // This is just to acknowledge the request
  res.json({ success: true, message: 'Message marked as read (ghost mode)' });
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
  
  // Store chats when received
  eventEmitter.on('chats.update', (chatsUpdate) => {
    chatsUpdate.forEach(chat => {
      chats[chat.id] = chat;
    });
    io.emit('chats', Object.values(chats));
  });
  
  // Store messages when received
  eventEmitter.on('messages.upsert', (msg) => {
    if (msg.messages && msg.messages[0]) {
      const message = msg.messages[0];
      const chatId = message.key.remoteJid;
      
      if (!messages[chatId]) {
        messages[chatId] = [];
      }
      
      messages[chatId].push({
        id: message.key.id,
        sender: message.key.participant || message.key.remoteJid,
        message: message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || 
                 '[Media Message]',
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 messages per chat
      if (messages[chatId].length > 50) {
        messages[chatId] = messages[chatId].slice(-50);
      }
      
      io.emit('message', { chatId, message: messages[chatId][messages[chatId].length - 1] });
    }
  });
}

module.exports = { startServer, io };
