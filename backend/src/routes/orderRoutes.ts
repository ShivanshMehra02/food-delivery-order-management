import { Router } from 'express';
import { orderController } from '../controllers';
import { validate } from '../middleware';
import { createOrderSchema, orderStatusSchema } from '../validations';

const router = Router();

// POST /api/orders - Create a new order
router.post(
  '/',
  validate(createOrderSchema),
  (req, res) => orderController.createOrder(req, res)
);

// GET /api/orders/:id - Get order by ID
router.get('/:id', (req, res) => orderController.getOrder(req, res));

// PATCH /api/orders/:id/status - Update order status
router.patch(
  '/:id/status',
  validate(orderStatusSchema),
  (req, res) => orderController.updateOrderStatus(req, res)
);

export default router;
