import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    orderItems: [
      {
        name: {
          type: String,
          required: [true, "An order item must have a name"],
        },
        qty: {
          type: Number,
          default: 1,
          min: 1,
          required: [true, "An order must have minimum one book"],
        },
        image: { type: String, required: [true, "An order must have image"] },
        price: {
          type: Number,
          min: 0,
          required: [true, "An order must have a price"],
        },
        book: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Book",
        },
      },
    ],

    shippingAddress: {
      address: {
        type: String,
        required: [true, "An order must have an address"],
      },
      city: {
        type: String,
        required: [true, "An order must have a city"],
      },
      postalCode: {
        type: String,
        required: [true, "An order must have a postalCode"],
      },
      country: {
        type: String,
        required: [true, "An order must have a country"],
      },
    },

    PaymentMethod: {
      type: String,
      required: [true, "An order must have a payment method"],
    },
    //   paymentResult: {
    //     id: { type: String },
    //     status: { type: String },
    //     update_time: { type: String },
    //     email_address: { type: String },
    //   },

    // itemsPrice: {
    //   type: Number,
    //   required: [true, "An order must have itemsPrice for all the books"],
    // },
    // tax: {
    //   type: Number,
    //   default: 0.0,
    //   required: [true, "Tax must be added to the itemsPrice"],
    // },
    // shippingPrice: {
    //   type: Number,
    //   default: 0.0,
    //   required: [true, "shippingPrice must be added to the itemsPrice"],
    // },

    // totalPrice: {
    //   type: Number,
    //   default: 0.0,
    //   required: [true, "An order must have totalPrice"],
    // },
    isPaid: {
      type: Boolean,
      default: false,
      required: true,
    },
    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      default: false,
      required: true,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual Getter() function
orderSchema.virtual("itemsPrice").get(function () {
  const itemsPrice = this.orderItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );
  return itemsPrice;
});
orderSchema.virtual("tax").get(function () {
  // tax is 10% on books
  return this.itemsPrice * 0.1;
});

orderSchema.virtual("shippingPrice").get(function () {
  const shippingPrice = this.itemsPrice >= 100 ? 0 : 10;
  return shippingPrice;
});

orderSchema.virtual("totalPrice").get(function () {
  const totalPrice = this.itemsPrice + this.tax + this.shippingPrice;
  return totalPrice;
});

const Order = mongoose.model("order", orderSchema);

export default Order;
