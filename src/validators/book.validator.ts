import { z } from "zod";

const allowedLanguages = ["Ukrainian", "English", "French"] as const;
const allowedGenres = [
  "Fantasy",
  "Science Fiction",
  "Mystery",
  "Thriller",
  "Romance",
  "Historical Fiction",
  "Horror",
  "Young Adult",
  "Dystopian",
  "Adventure",
  "Paranormal",
  "Contemporary",
  "Literary Fiction",
  "Non-Fiction",
  "Biography",
  "Self-Help",
  "Memoir",
  "Humor",
  "Graphic Novel",
  "Classic",
] as const;

const currentYear = new Date().getFullYear();

const multerFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number(),
});

export const bookSchema = z.object({
  body: z
    .object({
      title: z.string().min(2, {
        message: "Title must be at least 2 characters long",
      }),
      genres: z.array(z.enum(allowedGenres)).min(1, "Choose at least 1 genre"),
      author: z.string().min(2, {
        message: "Author must be at least 2 characters long",
      }),
      language: z.enum(allowedLanguages),
      publishYear: z.coerce
        .number({ message: "Must be a number" })
        .min(1900)
        .max(new Date().getFullYear()),
      price: z.coerce.number({ message: "Enter a number" }).min(1).max(20000),
      imageFile: multerFileSchema.optional().nullable(),
      imageUrl: z.string().optional(),
    })
    .refine((data) => data.imageFile !== null || !!data.imageUrl, {
      message: "Image must be added",
    }),
});
