import mongoose, { Schema } from "mongoose";
interface UserType {
  email: string;
  auth0Id: string;
  userPid: string;
  role: "admin" | "user";
}

const userSchema = new Schema<UserType>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  auth0Id: {
    type: String,
    required: true,
    unique: true,
  },
  userPid: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
});

const User = mongoose.model<UserType>("User", userSchema);
export default User;
