import mongoose, { Schema } from "mongoose";

interface BookType {
  title: string;
  author: string;
  bookPid: string;
  addedBy: string;
  imageUrl: string;
  language: string;
  publishYear: number;
  genres: [string];
  price: number;
  createdAt?: Date;
}

const bookSchema = new Schema<BookType>(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    bookPid: {
      type: String,
      required: true,
      unique: true,
    },
    addedBy: {
      type: String,
      ref: "User",
    },
    imageUrl: {
      type: String,
    },
    language: {
      type: String,
      required: true,
    },
    publishYear: {
      type: Number,
      required: true,
    },
    genres: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      requiredPaths: true,
    },
  },
  { timestamps: true }
);

const Book = mongoose.model<BookType>("Book", bookSchema);
export default Book;
