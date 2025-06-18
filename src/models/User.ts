import mongoose, { Schema } from "mongoose";
interface UserType {
  email: string;
  auth0Id: string;
  userPid: string;
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
});

const User = mongoose.model<UserType>("User", userSchema);
export default User;
