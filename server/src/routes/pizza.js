const { Router } = require('express');
const pizzaController = require('../controllers/pizza');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { validateRequest } = require('../middleware/validate');
const { pizzaOptionSchema } = require('../validation/inventory');

const router = Router();

// Public customizer options query
router.get('/options', pizzaController.getOptions);

// Administrative catalog controls
router.post('/', protect, authorize('admin'), validateRequest(pizzaOptionSchema), pizzaController.createOption);
router.put('/:id', protect, authorize('admin'), validateRequest(pizzaOptionSchema), pizzaController.updateOption);
router.delete('/:id', protect, authorize('admin'), pizzaController.deleteOption);

module.exports = router;
