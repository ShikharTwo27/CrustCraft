const cron = require('node-cron');
const { InventoryItem } = require('../models/InventoryItem');
const { sendLowStockEmail } = require('./email');
const { env } = require('../config/env');

const checkAndAlertLowStock = async () => {
  try {
    console.log('⏰ Running automated scheduler: Checking inventory stock levels...');
    
    // Find items whose quantity is below or equal to their threshold
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$threshold'] }
    });

    if (lowStockItems.length > 0) {
      console.log(`⚠️ Found ${lowStockItems.length} low-stock ingredients. Dispatching warning email.`);
      await sendLowStockEmail(env.EMAIL_USER, lowStockItems);
    } else {
      console.log('✅ All inventory stock items are above alert thresholds.');
    }
  } catch (error) {
    console.error('❌ Scheduler stock check failed:', error);
  }
};

const initScheduler = () => {
  // Daily at midnight in production, hourly in other environments
  const scheduleExpr = env.NODE_ENV === 'production' ? '0 0 * * *' : '0 * * * *';
  
  cron.schedule(scheduleExpr, checkAndAlertLowStock);
  console.log(`📅 Scheduler initialized on cron pattern: '${scheduleExpr}'`);

  // Run a check once immediately on startup for testing convenience
  checkAndAlertLowStock();
};

module.exports = {
  initScheduler,
  checkAndAlertLowStock
};
