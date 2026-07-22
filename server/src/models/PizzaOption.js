const { Schema, model } = require('mongoose');

const pizzaOptionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ['base', 'sauce', 'cheese', 'veggies'],
      required: true,
    },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    inventoryItem: { type: Schema.Types.ObjectId, ref: 'InventoryItem', required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const PizzaOption = model('PizzaOption', pizzaOptionSchema);

module.exports = {
  PizzaOption,
};
