import mongoose, { model, Schema } from "mongoose";

export interface BookOrderInterface {
  title: string;
  author: string;
  price: number;
  quantity: number;
}

interface OrderInterface {
  orderPid: string;
  books: BookOrderInterface[];
  totalPrice: number;
  userPid: string;
  status: "pending" | "success" | "cancelled";
}

const orderSchema = new Schema<OrderInterface>({
  userPid: {
    ref: "User",
    type: String,
    required: true,
  },
  orderPid: {
    type: String,
    unique: true,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  books: [
    {
      title: { type: String, required: true },
      author: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  status: {
    type: String,
    required: true,
    default: "pending",
  },
});

const Order = mongoose.model<OrderInterface>("Order", orderSchema);
export default Order;
