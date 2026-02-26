import { Router } from 'express';
import menuRoutes from './menuRoutes';
import orderRoutes from './orderRoutes';

const router = Router();

// API Routes
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
