import { type Request, type Response } from "express";
import User from "../models/User";
import shortid from "shortid";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const auth0Id = req.auth?.payload.sub;

    if (!auth0Id || !email) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    const existingUser = await User.findOne({ auth0Id });

    if (existingUser) {
      res.status(200).json({ message: "User already exists" });
      return;
    }
    const newUser = await User.create({
      auth0Id,
      email,
      userPid: shortid.generate(),
    });
    res.status(201).json(newUser.toObject());
    return;
  } catch (error) {
    console.log("Error creating user: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};
