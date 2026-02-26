import { v4 as uuidv4 } from 'uuid';
import { 
  Order, 
  OrderItem, 
  OrderStatus, 
  CreateOrderRequest,
  OrderResponse 
} from '../models/types';
import { 
  getOrder, 
  createOrder as storeOrder, 
  updateOrderStatus as storeUpdateStatus,
  getMenuItem
} from '../models/store';
import { menuService } from './menuService';

// Valid status transitions
const statusTransitions: Record<OrderStatus, OrderStatus | null> = {
  'Order Received': 'Preparing',
  'Preparing': 'Out for Delivery',
  'Out for Delivery': null
};

export class OrderService {
  private statusUpdateCallbacks: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Create a new order
   */
  createOrder(request: CreateOrderRequest): { success: boolean; orderId?: string; error?: string } {
    // Validate menu IDs
    const menuIds = request.items.map(item => item.menuId);
    const validation = menuService.validateMenuIds(menuIds);
    
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid menu item IDs: ${validation.invalidIds.join(', ')}`
      };
    }

    // Build order items with prices and names
    const orderItems: OrderItem[] = request.items.map(item => {
      const menuItem = getMenuItem(item.menuId)!;
      return {
        menuId: item.menuId,
        name: menuItem.name,
        quantity: item.quantity,
        price: menuItem.price
      };
    });

    // Calculate total price
    const totalPrice = orderItems.reduce(
      (total, item) => total + (item.price * item.quantity), 
      0
    );

    // Create order
    const order: Order = {
      id: uuidv4(),
      customerName: request.customerName,
      address: request.address,
      phone: request.phone,
      items: orderItems,
      totalPrice: Math.round(totalPrice * 100) / 100,
      status: 'Order Received',
      createdAt: new Date()
    };

    storeOrder(order);

    return {
      success: true,
      orderId: order.id
    };
  }

  /**
   * Get order by ID
   */
  getOrderById(id: string): Order | undefined {
    return getOrder(id);
  }

  /**
   * Format order for API response
   */
  formatOrderResponse(order: Order): OrderResponse {
    return {
      id: order.id,
      customerName: order.customerName,
      address: order.address,
      phone: order.phone,
      items: order.items,
      totalPrice: order.totalPrice,
      status: order.status,
      createdAt: order.createdAt.toISOString()
    };
  }

  /**
   * Update order status with transition validation
   */
  updateOrderStatus(
    id: string, 
    newStatus: OrderStatus
  ): { success: boolean; order?: Order; error?: string } {
    const order = getOrder(id);
    
    if (!order) {
      return {
        success: false,
        error: 'Order not found'
      };
    }

    // Check if transition is valid
    const validNextStatus = statusTransitions[order.status];
    
    if (validNextStatus === null) {
      return {
        success: false,
        error: `Cannot update status from '${order.status}' - order is in final state`
      };
    }

    if (newStatus !== validNextStatus) {
      return {
        success: false,
        error: `Invalid status transition from '${order.status}' to '${newStatus}'. Valid next status is '${validNextStatus}'`
      };
    }

    // Prevent duplicate status updates
    if (order.status === newStatus) {
      return {
        success: false,
        error: `Order is already in '${newStatus}' status`
      };
    }

    const updatedOrder = storeUpdateStatus(id, newStatus);
    
    return {
      success: true,
      order: updatedOrder
    };
  }

  /**
   * Start automatic status progression for an order
   */
  startStatusSimulation(
    orderId: string, 
    onStatusUpdate: (orderId: string, status: OrderStatus) => void
  ): void {
    // Clear any existing simulation for this order
    this.stopStatusSimulation(orderId);

    const progressStatus = () => {
      const order = getOrder(orderId);
      if (!order) return;

      const nextStatus = statusTransitions[order.status];
      if (nextStatus) {
        storeUpdateStatus(orderId, nextStatus);
        onStatusUpdate(orderId, nextStatus);

        // Continue simulation if not final status
        if (statusTransitions[nextStatus] !== null) {
          const timeout = setTimeout(progressStatus, 10000);
          this.statusUpdateCallbacks.set(orderId, timeout);
        } else {
          this.statusUpdateCallbacks.delete(orderId);
        }
      }
    };

    // Start first transition after 10 seconds
    const timeout = setTimeout(progressStatus, 10000);
    this.statusUpdateCallbacks.set(orderId, timeout);
  }

  /**
   * Stop automatic status progression for an order
   */
  stopStatusSimulation(orderId: string): void {
    const timeout = this.statusUpdateCallbacks.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      this.statusUpdateCallbacks.delete(orderId);
    }
  }

  /**
   * Stop all status simulations
   */
  stopAllSimulations(): void {
    this.statusUpdateCallbacks.forEach((timeout) => clearTimeout(timeout));
    this.statusUpdateCallbacks.clear();
  }
}

export const orderService = new OrderService();
