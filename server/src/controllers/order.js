const orderService = require('../services/order');

const create = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user._id, req.body);
    res.status(201).json({
      success: true,
      message: 'Order created successfully. Pending payment.',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user._id);
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const pay = async (req, res, next) => {
  try {
    const rzpOrderData = await orderService.initiatePayment(req.params.id, req.user._id, req.user.role);
    res.status(200).json({
      success: true,
      data: rzpOrderData,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const updatedOrder = await orderService.verifyPaymentSignature(req.user._id, req.user.role, req.body);
    res.status(200).json({
      success: true,
      message: 'Payment verified and stock decremented successfully.',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}' successfully.`,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create,
  getMyOrders,
  getById,
  pay,
  verifyPayment,
  updateStatus,
  getAdminOrders,
};
