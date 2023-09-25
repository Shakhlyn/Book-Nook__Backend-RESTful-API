import mongoose from "mongoose";

// import Book from "./bookModel";

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    required: [true, "Review can not be empty!"],
  },

  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "A review must be belonged to a user"],
  },

  book: {
    type: mongoose.Schema.ObjectId,
    ref: "Book",
    required: [true, "A review must be belonged to a book"],
  },
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
