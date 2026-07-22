process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/crustcraft_test_order';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_longer_key_for_security';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_longer_key_for_security';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { User } = require('../src/models/User');
const { InventoryItem } = require('../src/models/InventoryItem');
const { PizzaOption } = require('../src/models/PizzaOption');
const { Order } = require('../src/models/Order');

// Increase default timeout for slower local environments
jest.setTimeout(20000);

let token;
let crustOptionId;
let sauceOptionId;
let cheeseOptionId;
let veggieOptionId;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error closing mongoose:', error);
  }
});

beforeEach(async () => {
  await User.deleteMany({});
  await InventoryItem.deleteMany({});
  await PizzaOption.deleteMany({});
  await Order.deleteMany({});

  // 1. Create and verify a test user
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Gourmet', email: 'gourmet@crustcraft.com', password: 'Password123' });
  
  const verifiedUser = await User.findOne({ email: 'gourmet@crustcraft.com' });
  verifiedUser.isVerified = true;
  await verifiedUser.save();

  const authRes = await request(app)
    .post('/api/auth/login')
    .send({ email: 'gourmet@crustcraft.com', password: 'Password123' });

  token = authRes.body.data.accessToken;

  // 2. Setup mock inventory items
  const crustInv = await InventoryItem.create({ name: 'Thin Crust', type: 'base', quantity: 5, threshold: 2 });
  const sauceInv = await InventoryItem.create({ name: 'Marinara', type: 'sauce', quantity: 10, threshold: 2 });
  const cheeseInv = await InventoryItem.create({ name: 'Mozzarella', type: 'cheese', quantity: 10, threshold: 2 });
  const veggieInv = await InventoryItem.create({ name: 'Mushrooms', type: 'veggies', quantity: 2, threshold: 1 });

  // 3. Setup mock pizza options
  const crustOpt = await PizzaOption.create({ name: 'Thin Crust', type: 'base', price: 2.0, inventoryItem: crustInv._id });
  const sauceOpt = await PizzaOption.create({ name: 'Marinara', type: 'sauce', price: 0.5, inventoryItem: sauceInv._id });
  const cheeseOpt = await PizzaOption.create({ name: 'Mozzarella', type: 'cheese', price: 1.5, inventoryItem: cheeseInv._id });
  const veggieOpt = await PizzaOption.create({ name: 'Mushrooms', type: 'veggies', price: 0.8, inventoryItem: veggieInv._id });

  crustOptionId = crustOpt._id.toString();
  sauceOptionId = sauceOpt._id.toString();
  cheeseOptionId = cheeseOpt._id.toString();
  veggieOptionId = veggieOpt._id.toString();
});

describe('Checkout and Stock Validation Integration Tests', () => {
  it('should successfully place a pending order if stock is available', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            base: crustOptionId,
            sauce: sauceOptionId,
            cheese: cheeseOptionId,
            veggies: [veggieOptionId],
            size: 'medium',
            quantity: 2,
          },
        ],
        deliveryAddress: '123 Baker Street, London',
        contactNumber: '9876543210',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('pending');
    expect(res.body.data.totalAmount).toBe(14.60);

    const order = await Order.findById(res.body.data._id);
    expect(order).toBeTruthy();
  });

  it('should block order placement if requested quantity exceeds stock level', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            base: crustOptionId,
            sauce: sauceOptionId,
            cheese: cheeseOptionId,
            veggies: [veggieOptionId],
            size: 'small',
            quantity: 3,
          },
        ],
        deliveryAddress: '123 Baker Street, London',
        contactNumber: '9876543210',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Insufficient stock');
    expect(res.body.error).toContain('Mushrooms');
  });

  it('should verify payment successfully and atomically deduct stock levels', async () => {
    // 1. Pre-book order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            base: crustOptionId,
            sauce: sauceOptionId,
            cheese: cheeseOptionId,
            veggies: [veggieOptionId],
            size: 'small',
            quantity: 1,
          },
        ],
        deliveryAddress: '123 Baker Street, London',
        contactNumber: '9876543210',
      });
    const orderId = orderRes.body.data._id;

    // Verify initial stock of veggie is 2
    const vegBefore = await InventoryItem.findOne({ name: 'Mushrooms' });
    expect(vegBefore.quantity).toBe(2);

    // 2. Trigger mock signature verification
    const payRes = await request(app)
      .post('/api/orders/verify-payment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        razorpayOrderId: 'mock_rzp_order_123',
        razorpayPaymentId: 'pay_mock_123',
        razorpaySignature: 'mock_signature',
      });

    if (payRes.statusCode !== 200) {
      console.log('🔴 TEST VERIFY-PAYMENT FAILED WITH BODY:', payRes.body);
    }

    expect(payRes.statusCode).toBe(200);
    expect(payRes.body.success).toBe(true);
    expect(payRes.body.data.paymentStatus).toBe('paid');
    expect(payRes.body.data.status).toBe('in the kitchen');

    // Verify stock is now decremented by 1
    const vegAfter = await InventoryItem.findOne({ name: 'Mushrooms' });
    expect(vegAfter.quantity).toBe(1);
  });

  it('should fail payment verification if stock becomes insufficient before verification', async () => {
    // 1. Pre-book order
    const orderRes = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [
          {
            base: crustOptionId,
            sauce: sauceOptionId,
            cheese: cheeseOptionId,
            veggies: [veggieOptionId],
            size: 'small',
            quantity: 2, // Requesting 2 mushrooms
          },
        ],
        deliveryAddress: '123 Baker Street, London',
        contactNumber: '9876543210',
      });
    const orderId = orderRes.body.data._id;

    // 2. Simulate concurrent process clearing stock (set Mushrooms stock to 1)
    await InventoryItem.updateOne({ name: 'Mushrooms' }, { quantity: 1 });

    // 3. Payment verification should fail because stock is now 1 but order requires 2
    const payRes = await request(app)
      .post('/api/orders/verify-payment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderId,
        razorpayOrderId: 'mock_rzp_order_123',
        razorpayPaymentId: 'pay_mock_123',
        razorpaySignature: 'mock_signature',
      });

    expect(payRes.statusCode).toBe(400);
    expect(payRes.body.success).toBe(false);
    expect(payRes.body.error).toContain('Insufficient stock');
  });
});
