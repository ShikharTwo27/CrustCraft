const { Router } = require('express');
const authController = require('../controllers/auth');
const { validateRequest } = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('../validation/auth');

const router = Router();

router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verify);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/refresh-token', authController.refresh);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgot);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.reset);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;
