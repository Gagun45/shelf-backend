import type { Request, Response } from "express";
import Book from "../models/Books";
import shortid from "shortid";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { getIo, sendPrivateMessage } from "../websocket/socket";

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

const queryContsructor = (req: Request) => {
  const { title, toYear, fromYear, genres, languages, toPrice, fromPrice } =
    req.query;
  let query: any = {};
  if (title) {
    query.title = { $regex: title, $options: "i" };
  }
  if (fromYear || toYear) {
    query.publishYear = { $gte: fromYear ?? 1980, $lte: toYear ?? 2025 };
  }

  if (fromPrice || toPrice) {
    query.price = { $gte: fromPrice ?? 0, $lte: toPrice ?? 2000 };
  }

  if (genres) {
    const genresArray = typeof genres === "string" ? genres.split(",") : [];
    query.genres = { $all: genresArray };
  }
  if (languages) {
    const languagesArray =
      typeof languages === "string" ? languages.split(",") : [];
    query.language = { $in: languagesArray };
  }
  return query;
};

const sortConstructor = (req: Request) => {
  const { sortOption } = req.query;
  let sort: any = {};
  switch (sortOption) {
    case "YearAsc":
      sort.publishYear = 1;
      break;
    case "YearDesc":
      sort.publishYear = -1;
      break;
    case "PriceAsc":
      sort.price = 1;
      break;
    case "PriceDesc":
      sort.price = -1;
      break;
    case "AlphabetAsc":
      sort.title = 1;
      break;
    case "AlphabetDesc":
      sort.title = -1;
      break;
    default:
      sort.title = 1;
      break;
  }
  return sort;
};

export const getAllBooks = async (req: Request, res: Response) => {
  try {
    const query = queryContsructor(req);
    const sort = sortConstructor(req);
    const { limit, page } = req.query;
    const newLimit = typeof limit === "string" ? parseInt(limit) : 100;
    const newPage = typeof page === "string" ? parseInt(page) : 100;

    const [books, totalBooks] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .limit(newLimit)
        .skip(newLimit * (newPage - 1))
        .select("-_id -__v"),
      Book.find(query).sort(sort).countDocuments(),
    ]);
    res.status(200).json({ books, totalBooks });
    return;
  } catch (error) {
    console.log("Error fetching all books: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const getMyBooks = async (req: Request, res: Response) => {
  try {
    const query = queryContsructor(req);
    query.addedBy = req.userPid;
    const sort = sortConstructor(req);
    const { limit, page } = req.query;
    const newLimit = typeof limit === "string" ? parseInt(limit) : 100;
    const newPage = typeof page === "string" ? parseInt(page) : 100;

    const [books, totalBooks] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .limit(newLimit)
        .skip(newLimit * (newPage - 1))
        .select("-_id -__v"),
      Book.find(query).sort(sort).countDocuments(),
    ]);
    res.status(200).json({ books, totalBooks });
    return;
  } catch (error) {
    console.log("Error fetching my books: ", error);
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

export const deleteBookById = async (req: Request, res: Response) => {
  try {
    const { bookPid } = req.params;
    const book = await Book.findOneAndDelete({ bookPid, addedBy: req.userPid });
    if (!book) {
      res.status(404).json({ message: "Book not found" });
      return;
    }
    res.sendStatus(200);
    return;
  } catch (error) {
    console.log("Error deleting a book by id: ", error);
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

export const addBook = async (req: Request, res: Response) => {
  try {
    const { title, author, language, publishYear, genres, price } = req.body;
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
      price,
      publishYear: parseInt(publishYear),
      genres,
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
    const { title, author, language, publishYear, genres, price } = req.body;
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
    book.genres = genres;
    book.price = price;
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
