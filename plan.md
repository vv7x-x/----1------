# Python Desktop Application for WhatsApp Bot Control

## Project Overview
Create a Python desktop application to control a WhatsApp bot built with Node.js and Baileys library. The application will provide a GUI interface to view conversations, read messages in ghost mode, and send messages secretly.

## Existing Bot Analysis
The existing bot is built with:
- Node.js using Baileys library (@whiskeysockets/baileys)
- Express.js server with Socket.IO for real-time communication
- Dashboard with basic web interface
- Message handling through event emitters

## Application Requirements

### 1. GUI Features
- Display list of conversations (chats)
- Show message content within each conversation
- Send messages without read receipts or online status (ghost mode)
- Field to send new messages
- Simple authentication (password/token)

### 2. Backend Integration
- Connect to existing Node.js bot via API/WebSocket
- Real-time data transfer for messages and chats
- Secure communication with authentication

### 3. Data Storage
- SQLite database for storing conversations and messages
- Local storage for user preferences

## Implementation Plan

### Phase 1: Backend API Enhancement
1. Enhance existing server.js to support additional endpoints:
   - GET /api/chats - Get all chats
   - GET /api/chats/:id/messages - Get messages for a specific chat
   - POST /api/send - Send message to a chat
   - POST /api/read - Mark message as read (ghost mode)
   - Authentication endpoints

### Phase 2: Python Desktop Application
1. Create GUI with PyQt5/Tkinter
2. Implement authentication system
3. Connect to backend API
4. Display conversations and messages
5. Implement ghost mode functionality
6. Add message sending capabilities
7. Implement SQLite database for local storage

### Phase 3: Ghost Mode Implementation
1. Reading messages without sending read receipts
2. Sending messages without typing indicators
3. Maintaining offline status while using the app

## File Structure
```
whatsapp-controller/
├── backend/
│   ├── server.js (enhanced)
│   └── api.js (new)
├── frontend/
│   ├── main.py (main application)
│   ├── gui.py (GUI components)
│   ├── api_client.py (API communication)
│   ├── database.py (SQLite integration)
│   └── auth.py (authentication)
├── database/
│   └── messages.db (SQLite database)
└── requirements.txt
```

## Technical Details

### Backend Endpoints
1. `GET /api/chats` - Returns list of all chats
2. `GET /api/chats/:id/messages` - Returns messages for a specific chat
3. `POST /api/send` - Send a message
   - Body: { chatId, message }
4. `POST /api/read` - Mark message as read (ghost mode)
   - Body: { chatId, messageId }
5. `POST /api/auth` - Authentication
   - Body: { username, password }

### Ghost Mode Implementation
1. When reading messages, don't send read receipts to WhatsApp
2. When sending messages, use options to prevent typing indicators
3. Maintain offline status by not updating presence

### Database Schema
```sql
CREATE TABLE chats (
    id TEXT PRIMARY KEY,
    name TEXT,
    last_message TEXT,
    timestamp DATETIME
);

CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT,
    sender TEXT,
    message TEXT,
    timestamp DATETIME,
    is_outgoing BOOLEAN
);

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username TEXT UNIQUE,
    password_hash TEXT
);
