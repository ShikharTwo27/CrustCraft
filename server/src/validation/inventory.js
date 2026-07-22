const { z } = require('zod');

const inventoryItemSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(100),
    type: z.enum(['base', 'sauce', 'cheese', 'veggies']),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
    threshold: z.coerce.number().min(0, 'Warning threshold cannot be negative'),
    unit: z.string().default('units'),
  }),
});

const pizzaOptionSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name is required').max(100),
    type: z.enum(['base', 'sauce', 'cheese', 'veggies']),
    description: z.string().optional().default(''),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    inventoryItem: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid inventory item ID'),
    isAvailable: z.boolean().default(true),
  }),
});

module.exports = {
  inventoryItemSchema,
  pizzaOptionSchema,
};
