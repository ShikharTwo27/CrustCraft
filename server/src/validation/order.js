const { z } = require('zod');

const customPizzaItemSchema = z.object({
  base: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid base ID').optional().nullable(),
  sauce: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid sauce ID').optional().nullable(),
  cheese: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cheese ID').optional().nullable(),
  veggies: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid veggie ID')).default([]).optional(),
  size: z.enum(['small', 'medium', 'large']).optional().nullable(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  isSide: z.boolean().default(false).optional(),
  sideId: z.string().optional().nullable(),
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
