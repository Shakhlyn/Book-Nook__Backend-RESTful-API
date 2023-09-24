import mongoose from "mongoose";
const validator = require("validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Please provide your name"],
    trim: true,
  },

  email: {
    type: String,
    required: [true, "please provide your email address"],
    unique: true,
    lowerCase: true,
    validate: {
      validator: function (value) {
        // Use a regular expression to validate the email format
        // You can use the same validator library if you prefer
        return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
      },
      message: "Please provide a valid email",
    },
    // validate: [validator.isEmail, "Please provide a valid email"],
  },

  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },

  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Password are not the same!",
    },
  },

  photo: {
    type: String,
  },

  dateOfBirth: String,

  role: {
    type: String,
    enum: ["admin", "author", "seller", "user"],
    default: "user",
  },

  active: {
    type: Boolean,
    default: true,
    select: false,
  },

  address: String,

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  //   purchaseHistory: []

  //   wishlist: []
});

const User = mongoose.model("User", userSchema);

export default User;
