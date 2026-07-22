const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { env } = require('../config/env');
const { Order } = require('../models/Order');
const { PizzaOption } = require('../models/PizzaOption');
const { InventoryItem } = require('../models/InventoryItem');
const { AppError } = require('../utils/errors');

let razorpay;
const isMockKey = !env.RAZORPAY_KEY_ID || 
                  env.RAZORPAY_KEY_ID === 'placeholder_key_id' || 
                  env.RAZORPAY_KEY_ID.includes('placeholder');

if (!isMockKey) {
  try {
    razorpay = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('⚠️ Razorpay client initialization error:', err.message);
  }
}

const createOrder = async (userId, data) => {
  const { items, deliveryAddress, contactNumber } = data;

  // 1. Gather all option IDs to fetch details in a single query
  const optionIds = new Set();
  items.forEach((item) => {
    optionIds.add(item.base);
    optionIds.add(item.sauce);
    optionIds.add(item.cheese);
    item.veggies.forEach((v) => optionIds.add(v));
  });

  const options = await PizzaOption.find({ _id: { $in: Array.from(optionIds) } }).populate(
    'inventoryItem'
  );

  const optionsMap = new Map();
  options.forEach((opt) => optionsMap.set(opt._id.toString(), opt));

  // 2. Pricing and stock aggregates
  const neededStock = {}; // Map of InventoryItem ID -> quantity needed
  const orderItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const baseOpt = optionsMap.get(item.base);
    const sauceOpt = optionsMap.get(item.sauce);
    const cheeseOpt = optionsMap.get(item.cheese);

    if (!baseOpt || !sauceOpt || !cheeseOpt) {
      throw new AppError('One or more selected pizza options are invalid.', 400);
    }

    if (!baseOpt.isAvailable || !sauceOpt.isAvailable || !cheeseOpt.isAvailable) {
      throw new AppError('One or more selected options are currently unavailable.', 400);
    }

    const veggieOpts = [];
    for (const vId of item.veggies) {
      const vOpt = optionsMap.get(vId);
      if (!vOpt) {
        throw new AppError('Invalid veggie option selected.', 400);
      }
      if (!vOpt.isAvailable) {
        throw new AppError(`Topping '${vOpt.name}' is currently unavailable.`, 400);
      }
      veggieOpts.push(vOpt);
    }

    // Calculate individual custom pizza cost (crust + sauce + cheese + toppings surcharges)
    let pizzaPrice = baseOpt.price + sauceOpt.price + cheeseOpt.price;
    veggieOpts.forEach((v) => {
      pizzaPrice += v.price;
    });

    // Size pricing surcharges
    if (item.size === 'medium') {
      pizzaPrice += 2.5;
    } else if (item.size === 'large') {
      pizzaPrice += 5.0;
    }

    const itemPrice = parseFloat((pizzaPrice * item.quantity).toFixed(2));
    totalAmount += itemPrice;

    orderItems.push({
      base: baseOpt._id,
      sauce: sauceOpt._id,
      cheese: cheeseOpt._id,
      veggies: veggieOpts.map((v) => v._id),
      size: item.size,
      quantity: item.quantity,
      price: pizzaPrice,
    });

    // Aggregate required stock for the associated raw InventoryItems
    const optionsToTrack = [baseOpt, sauceOpt, cheeseOpt, ...veggieOpts];
    optionsToTrack.forEach((opt) => {
      const invId = opt.inventoryItem._id.toString();
      neededStock[invId] = (neededStock[invId] || 0) + item.quantity;
    });
  }

  // 3. Validate live stock quantities
  const neededInvIds = Object.keys(neededStock);
  const inventoryItems = await InventoryItem.find({ _id: { $in: neededInvIds } });
  const inventoryMap = new Map();
  inventoryItems.forEach((inv) => inventoryMap.set(inv._id.toString(), inv));

  for (const invId of neededInvIds) {
    const invItem = inventoryMap.get(invId);
    const requiredQty = neededStock[invId];

    if (!invItem) {
      throw new AppError('Inventory item associated with selection does not exist.', 400);
    }

    if (invItem.quantity < requiredQty) {
      throw new AppError(
        `Insufficient stock for ingredient '${invItem.name}'. Required: ${requiredQty}, Available: ${invItem.quantity}`,
        400
      );
    }
  }

  // 4. Record the pending order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    deliveryAddress,
    contactNumber,
    status: 'received',
    paymentStatus: 'pending',
  });

  return order;
};

const getCustomerOrders = async (userId) => {
  return Order.find({ user: userId })
    .populate('items.base')
    .populate('items.sauce')
    .populate('items.cheese')
    .populate('items.veggies')
    .sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId, userRole) => {
  const order = await Order.findById(orderId)
    .populate('items.base')
    .populate('items.sauce')
    .populate('items.cheese')
    .populate('items.veggies');

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // Security guard: ensure user owns the order, unless they are admin
  if (order.user.toString() !== userId.toString() && userRole !== 'admin') {
    throw new AppError('Unauthorized access to this order.', 403);
  }

  return order;
};

