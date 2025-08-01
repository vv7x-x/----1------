const socket = io();

const connectionStatus = document.getElementById('connection-status');
const qrSection = document.getElementById('qr-section');
const qrCanvas = document.getElementById('qr-canvas');
const statusLog = document.getElementById('status-log');
const chatList = document.getElementById('chat-list');
const messageList = document.getElementById('message-list');

function addLog(message) {
    const p = document.createElement('p');
    p.textContent = message;
    statusLog.appendChild(p);
    statusLog.scrollTop = statusLog.scrollHeight;
}

function addChat(chat) {
    const li = document.createElement('li');
    li.textContent = chat.name || chat.id || 'دردشة بدون اسم';
    chatList.appendChild(li);
}

function addMessage(message) {
    const li = document.createElement('li');
    li.textContent = `[${message.sender || 'غير معروف'}]: ${message.text || JSON.stringify(message)}`;
    messageList.appendChild(li);
    messageList.scrollTop = messageList.scrollHeight;
}

function clearQR() {
    const ctx = qrCanvas.getContext('2d');
    ctx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
}

function drawQR(qr) {
    clearQR();
    // Use a QR code library to draw QR code on canvas
    // Since no library is included, display QR text as fallback
    const ctx = qrCanvas.getContext('2d');
    ctx.font = '14px Arial';
    ctx.fillText(qr, 10, 50);
}

socket.on('connect', () => {
    connectionStatus.textContent = 'حالة الاتصال: متصل';
    addLog('تم الاتصال بخادم الويب.');
    qrSection.classList.add('hidden');
});

socket.on('disconnect', () => {
    connectionStatus.textContent = 'حالة الاتصال: غير متصل';
    addLog('تم قطع الاتصال بخادم الويب.');
});

socket.on('qr', (qr) => {
    connectionStatus.textContent = 'حالة الاتصال: في انتظار مسح رمز QR';
    addLog('تم استلام رمز QR.');
    qrSection.classList.remove('hidden');
    drawQR(qr);
});

socket.on('status', (status) => {
    addLog(`الحالة: ${status}`);
    if (status.toLowerCase().includes('connected')) {
        qrSection.classList.add('hidden');
    }
});

socket.on('chats', (chats) => {
    chatList.innerHTML = '';
    chats.forEach(addChat);
});

socket.on('message', (message) => {
    addMessage(message);
});
