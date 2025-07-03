import { Server as SocketIoServer } from "socket.io";
import { Server as ServerHttp } from "http";

interface UserSocketMap {
  [userPid: string]: string;
}

let IO_CLIENT: SocketIoServer | null = null;
const userSocketMap: UserSocketMap = {};

export const initSocket = (server: ServerHttp) => {
  console.log('SOCKET INITIALIZED')
  IO_CLIENT = new SocketIoServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  IO_CLIENT.on("connection", (socket) => {
    socket.on("register", (userPid: string) => {
      userSocketMap[userPid] = socket.id;
      console.log(`User ${userPid} mapped to ${socket.id}`);
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
  console.log('sending private msg', socketId)
  ios.to(socketId).emit(event, { message });
};

export const getIo = () => {
  if (!IO_CLIENT) {
    throw new Error("sock not");
  }
  return IO_CLIENT;
};
