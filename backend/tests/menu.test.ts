import request from 'supertest';
import { createApp } from '../src/app';
import { Express } from 'express';

describe('Menu API', () => {
  let app: Express;

  beforeAll(() => {
    app = createApp();
  });

  describe('GET /api/menu', () => {
    it('should return all menu items', async () => {
      const response = await request(app)
        .get('/api/menu')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(5);
    });

    it('should return menu items with required properties', async () => {
      const response = await request(app)
        .get('/api/menu')
        .expect(200);

      const item = response.body.data[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('description');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('image');
    });
  });

  describe('GET /api/menu/:id', () => {
    it('should return a specific menu item', async () => {
      const response = await request(app)
        .get('/api/menu/biryani-001')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('biryani-001');
      expect(response.body.data.name).toBe('Hyderabadi Chicken Biryani');
    });

    it('should return 404 for non-existent menu item', async () => {
      const response = await request(app)
        .get('/api/menu/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Menu item not found');
    });
  });
});
