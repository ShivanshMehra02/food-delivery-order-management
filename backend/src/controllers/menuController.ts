import { Request, Response } from 'express';
import { menuService } from '../services';

export class MenuController {
  /**
   * GET /api/menu - Get all menu items
   */
  getMenu(req: Request, res: Response): void {
    const items = menuService.getAllMenuItems();
    res.json({
      success: true,
      data: items
    });
  }

  /**
   * GET /api/menu/:id - Get a single menu item
   */
  getMenuItem(req: Request, res: Response): void {
    const { id } = req.params;
    const item = menuService.getMenuItemById(id);
    
    if (!item) {
      res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
      return;
    }

    res.json({
      success: true,
      data: item
    });
  }
}

export const menuController = new MenuController();
