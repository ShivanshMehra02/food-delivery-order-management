// Menu Item Type
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

// Order Item Type
export interface OrderItem {
  menuId: string;
  name: string;
  quantity: number;
  price: number;
}

// Order Status Enum
export type OrderStatus = 'Order Received' | 'Preparing' | 'Out for Delivery';

// Order Type
export interface Order {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: Date;
}

// Create Order Request
export interface CreateOrderRequest {
  customerName: string;
  address: string;
  phone: string;
  items: {
    menuId: string;
    quantity: number;
  }[];
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
}

export interface OrderResponse {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}
