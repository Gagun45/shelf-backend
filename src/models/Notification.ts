import mongoose, { model, Schema } from "mongoose";

interface NotificationInterface {
  notificationPid: string;
  userPid: string;
  message: string;
  status: "notRead" | "read";
}

const notificationSchema = new Schema<NotificationInterface>(
  {
    notificationPid: {
      type: String,
      required: true,
      unique: true,
    },
    userPid: {
      type: String || null,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "notRead",
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model<NotificationInterface>(
  "Notification",
  notificationSchema
);
export default Notification;
