import { getMenuItems, getMenuItem } from '../models';
import { MenuItem } from '../models/types';

export class MenuService {
  /**
   * Get all menu items
   */
  getAllMenuItems(): MenuItem[] {
    return getMenuItems();
  }

  /**
   * Get a single menu item by ID
   */
  getMenuItemById(id: string): MenuItem | undefined {
    return getMenuItem(id);
  }

  /**
   * Validate that all menu IDs exist
   */
  validateMenuIds(menuIds: string[]): { valid: boolean; invalidIds: string[] } {
    const invalidIds = menuIds.filter(id => !getMenuItem(id));
    return {
      valid: invalidIds.length === 0,
      invalidIds
    };
  }
}

export const menuService = new MenuService();
