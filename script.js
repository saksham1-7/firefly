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
  phase: Math.random() * Math.PI * 2,
        frequency: 0.8 + Math.random() * 0.6,
        x: 5 + Math.random() * 90,
        y: 5 + Math.random() * 90
};

 fireflies.set(socket.id, state);


    socket.on('disconnect', () => {
       fireflies.delete(socket.id);
    socket.broadcast.emit('userDisconnected',socket.id);
    console.log(`firefly left: ${socket.id}`);
  });

  socket.on('firefly:phase',(phase) => {

    const f = fireflies.get(socket.id);
    if (f) 
      f.phase = phase;
  });

});

setInterval(()=> {
   
  io.emit('swarm:sync',Object.fromEntries(fireflies));
  },100);


  
server.listen(3000, () => {
  console.log('server running at http://localhost:3000');
});
