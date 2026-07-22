const { Router } = require('express');
const authRoutes = require('./auth');
const pizzaRoutes = require('./pizza');
const inventoryRoutes = require('./inventory');
const orderRoutes = require('./order');

const router = Router();

router.use('/auth', authRoutes);
router.use('/pizza', pizzaRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);

module.exports = router;
