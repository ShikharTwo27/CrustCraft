const { z } = require('zod');

const customPizzaItemSchema = z.object({
  base: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid base ID'),
  sauce: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid sauce ID'),
  cheese: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cheese ID'),
  veggies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid veggie ID')).default([]),
  size: z.enum(['small', 'medium', 'large']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

const createOrderSchema = z.object({
  body: z.object({
    items: z.array(customPizzaItemSchema).nonempty('Order must contain at least 1 pizza'),
    deliveryAddress: z.string().min(5, 'Delivery address must be at least 5 characters'),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 characters'),
  }),
});

module.exports = {
  createOrderSchema,
};
