const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('chatMessage', async (msg) => {
    const chatMessage = new Chat({ username: msg.username, message: msg.message });
    await chatMessage.save();
    io.emit('message', msg);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
