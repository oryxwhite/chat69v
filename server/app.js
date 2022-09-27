const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server,{
      cors: {
      origin: "*",
      methods: ["GET", "POST"],
    }
  }); 

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        console.log(msg)
        io.emit('chat message', msg)
    })
})

io.on('connection', (socket) => {
    console.log('a user connected  ' + socket.id);
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("invalid username"));
  }
  socket.username = username;
  console.log(socket.username)
  next();
});

io.on("connection", (socket) => {
  const users = [];
  for (let [id, socket] of io.of("/").sockets) {
    users.push({
      userID: id,
      username: socket.username,
      messages: []
    });
  }
  socket.emit("users", users);
});

io.on("connection", (socket) => {
  socket.broadcast.emit("user connected", {
    userID: socket.id,
    username: socket.username,
  });
});

io.on('connection', (socket) => {
  socket.on('private message', ({ content, to }) => {
    socket.to(to).emit('private message', {
      content,
      from: socket.id
    })
  })
})

server.listen(3000, () => {
    console.log('Listening on port 3000')
})
