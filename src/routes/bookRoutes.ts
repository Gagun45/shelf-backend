import { Router, type Request, type Response } from "express";
import Book from "../models/Books";
import {
  addBook,
  editBook,
  getAllBooks,
  getBookById,
  getMyBooks,
} from "../ctrls/bookCtrl";
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

router.get("/my-books", jwtCheck, jwtParse, getMyBooks);

router.get("/book/:bookPid", getBookById);

router.put(
  "/book/edit/:bookPid",
  jwtCheck,
  jwtParse,
  upload.single("imageFile"),
  editBook
);

export default router;
