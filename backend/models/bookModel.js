import mongoose from "mongoose";
import slugify from "slugify";

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "A book must have a name"],
    trim: true,
  },

  slug: String,

  category: String,

  isbn: {
    type: String,
    required: [true, "A book must have a ISBN number"],
  },

  authors: {
    type: String,
    required: [true, "A book must have author(s)"],
  },

  language: String,

  translated: Boolean,

  ratingsAverage: {
    type: Number,
    default: 4,
    min: [1, "Rating must be equal or above 1.0"],
    max: [5, "Rating must be equal or less than 5.0"],
    set: (val) => Math.round(val * 10) / 10,
  },

  ratingsQuantity: {
    type: Number,
    default: 0,
  },

  price: {
    type: Number,
    required: [true, "A book must have a price"],
  },

  Discount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: "Discount price should be below regular price",
    },
  },

  shortDescription: {
    type: String,
    required: [true, "A book must have a short description"],
  },

  longDescription: {
    type: String,
    required: [true, "A book must have a long description"],
  },

  imageCover: {
    type: String,
    required: [true, "A book must have a cover photo"],
  },

  images: [String],

  pageCount: Number,
  publicationDate: String,

  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },

  thumbnailUrl: String,

  genre: String,

  publisher: String,

  stockQuantity: {
    type: Number,
    required: [true, "A book must have quantity of stocks"],
  },

  Dimention: String,

  weight: Number,

  //   reviews: 'will be defined as virtual property'

  format: String,

  edition: String,

  condition: String,

  keyword: [String],

  bestSeller: Boolean,
});

const Book = mongoose.model("Book", bookSchema);

export default Book;
