/**
 * import All the modules
 */
require('dotenv').config({ path: '.env' });
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();

/**
 * middleware to use
 * cors
 * expressjson
 * routes
 */
app.use(cors());
app.use(express.json());

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let users: any = [];

const addUser = (userId: string, socketId: string) => {
  !users.some((user: any) => user.userId === userId) && users.push({ userId, socketId });
};

const removeUser = (socketId: string) => {
  users = users.filter((user: any) => user.socketId !== socketId);
};

const getUser = (userId: string) => {
  return users.find((user: any) => user.userId === userId);
};
/**
 * initiate io connection
 */
io.on('connection', (socket) => {
  console.log(`Socket connected ${socket.id}`);
  //Add user to socket
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });


  //send and get message
  socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit('getMessage', {
      senderId,
      text,
    });
  });


  //when disconnect user
  socket.on('disconnect', () => {
    console.log('a user disconnected!');
    removeUser(socket.id);
    io.emit('getUsers', users);
  });
});

/**
 * extract PORT from env file
 * initiate the app
 */
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.info(`Server listening at PORT: ${PORT}`);
});
