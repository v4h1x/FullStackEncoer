import {Server } from "socket.io";

const io = new Server();

io.on('connect', (socket) => {
    console.log(`new connection ${socket.id}`);

    const session = socket.request.session;
    // Saving socketId in session
    session.socketId = socket.id;
    session.save();
});

export default io;