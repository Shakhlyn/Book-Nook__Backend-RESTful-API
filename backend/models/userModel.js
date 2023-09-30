import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

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

  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  //   purchaseHistory: []

  //   wishlist: []
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  //passwordConfirm is only needed during the validation of password confirmation. No need after that.
  this.passwordConfirm = undefined;
  // this.passwordChangedAt = Date.now();

  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAT = Date.now() - 1000;

  next();
});

userSchema.methods.isCorrectPassword = async function (
  plainPassword,
  hashedPassword
) {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.methods.passwordChangedAfterTokenCreation = function (
  tokenCreationTime
) {
  console.log(this.passwordChangedAT);
  if (this.passwordChangedAT) {
    const passwordChangedTime = parseInt(
      this.passwordChangedAT.getTime() / 1000,
      10
    );

    return tokenCreationTime < passwordChangedTime;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

export default User;
