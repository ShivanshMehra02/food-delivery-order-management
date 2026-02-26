import { Request, Response } from 'express';
import { orderService } from '../services';
import { CreateOrderInput, OrderStatusInput } from '../validations';
import { getSocketIO } from '../socket';

export class OrderController {
  /**
   * POST /api/orders - Create a new order
   */
  createOrder(req: Request, res: Response): void {
    const orderData: CreateOrderInput = req.body;
    
    const result = orderService.createOrder(orderData);
    
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: result.error
      });
      return;
    }

    // Start status simulation
    const io = getSocketIO();
    if (io && result.orderId) {
      orderService.startStatusSimulation(result.orderId, (orderId, status) => {
        io.to(orderId).emit('order-status-updated', {
          orderId,
          status,
          timestamp: new Date().toISOString()
        });
      });
    }

    res.status(201).json({
      success: true,
      orderId: result.orderId
    });
  }

  /**
   * GET /api/orders/:id - Get order by ID
   */
  getOrder(req: Request, res: Response): void {
    const { id } = req.params;
    const order = orderService.getOrderById(id);
    
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      });
      return;
    }

    res.json({
      success: true,
      data: orderService.formatOrderResponse(order)
    });
  }

  /**
   * PATCH /api/orders/:id/status - Update order status
   */
  updateOrderStatus(req: Request, res: Response): void {
    const { id } = req.params;
    const { status }: OrderStatusInput = req.body;
    
    const result = orderService.updateOrderStatus(id, status);
    
    if (!result.success) {
      const statusCode = result.error === 'Order not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: result.error
      });
      return;
    }

    // Emit socket event
    const io = getSocketIO();
    if (io && result.order) {
      io.to(id).emit('order-status-updated', {
        orderId: id,
        status: result.order.status,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: orderService.formatOrderResponse(result.order!)
    });
  }
}

export const orderController = new OrderController();
