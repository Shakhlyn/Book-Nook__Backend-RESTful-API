import Book from "../models/bookModel.js";

import {
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} from "./handlerFactory.js";

export const getAllBooks = getAll(Book);
export const getBook = getOne(Book, {
  path: "reviews",
  select: "review rating",
});
export const createBook = createOne(Book);
export const updateBook = updateOne(Book);
export const deleteBook = deleteOne(Book);
