import { Server as SocketIoServer } from "socket.io";
import { Server as ServerHttp } from "http";

interface UserSocketMap {
  [userPid: string]: string;
}

let io: SocketIoServer | null = null;
const userSocketMap: UserSocketMap = {};

export const initSocket = (server: ServerHttp) => {
  io = new SocketIoServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  io.on("connection", (socket) => {
    socket.on("register", (userPid: string) => {
      userSocketMap[userPid] = socket.id;
      console.log(`User ${userPid} mapped to ${socket.id}`);
    });
  });
  return io;
};

export const sendPrivateMessage = (
  userPid: string,
  event: string,
  message: string
) => {
  const io = getIo();
  const socketId = userSocketMap[userPid]
  console.log('sending private msg', socketId)
  io.to(socketId).emit(event, { message });
};

export const getIo = () => {
  if (!io) {
    throw new Error("sock not");
  }
  return io;
};
