import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

export const initializeSocket = (server: HTTPServer): SocketIOServer => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CORS_ORIGINS === '*' 
        ? '*' 
        : process.env.CORS_ORIGINS?.split(','),
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io'
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join order-specific room for updates
    socket.on('subscribe-order', (orderId: string) => {
      socket.join(orderId);
      console.log(`Client ${socket.id} subscribed to order ${orderId}`);
    });

    // Leave order room
    socket.on('unsubscribe-order', (orderId: string) => {
      socket.leave(orderId);
      console.log(`Client ${socket.id} unsubscribed from order ${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getSocketIO = (): SocketIOServer | null => io;

export const emitOrderStatusUpdate = (
  orderId: string, 
  status: string, 
  timestamp: string
): void => {
  if (io) {
    io.to(orderId).emit('order-status-updated', {
      orderId,
      status,
      timestamp
    });
  }
};
