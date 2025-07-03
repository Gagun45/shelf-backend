import { Server as SocketIoServer } from "socket.io";
import { Server as ServerHttp } from "http";

interface UserSocketMap {
  [userPid: string]: string;
}

let IO_CLIENT: SocketIoServer | null = null;
const userSocketMap: UserSocketMap = {};

export const initSocket = (server: ServerHttp) => {
  IO_CLIENT = new SocketIoServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  IO_CLIENT.on("connection", (socket) => {
    socket.on("register", (userPid: string) => {
      userSocketMap[userPid] = socket.id;
    });
  });
  return IO_CLIENT;
};

export const sendPrivateMessage = (
  userPid: string,
  event: string,
  message: string
) => {
  const ios = getIo();
  const socketId = userSocketMap[userPid]
  ios.to(socketId).emit(event, { message });
};

export const getIo = () => {
  if (!IO_CLIENT) {
    throw new Error("socket not initialized");
  }
  return IO_CLIENT;
};
