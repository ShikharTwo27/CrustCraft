const { InventoryItem } = require('../models/InventoryItem');
const { AppError } = require('../utils/errors');

const getAllInventoryItems = async () => {
  return InventoryItem.find({});
};

const createInventoryItem = async (data) => {
  const existing = await InventoryItem.findOne({ name: data.name });
  if (existing) {
    throw new AppError('An inventory item with this name already exists.', 400);
  }
  return InventoryItem.create(data);
};

const updateInventoryItem = async (id, data) => {
  const item = await InventoryItem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!item) {
    throw new AppError('Inventory item not found.', 404);
  }
  return item;
};

const deleteInventoryItem = async (id) => {
  const item = await InventoryItem.findByIdAndDelete(id);
  if (!item) {
    throw new AppError('Inventory item not found.', 404);
  }
  return item;
};

module.exports = {
  getAllInventoryItems,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
};
