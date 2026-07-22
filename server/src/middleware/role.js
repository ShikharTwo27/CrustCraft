const { AppError } = require('../utils/errors');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
      return;
    }

    next();
  };
};

module.exports = {
  authorize,
};
