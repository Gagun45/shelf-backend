import type { Request, Response } from "express";
import type { BookOrderInterface } from "../models/Order";
import Order from "../models/Order";
import Book from "../models/Books";
import shortid from "shortid";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userPid = req.userPid;
    const items = req.body.items as { bookPid: string; quantity: number }[];
    const bookPids = items.map((item) => item.bookPid);
    const dbBooks = await Book.find({ bookPid: { $in: bookPids } });
    const orderBooks: BookOrderInterface[] = dbBooks.map((book) => {
      const cartItem = items.find((item) => item.bookPid === book.bookPid);
      const quantity = cartItem?.quantity || 0;
      return {
        author: book.author,
        price: book.price,
        quantity,
        title: book.title,
      };
    });

    const totalPrice = orderBooks.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await Order.create({
      books: orderBooks,
      orderPid: shortid.generate(),
      totalPrice,
      userPid,
    });
    res.status(201).json({ message: "Success" });
    return;
  } catch (error) {
    console.log("Error fetching a book by id: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const userPid = req.userPid;
    const orders = await Order.find({ userPid }).select("-_id -__v");
    res.status(200).json(orders);
    return;
  } catch (error) {
    console.log("Error fetching my orders", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().select("-_id -__v");
    res.status(200).json(orders);
    return;
  } catch (error) {
    console.log("Error fetching all orders", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const editOrder = async (req: Request, res: Response) => {
  try {
    const { status, orderPid } = req.body;
    await Order.findOneAndUpdate({ orderPid }, { status });
    res.status(200).json({ message: "Order edited" });
    return;
  } catch (error) {
    console.log("Error editing an order", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};
