const { verifyAccessToken } = require('../utils/jwt');
const { User } = require('../models/User');
const { AppError } = require('../utils/errors');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    next(new AppError('Access denied. No token provided.', 401));
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      next(new AppError('The user belonging to this token no longer exists.', 401));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired access token.', 401));
  }
};

module.exports = {
  protect,
};
