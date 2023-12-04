import Order from "../models/orderModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const placeOrder = catchAsync(async (req, res, next) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  const user = req.user._id;

  if (orderItems && orderItems.length === 0) {
    return next(new AppError("There is no order items!", 400));
  }
  const order = new Order({
    user,
    orderItems: orderItems.map((item) => ({ ...item, product: item._id })),
    shippingAddress,
    paymentMethod,
  });

  order.itemsPrice = order.itemsPrice;
  order.tax = order.tax;
  order.shippingPrice = order.shippingPrice;
  order.totalPrice = order.totalPrice;

  const newOrder = await order.save();

  res.status(201).json({
    status: "success",
    data: newOrder,
  });
});

const getAllOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({}).populate({
    // since 'user' is referenced in the order schema, we have to populate path and fields to show the desired fields
    path: "user",
    select: "username, email",
  });

  res.status(200).json({
    status: "success",
    result: orders.length,
    data: orders,
  });
});

const getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: "user",
    select: "username email",
  });
  res.status(200).json({
    data: order,
  });
});

const getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate({
    path: "user",
    select: "username email",
  });

  if (!orders) {
    return next(new AppError("Document not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: orders,
  });
});

export { placeOrder, getOrderById, getAllOrders, getMyOrders };
