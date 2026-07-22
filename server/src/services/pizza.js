const { PizzaOption } = require('../models/PizzaOption');
const { AppError } = require('../utils/errors');

const getAllPizzaOptions = async () => {
  return PizzaOption.find({}).populate('inventoryItem');
};

const createPizzaOption = async (data) => {
  const existing = await PizzaOption.findOne({ name: data.name });
  if (existing) {
    throw new AppError('A pizza menu option with this name already exists.', 400);
  }
  return PizzaOption.create(data);
};

const updatePizzaOption = async (id, data) => {
  const option = await PizzaOption.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!option) {
    throw new AppError('Pizza option not found.', 404);
  }
  return option;
};

const deletePizzaOption = async (id) => {
  const option = await PizzaOption.findByIdAndDelete(id);
  if (!option) {
    throw new AppError('Pizza option not found.', 404);
  }
  return option;
};

module.exports = {
  getAllPizzaOptions,
  createPizzaOption,
  updatePizzaOption,
  deletePizzaOption,
};
