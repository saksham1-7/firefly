const express = require('express');
const path = require('path');
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static(path.join(__dirname)));

const phaseMap = new Map();

io.on('connection',(socket) => {
    console.log(`firefly arrived : ${socket.id}`);

socket.on('phase',(phase) => {
  phaseMap.set(socket.id,phase);
    console.log(`socket ${socket.id} is in phase ${phase}`);
})

    socket.on('disconnect', () => {
       phaseMap.delete(socket.id);
    socket.broadcast.emit('userDisconnected',socket.id);
    console.log(`firefly left: ${socket.id}`);
  });

});

setInterval(()=> {
    const phases = Object.fromEntries(phaseMap);
    io.emit('phases',phases);
  },100);


  
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
