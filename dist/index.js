"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * import All the modules
 */
require('dotenv').config({ path: '.env' });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
/**
 * middleware to use
 * cors
 * expressjson
 * routes
 */
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer();
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
let users = [];
const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) && users.push({ userId, socketId });
};
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};
const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
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
