import { Router } from "express";
import {
  addBook,
  deleteBookById,
  editBook,
  getAllBooks,
  getBookById,
  getMyBooks,
} from "../ctrls/bookCtrl";
import { isAdminAtLeast, isLoggedIn, jwtCheck } from "../middleware/auth";

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

router.post(
  "/add",
  jwtCheck,
  isLoggedIn,
  isAdminAtLeast,
  upload.single("imageFile"),
  addBook
);

router.get("/my-books", jwtCheck, isLoggedIn, isAdminAtLeast, getMyBooks);

router.get("/book/:bookPid", getBookById);

router.put(
  "/book/edit/:bookPid",
  jwtCheck,
  isLoggedIn,
  isAdminAtLeast,
  upload.single("imageFile"),
  editBook
);

router.delete(
  "/book/delete/:bookPid",
  jwtCheck,
  isLoggedIn,
  isAdminAtLeast,
  deleteBookById
);

export default router;
