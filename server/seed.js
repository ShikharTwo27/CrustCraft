const mongoose = require('mongoose');
const { env } = require('./src/config/env');
const { InventoryItem } = require('./src/models/InventoryItem');
const { PizzaOption } = require('./src/models/PizzaOption');

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    await mongoose.connect(env.MONGO_URI);

    // Clear existing data
    await InventoryItem.deleteMany({});
    await PizzaOption.deleteMany({});
    console.log('🗑️ Cleaned old catalog and inventory.');

    // 1. Define raw inventory stock items
    const inventoryData = [
      { name: 'Thin Crust', type: 'base', quantity: 100, threshold: 10, unit: 'units' },
      { name: 'Thick Crust', type: 'base', quantity: 100, threshold: 10, unit: 'units' },
      { name: 'Gluten-Free Crust', type: 'base', quantity: 50, threshold: 10, unit: 'units' },

      { name: 'Classic Marinara', type: 'sauce', quantity: 150, threshold: 15, unit: 'portions' },
      { name: 'Creamy Alfredo', type: 'sauce', quantity: 100, threshold: 15, unit: 'portions' },
      { name: 'Spicy Barbecue', type: 'sauce', quantity: 80, threshold: 10, unit: 'portions' },

      { name: 'Mozzarella', type: 'cheese', quantity: 200, threshold: 20, unit: 'grams' },
      { name: 'Cheddar', type: 'cheese', quantity: 120, threshold: 15, unit: 'grams' },
      { name: 'Vegan Cheese', type: 'cheese', quantity: 60, threshold: 10, unit: 'grams' },

      { name: 'Fresh Mushrooms', type: 'veggies', quantity: 90, threshold: 15, unit: 'portions' },
      { name: 'Black Olives', type: 'veggies', quantity: 110, threshold: 15, unit: 'portions' },
      { name: 'Red Onions', type: 'veggies', quantity: 130, threshold: 15, unit: 'portions' },
      { name: 'Bell Peppers', type: 'veggies', quantity: 100, threshold: 15, unit: 'portions' },
      { name: 'Pickled Jalapenos', type: 'veggies', quantity: 80, threshold: 10, unit: 'portions' }
    ];

    const createdInventory = await InventoryItem.insertMany(inventoryData);
    console.log(`📦 Inserted ${createdInventory.length} inventory tracking items.`);

    // 2. Map inventory items to Pizza Builder options
    const optionData = [
      { name: 'Thin Crust', type: 'base', description: 'Light and crispy traditional crust', price: 160.00 },
      { name: 'Thick Crust', type: 'base', description: 'Fluffy and doughy deep dish crust', price: 200.00 },
      { name: 'Gluten-Free Crust', type: 'base', description: 'Gluten-free crispy alternative crust', price: 320.00 },

      { name: 'Classic Marinara', type: 'sauce', description: 'Rich tomato sauce with herbs', price: 40.00 },
      { name: 'Creamy Alfredo', type: 'sauce', description: 'Buttery garlic parmesan sauce', price: 80.00 },
      { name: 'Spicy Barbecue', type: 'sauce', description: 'Sweet and smoky BBQ base', price: 96.00 },

      { name: 'Mozzarella', type: 'cheese', description: 'Mild, melt-in-your-mouth mozzarella', price: 120.00 },
      { name: 'Cheddar', type: 'cheese', description: 'Sharp and tangy cheddar cheese', price: 144.00 },
      { name: 'Vegan Cheese', type: 'cheese', description: 'Daiya dairy-free alternative', price: 200.00 },

      { name: 'Fresh Mushrooms', type: 'veggies', description: 'Slices of earthy white button mushrooms', price: 64.00 },
      { name: 'Black Olives', type: 'veggies', description: 'Sliced cured kalamata olives', price: 48.00 },
      { name: 'Red Onions', type: 'veggies', description: 'Finely sliced sweet red onions', price: 40.00 },
      { name: 'Bell Peppers', type: 'veggies', description: 'Fresh green bell peppers crunchy slices', price: 56.00 },
      { name: 'Pickled Jalapenos', type: 'veggies', description: 'Hot pickled pepper rings', price: 72.00 }
    ];

    // Connect each option to its inventory item object id
    const mappedOptions = optionData.map(option => {
      const invItem = createdInventory.find(item => item.name === option.name);
      return {
        ...option,
        inventoryItem: invItem._id,
        isAvailable: true
      };
    });

    const createdOptions = await PizzaOption.insertMany(mappedOptions);
    console.log(`🍕 Inserted ${createdOptions.length} pizza customizer builder menu options.`);

    console.log('✅ Database seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
