const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const { AppError } = require('../utils/errors');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./email');

const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('An account with this email address already exists.', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'user',
    verificationToken,
    verificationTokenExpires,
    isVerified: false,
  });

  await sendVerificationEmail(user.email, user.name, verificationToken);

  return user;
};

const verifyEmail = async (token) => {
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired email verification token.', 400);
  }

  user.isVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email address before logging in.', 403);
  }

  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens.push(refreshToken);
  await user.save();

  user.password = undefined;

  return { accessToken, refreshToken, user };
};

const refreshAccessToken = async (token) => {
  try {
    const decoded = verifyRefreshToken(token);

    const user = await User.findOne({ _id: decoded.userId, refreshTokens: token });
    if (!user) {
      throw new AppError('Token rotation failure or user not found.', 401);
    }

    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AppError('Invalid or expired refresh token.', 401);
  }
};

const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    console.log(`⚠️ Password reset requested for non-existent email: ${email}`);
    return;
  }

  const resetPasswordToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordTokenExpires = resetPasswordTokenExpires;
  await user.save();

  await sendPasswordResetEmail(user.email, user.name, resetPasswordToken);
};

const resetPassword = async (token, password) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new AppError('Invalid or expired password reset token.', 400);
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordTokenExpires = null;
  user.refreshTokens = [];
  await user.save();
};

const logoutUser = async (token) => {
  const user = await User.findOne({ refreshTokens: token });
  if (user) {
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();
  }
};

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logoutUser,
};
