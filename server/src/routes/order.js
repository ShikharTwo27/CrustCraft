const { Router } = require('express');
const orderController = require('../controllers/order');
const { protect } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const { createOrderSchema } = require('../validation/order');

const { authorize } = require('../middleware/role');

const router = Router();

// Protect all order routes to authenticated users
router.use(protect);

router.post('/', validateRequest(createOrderSchema), orderController.create);
router.get('/', orderController.getMyOrders);

// Payment flows
router.post('/:id/pay', orderController.pay);
router.post('/verify-payment', orderController.verifyPayment);

// Admin-only controls
router.get('/admin/all', authorize('admin'), orderController.getAdminOrders);
router.put('/:id/status', authorize('admin'), orderController.updateStatus);

router.get('/:id', orderController.getById);

module.exports = router;
