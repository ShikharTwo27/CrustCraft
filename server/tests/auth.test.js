process.env.NODE_ENV = 'test';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/crustcraft_test_auth';
process.env.JWT_ACCESS_SECRET = 'test_access_secret_longer_key_for_security';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_longer_key_for_security';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const { User } = require('../src/models/User');

jest.setTimeout(20000);

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
    console.error('Error dropping test database:', error);
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe('Authentication Integration Tests', () => {
  const mockUser = {
    name: 'Test Chef',
    email: 'chef@crustcraft.com',
    password: 'Password123',
  };

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('email', mockUser.email.toLowerCase());
      
      const user = await User.findOne({ email: mockUser.email.toLowerCase() });
      expect(user).toBeTruthy();
      expect(user.isVerified).toBe(false);
      expect(user.verificationToken).toBeTruthy();
    });

    it('should reject registration if email is duplicate', async () => {
      await request(app).post('/api/auth/register').send(mockUser);
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(mockUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should reject registration with invalid password criteria', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bad Pass',
          email: 'bad@test.com',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toContain('Validation failed');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify user email with valid token', async () => {
      await request(app).post('/api/auth/register').send(mockUser);
      const user = await User.findOne({ email: mockUser.email.toLowerCase() });
      
      const res = await request(app)
        .post('/api/auth/verify-email')
        .send({ token: user.verificationToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const verifiedUser = await User.findById(user._id);
      expect(verifiedUser.isVerified).toBe(true);
      expect(verifiedUser.verificationToken).toBeNull();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should block login if user is not verified', async () => {
      await request(app).post('/api/auth/register').send(mockUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.statusCode).toBe(403);
      expect(res.body.error).toContain('verify your email');
    });

    it('should successfully login and return token if verified', async () => {
      await request(app).post('/api/auth/register').send(mockUser);
      const user = await User.findOne({ email: mockUser.email.toLowerCase() });
      user.isVerified = true;
      await user.save();

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: mockUser.email,
          password: mockUser.password,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });
  });
});
