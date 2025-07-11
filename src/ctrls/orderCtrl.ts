import type { Request, Response } from "express";
import type { BookOrderInterface } from "../models/Order";
import Order from "../models/Order";
import Book from "../models/Books";
import shortid from "shortid";
import { sendPrivateMessage } from "../websocket/socket";
import Notification from "../models/Notification";

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userPid = req.userPid;
    const items = req.body.items as { bookPid: string; quantity: number }[];
    const bookPids = items
      .filter((b) => b.quantity > 0)
      .map((item) => item.bookPid);
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
    const orderQuery = queryConstructor(req);
    orderQuery.userPid = req.userPid;
    const { limit, page } = req.query;
    const sort: any = {};
    sort.createdAt = -1;
    const newLimit = typeof limit === "string" ? parseInt(limit) : 5;
    const newPage = typeof page === "string" ? parseInt(page) : 5;
    const [orders, totalOrders] = await Promise.all([
      Order.find(orderQuery)
        .sort(sort)
        .limit(newLimit)
        .skip(newLimit * (newPage - 1))
        .select("-_id -__v"),
      Order.find(orderQuery).countDocuments(),
    ]);
    res.status(200).json({ orders, totalOrders });
    return;
  } catch (error) {
    console.log("Error fetching my orders", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  const orderQuery = queryConstructor(req);
  const { limit, page } = req.query;
  const sort: any = {};
  sort.createdAt = -1;

  const newLimit = typeof limit === "string" ? parseInt(limit) : 5;
  const newPage = typeof page === "string" ? parseInt(page) : 5;
  try {
    const [orders, totalOrders] = await Promise.all([
      Order.find(orderQuery)
        .sort(sort)
        .limit(newLimit)
        .skip(newLimit * (newPage - 1))
        .select("-_id -__v"),
      Order.find(orderQuery).countDocuments(),
    ]);
    res.status(200).json({ orders, totalOrders });
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
    if (!["pending", "success", "cancelled"].includes(status) || !orderPid) {
      res.status(400).json({ message: "Bad data format" });
      return;
    }
    const newOrder = await Order.findOneAndUpdate(
      { orderPid },
      { status },
      { new: true }
    );
    if (newOrder) {
      await Notification.create({
        message: `Order status changed to ${newOrder.status}`,
        notificationPid: shortid.generate(),
        userPid: newOrder.userPid,
      });
      sendPrivateMessage(
        newOrder.userPid,
        "private_message",
        `Order status update`
      );
    }
    res.status(200).json({ message: "Order edited" });
    return;
  } catch (error) {
    console.log("Error editing an order", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

const queryConstructor = (req: Request) => {
  const allowedSortOptions = ["pending", "success", "cancelled"];
  const { limit, page, sortOption, searchQuery } = req.query;
  let orderQuery: any = {};
  if (sortOption && allowedSortOptions.includes(sortOption.toString())) {
    orderQuery.status = sortOption;
  }
  if (searchQuery) {
    orderQuery.books = {
      $elemMatch: { title: { $regex: searchQuery, $options: "i" } },
    };
  }
  return orderQuery;
};
