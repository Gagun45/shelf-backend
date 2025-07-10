import type { Request, Response } from "express";
import Notification from "../models/Notification";

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userPid = req.userPid;
    const sort: any = {};
    sort.createdAt = -1;
    const myNotifications = await Notification.find({ userPid }).sort(sort);
    res.status(200).json(myNotifications);
    return;
  } catch (error) {
    console.log("Error fetching my notifications: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const updateStatusNotification = async (req: Request, res: Response) => {
  try {
    const userPid = req.userPid;
    const { notificationPid } = req.body;
    if (!notificationPid) {
      res.status(400).json({ message: "Notification pid required" });
      return;
    }
    await Notification.findOneAndUpdate(
      { userPid, notificationPid },
      { status: "read" }
    );
    res.status(200).json({ message: "Notification status updated" });
    return;
  } catch (error) {
    console.log("Error updating status notification: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};
