import { z } from 'zod';

// Phone number validation regex (supports various formats)
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

// Order item validation schema
export const orderItemSchema = z.object({
  menuId: z.string().min(1, 'Menu ID is required'),
  quantity: z.number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
});

// Create order validation schema
export const createOrderSchema = z.object({
  customerName: z.string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be less than 100 characters'),
  address: z.string()
    .min(1, 'Address is required')
    .max(500, 'Address must be less than 500 characters'),
  phone: z.string()
    .regex(phoneRegex, 'Invalid phone number format'),
  items: z.array(orderItemSchema)
    .min(1, 'Cart cannot be empty')
});

// Order status validation schema
export const orderStatusSchema = z.object({
  status: z.enum(['Order Received', 'Preparing', 'Out for Delivery'])
});

// Type exports from schemas
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderStatusInput = z.infer<typeof orderStatusSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
