import type { Request, Response } from "express";
import Book from "../models/Books";
import shortid from "shortid";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

const uploadImage = async (file: Express.Multer.File) => {
  const base64Image = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64Image}`;

  const uploadResponse = await cloudinary.uploader.upload(dataUri);
  return uploadResponse.url;
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const books = await Book.find().select("-_id -__v");
    res.status(200).json(books);
    return;
  } catch (error) {
    console.log("Error fetching all books: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const getBookById = async (req: Request, res: Response) => {
  try {
    const { bookPid } = req.params;
    const book = await Book.findOne({ bookPid }).select("-_id -__v");
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.status(200).json(book);
    return;
  } catch (error) {
    console.log("Error fetching a book by id: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, author, language, publishYear } = req.body;
    const image = req.file;
    let imageUrl = "";
    if (image) {
      imageUrl = await uploadImage(image);
    }
    const userPid = req.userPid;
    const newBook = await Book.create({
      author,
      title,
      bookPid: shortid.generate(),
      addedBy: userPid,
      imageUrl,
      language,
      publishYear: parseInt(publishYear),
    });
    res.status(201).json(newBook);
    return;
  } catch (error) {
    console.log("Error adding new book: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const editBook = async (req: Request, res: Response) => {
  try {
    const { bookPid } = req.params;
    const { title, author, language, publishYear } = req.body;
    let newImageUrl = "";
    if (req.file) {
      newImageUrl = await uploadImage(req.file);
    }
    const book = await Book.findOne({ bookPid });
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }
    if (book?.addedBy !== req.userPid) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }

    book.title = title;
    book.author = author;
    book.language = language;
    book.publishYear = parseInt(publishYear);
    if (newImageUrl) {
      book.imageUrl = newImageUrl;
    }
    await book.save();
    res.status(201).json({ message: "Book edited" });
    return;
  } catch (error) {
    console.log("Error editing a book: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};
