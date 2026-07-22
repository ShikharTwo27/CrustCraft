const { Router } = require('express');
const inventoryController = require('../controllers/inventory');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateRequest } = require('../middleware/validate');
const { inventoryItemSchema } = require('../validation/inventory');

const router = Router();

// Administrative inventory stock controls
router.get('/', protect, authorize('admin'), inventoryController.getItems);
router.post('/', protect, authorize('admin'), validateRequest(inventoryItemSchema), inventoryController.createItem);
router.put('/:id', protect, authorize('admin'), validateRequest(inventoryItemSchema), inventoryController.updateItem);
router.delete('/:id', protect, authorize('admin'), inventoryController.deleteItem);

module.exports = router;
