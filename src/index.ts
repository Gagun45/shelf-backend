import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import orderRoutes from "./routes/orderRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import { v2 as cloudinary } from "cloudinary";
import http from "http";
import { initSocket } from "./websocket/socket";

const app = express();

mongoose.connect(process.env.MONGODB_URL as string).then(() => {
  console.log("Connected to db");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(
  cors({
    origin: "*",
  })
);

const server = http.createServer(app);

const io = initSocket(server);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

server.listen(7000, () => {
  console.log("Listening on port 7000");
});
