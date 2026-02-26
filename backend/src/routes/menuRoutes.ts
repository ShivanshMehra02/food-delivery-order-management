import { Router } from 'express';
import { menuController } from '../controllers';

const router = Router();

// GET /api/menu - Get all menu items
router.get('/', (req, res) => menuController.getMenu(req, res));

// GET /api/menu/:id - Get a single menu item
router.get('/:id', (req, res) => menuController.getMenuItem(req, res));

export default router;
