// socket.js – initialize Socket.io server and expose getter
const { Server } = require('socket.io');
let io = null;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  io.on('connection', (socket) => {
    console.log('🟢 Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
}

function getIo() {
  return io;
}

module.exports = { initSocket, getIo };