const initiatePayment = async (orderId, userId, userRole) => {
  const order = await getOrderById(orderId, userId, userRole);

  if (order.paymentStatus === 'paid') {
    throw new AppError('This order has already been paid.', 400);
  }

  const amountInPaise = Math.round(order.totalAmount * 100);

  // If Razorpay credentials are not configured, fallback to mock payment token
  if (!razorpay) {
    return {
      id: `mock_rzp_order_${orderId}`,
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId.toString(),
      isMock: true,
    };
  }

  try {
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderId.toString(),
    });
    return rzpOrder;
  } catch (error) {
    throw new AppError(`Razorpay Order Creation Failed: ${error.message}`, 500);
  }
};

const verifyPaymentSignature = async (userId, userRole, paymentData) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = paymentData;

  const order = await getOrderById(orderId, userId, userRole);

  if (order.paymentStatus === 'paid') {
    return order;
  }

  // Signature verification logic
  const isMockOrder = razorpayOrderId?.startsWith('mock_rzp_order_') || !razorpay;
  if (!isMockOrder) {
    const shasum = crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest('hex');
    if (digest !== razorpaySignature) {
      throw new AppError('Payment signature verification failed.', 400);
    }
  }

  // Atomic stock checker aggregation
  const neededStock = {};
  for (const item of order.items) {
    const optionsToTrack = [item.base, item.sauce, item.cheese, ...item.veggies];
    optionsToTrack.forEach((opt) => {
      const invId = opt.inventoryItem.toString();
      neededStock[invId] = (neededStock[invId] || 0) + item.quantity;
    });
  }

  const deductStockDirectly = async (mongooseSession = null) => {
    const invIds = Object.keys(neededStock);
    const query = mongooseSession 
      ? InventoryItem.find({ _id: { $in: invIds } }).session(mongooseSession) 
      : InventoryItem.find({ _id: { $in: invIds } });
    
    const inventoryItems = await query;
    const inventoryMap = new Map();
    inventoryItems.forEach((inv) => inventoryMap.set(inv._id.toString(), inv));

    for (const invId of invIds) {
      const invItem = inventoryMap.get(invId);
      const requiredQty = neededStock[invId];

      if (!invItem || invItem.quantity < requiredQty) {
        throw new AppError(
          `Insufficient stock for ingredient '${invItem?.name || 'Unknown'}'. Required: ${requiredQty}, Available: ${invItem?.quantity || 0}`,
          400
        );
      }

      invItem.quantity -= requiredQty;
      if (mongooseSession) {
        await invItem.save({ session: mongooseSession });
      } else {
        await invItem.save();
      }
    }
  };

  // Execute transaction checks with fallback to standalone mongod configuration
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await deductStockDirectly(session);

    order.paymentStatus = 'paid';
    order.status = 'in the kitchen';
    await order.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();

    if (error.message?.includes('Replica Set') || error.code === 20) {
      // Standalone fallback
      await deductStockDirectly(null);
      order.paymentStatus = 'paid';
      order.status = 'in the kitchen';
      await order.save();
    } else {
      throw error;
    }
  } finally {
    session.endSession();
  }

  // Emit Socket.io status update
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    io.to(orderId.toString()).emit('orderStatusUpdated', {
      orderId: orderId.toString(),
      status: 'in the kitchen',
      paymentStatus: 'paid',
    });
  } catch (error) {
    console.warn('⚠️ Failed to emit Socket.io status update:', error.message);
  }

  // Pre-generate road route coordinates in background
  try {
    const { generateDeliveryRoute } = require('./deliverySimulation');
    generateDeliveryRoute(order._id).catch((err) => console.error('Route generation failed:', err));
  } catch (error) {
    console.warn('Failed to load route simulator:', error.message);
  }

  return order;
};

const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ['received', 'in the kitchen', 'out for delivery', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw new AppError('Invalid order status stage.', 400);
  }

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status },
    { new: true, runValidators: true }
  ).populate('items.base')
    .populate('items.sauce')
    .populate('items.cheese')
    .populate('items.veggies');

  if (!order) {
    throw new AppError('Order not found.', 404);
  }

  // Emit Socket.io status update
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    io.to(orderId.toString()).emit('orderStatusUpdated', {
      orderId: orderId.toString(),
      status,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    console.warn('⚠️ Failed to emit Socket.io status update:', error.message);
  }

  // Trigger position interval simulation if order goes out for delivery
  if (status === 'out for delivery') {
    try {
      const { startSimulation } = require('./deliverySimulation');
      startSimulation(orderId);
    } catch (error) {
      console.warn('Failed to start driver simulation:', error.message);
    }
  }

  return order;
};

const getAllOrders = async () => {
  return Order.find({})
    .populate('user', 'name email')
    .populate('items.base')
    .populate('items.sauce')
    .populate('items.cheese')
    .populate('items.veggies')
    .sort({ createdAt: -1 });
};

module.exports = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  initiatePayment,
  verifyPaymentSignature,
  updateOrderStatus,
  getAllOrders,
};
