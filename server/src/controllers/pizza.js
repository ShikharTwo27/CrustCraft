const pizzaService = require('../services/pizza');

const getOptions = async (req, res, next) => {
  try {
    const options = await pizzaService.getAllPizzaOptions();
    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

const createOption = async (req, res, next) => {
  try {
    const option = await pizzaService.createPizzaOption(req.body);
    res.status(201).json({
      success: true,
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

const updateOption = async (req, res, next) => {
  try {
    const option = await pizzaService.updatePizzaOption(req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: option,
    });
  } catch (error) {
    next(error);
  }
};

const deleteOption = async (req, res, next) => {
  try {
    await pizzaService.deletePizzaOption(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Pizza option deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOptions,
  createOption,
  updateOption,
  deleteOption,
};
