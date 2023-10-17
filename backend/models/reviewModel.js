import mongoose from "mongoose";

import Book from "./bookModel.js";

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
    required: [true, "rating can not be empty!"],
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

// Preventing duplicate review being posted using unique index
reviewSchema.index({ book: 1, user: 1 }, { unique: true });

// Populate() 'user' in the 'review'
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "username -_id",
  });

  next();
});

reviewSchema.statics.calculateAverageRatings = async function (bookId) {
  const stats = await this.aggregate([
    { $match: { book: bookId } },
    {
      $group: {
        _id: "$book",
        numberOfRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  // console.log(stats);
  if (stats.length > 0) {
    await Book.findByIdAndUpdate(bookId, {
      ratingsQuantity: stats[0].numberOfRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Book.findByIdAndUpdate(bookId, {
      $unset: {
        ratingsAverage: "",
      },
    });
  }
};

reviewSchema.post("save", function () {
  // since we update the database according to the all the review instances, not this only one instance, we need to call the model. to get model, we have to call 'this.constructor'
  this.constructor.calculateAverageRatings(this.book);
});

// Get document instance from a query, setting 'this.review'. This document instance will be used in the next middleware
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.clone().findOne();
  // same query can't be requested twice. Therefore, use 'clone()' to get document form the cloned query.
  next();
});

// update the database after updating/deleting a review
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); Doesn't work here bacause the query has already been executed. Thus, we need a "pre" hook
  await this.review.constructor.calculateAverageRatings(this.review.book);

  // In this code, "this" refers to the query being executed for the findOneAnd... operation, not the document instance.
  // this.review is a reference to the original document (before the update or deletion).
  // this.review.constructor is used to access the model associated with the review document, and then calculatedAverageRatings is called as a static method on that model.
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
