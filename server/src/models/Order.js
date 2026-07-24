const { Schema, model } = require('mongoose');

const customPizzaItemSchema = new Schema({
  base: { type: Schema.Types.ObjectId, ref: 'PizzaOption', required: false },
  sauce: { type: Schema.Types.ObjectId, ref: 'PizzaOption', required: false },
  cheese: { type: Schema.Types.ObjectId, ref: 'PizzaOption', required: false },
  veggies: [{ type: Schema.Types.ObjectId, ref: 'PizzaOption' }],
  size: { type: String, enum: ['small', 'medium', 'large'], required: false },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  price: { type: Number, required: true },
  isSide: { type: Boolean, default: false },
  sideName: { type: String },
});

const orderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [customPizzaItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['received', 'in the kitchen', 'out for delivery', 'delivered'],
      default: 'received',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    deliveryAddress: { type: String, required: true },
    contactNumber: { type: String, required: true },
    deliveryRoute: { type: [[Number]], default: [] },
    currentPosition: { type: [Number], default: [] },
    deliveryEta: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Order = model('Order', orderSchema);

module.exports = {
  Order,
};
