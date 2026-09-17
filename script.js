const express = require('express');
const path = require('path');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const fireflies = new Map();

io.on('connection',(socket) => {
    console.log(`firefly arrived : ${socket.id}`);
const state = {
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90
};

 fireflies.set(socket.id, state);

socket.emit('firefly:roster', Object.fromEntries(fireflies));
socket.broadcast.emit('firefly:joined', { id: socket.id, ...state });

socket.on('firefly:fire', () => {
  console.log('FIRE RECEIVED FROM:', socket.id);

  socket.broadcast.emit('firefly:fired', socket.id);
});

  socket.on('firefly:scatter', () => {
    io.emit('firefly:scattered');
  });

    socket.on('disconnect', () => {
        fireflies.delete(socket.id);
        socket.broadcast.emit('userDisconnected', socket.id);
        console.log(`firefly left: ${socket.id}`);
    });
  });


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});
