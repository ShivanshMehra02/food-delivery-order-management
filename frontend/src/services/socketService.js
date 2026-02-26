import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        path: '/socket.io'
      });
    }
    return this.socket;
  }

  subscribeToOrder(orderId, callback) {
    this.connect();
    this.socket.emit('subscribe-order', orderId);
    this.socket.on('order-status-updated', callback);
    
    return () => {
      this.socket.emit('unsubscribe-order', orderId);
      this.socket.off('order-status-updated', callback);
    };
  }
}

export const socketService = new SocketService();
