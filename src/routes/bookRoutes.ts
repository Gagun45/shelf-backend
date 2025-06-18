import { Router, type Request, type Response } from "express";
import Book from "../models/Books";
import { addBook, editBook, getAllBooks, getBookById } from "../ctrls/bookCtrl";
import { jwtCheck, jwtParse } from "../middleware/auth";

import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

router.get("/all", getAllBooks);

router.post("/add", jwtCheck, jwtParse, upload.single("imageFile"), addBook);

router.get(
  "/my-books",
  jwtCheck,
  jwtParse,
  async (req: Request, res: Response) => {
    try {
      const userPid = req.userPid;
      const myBooks = await Book.find({ addedBy: req.userPid }).select(
        "-_id -__v"
      );
      res.status(200).json(myBooks);
      return;
    } catch (error) {
      console.log("Error fetching my books: ", error);
      res.status(500).json({ message: "Something went wrong" });
      return;
    }
  }
);

router.get("/book/:bookPid", getBookById);

router.put(
  "/book/edit/:bookPid",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  editBook
);

export default router;
