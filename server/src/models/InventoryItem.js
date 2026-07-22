const { Schema, model } = require('mongoose');

const inventoryItemSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'veggies'],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    threshold: { type: Number, required: true, min: 0, default: 10 },
    unit: { type: String, default: 'units' },
  },
  { timestamps: true }
);

const InventoryItem = model('InventoryItem', inventoryItemSchema);

module.exports = {
  InventoryItem,
};
