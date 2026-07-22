const inventoryService = require('../services/inventory');

const getItems = async (req, res, next) => {
  try {
    const items = await inventoryService.getAllInventoryItems();
    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

const createItem = async (req, res, next) => {
  try {
    const item = await inventoryService.createInventoryItem(req.body);
    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const updateItem = async (req, res, next) => {
  try {
    const item = await inventoryService.updateInventoryItem(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const deleteItem = async (req, res, next) => {
  try {
    await inventoryService.deleteInventoryItem(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Inventory item deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
};
