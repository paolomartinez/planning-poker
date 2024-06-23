const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const users = new Set();
const votes = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (username) => {
    users.add(username);
    votes.delete(username);
    io.emit('users', Array.from(users));
    io.emit('votes', Object.fromEntries(votes));
  });

  socket.on('vote', ({ username, value }) => {
    votes.set(username, value);
    io.emit('votes', Object.fromEntries(votes));
  });

  socket.on('reset', () => {
    votes.clear();
    io.emit('votes', Object.fromEntries(votes));
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
