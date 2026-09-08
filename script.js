const express = require('express');
const path = require('path');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));


io.on('connection',(socket) => {
    console.log(`firefly arrived : ${socket.id}`);
});

socket.on('disconnect', () => {
    console.log(`firefly left: ${socket.id}`);
  });

  
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
