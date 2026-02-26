import request from 'supertest';
import { createApp } from '../src/app';
import { Express } from 'express';
import { orders } from '../src/models/store';

describe('Order API', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  beforeEach(() => {
    // Clear orders before each test
    orders.clear();
  });

  describe('POST /api/orders', () => {
    const validOrderData = {
      customerName: 'John Doe',
      address: '123 Main St, City',
      phone: '123-456-7890',
      items: [
        { menuId: 'biryani-001', quantity: 2 },
        { menuId: 'butterchicken-001', quantity: 1 }
      ]
    };

    it('should create an order successfully', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send(validOrderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.orderId).toBeDefined();
      expect(typeof response.body.orderId).toBe('string');
    });

    it('should reject empty cart', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          ...validOrderData,
          items: []
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Cart cannot be empty');
    });

    it('should reject invalid phone format', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          ...validOrderData,
          phone: 'invalid-phone'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid phone number format');
    });

    it('should reject negative quantity', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          ...validOrderData,
          items: [{ menuId: 'biryani-001', quantity: -1 }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Quantity must be positive');
    });

    it('should reject zero quantity', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          ...validOrderData,
          items: [{ menuId: 'biryani-001', quantity: 0 }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Quantity must be positive');
    });

    it('should reject non-existing menuId', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          ...validOrderData,
          items: [{ menuId: 'non-existent-id', quantity: 1 }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid menu item IDs');
    });

    it('should reject missing customer name', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          address: '123 Main St',
          phone: '123-456-7890',
          items: [{ menuId: 'burger-001', quantity: 1 }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing address', async () => {
      const response = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'John Doe',
          phone: '123-456-7890',
          items: [{ menuId: 'burger-001', quantity: 1 }]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('should get an order by ID', async () => {
      // First create an order
      const createResponse = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'John Doe',
          address: '123 Main St',
          phone: '123-456-7890',
          items: [{ menuId: 'biryani-001', quantity: 2 }]
        });

      const orderId = createResponse.body.orderId;

      // Then get the order
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(orderId);
      expect(response.body.data.customerName).toBe('John Doe');
      expect(response.body.data.address).toBe('123 Main St');
      expect(response.body.data.phone).toBe('123-456-7890');
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.totalPrice).toBe(598); // 299 * 2
      expect(response.body.data.status).toBe('Order Received');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    let orderId: string;

    beforeEach(async () => {
      // Create an order for testing
      const response = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'John Doe',
          address: '123 Main St',
          phone: '123-456-7890',
          items: [{ menuId: 'biryani-001', quantity: 1 }]
        });
      orderId = response.body.orderId;
    });

    it('should update status from Order Received to Preparing', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Preparing' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Preparing');
    });

    it('should update status from Preparing to Out for Delivery', async () => {
      // First update to Preparing
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Preparing' });

      // Then update to Out for Delivery
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Out for Delivery' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('Out for Delivery');
    });

    it('should reject invalid status transition (Order Received to Out for Delivery)', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Out for Delivery' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status transition');
    });

    it('should reject update when order is in final state', async () => {
      // Progress to final state
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Preparing' });
      await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Out for Delivery' });

      // Try to update again
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Preparing' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('final state');
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .patch('/api/orders/non-existent-id/status')
        .send({ status: 'Preparing' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Order not found');
    });

    it('should reject invalid status value', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .send({ status: 'Invalid Status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
