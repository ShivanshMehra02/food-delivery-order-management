import { MenuItem, Order } from './types';

// In-memory storage for menu items - Indian Dishes
export const menuItems: MenuItem[] = [
  {
    id: 'biryani-001',
    name: 'Hyderabadi Chicken Biryani',
    description: 'Aromatic basmati rice layered with tender chicken, saffron, and traditional spices. Served with raita and mirchi ka salan',
    price: 299,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'butterchicken-001',
    name: 'Butter Chicken',
    description: 'Succulent tandoori chicken pieces in rich, creamy tomato-based makhani gravy. Best enjoyed with naan or rice',
    price: 279,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'paneer-001',
    name: 'Paneer Tikka Masala',
    description: 'Grilled cottage cheese cubes in spiced onion-tomato gravy with bell peppers. A vegetarian delight',
    price: 249,
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'dosa-001',
    name: 'Masala Dosa',
    description: 'Crispy golden crepe made from fermented rice batter, stuffed with spiced potato filling. Served with sambar and chutneys',
    price: 149,
    image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'gulabjamun-001',
    name: 'Gulab Jamun',
    description: 'Soft, melt-in-mouth milk solids dumplings soaked in rose-cardamom flavored sugar syrup. Pack of 4 pieces',
    price: 99,
    image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=800&auto=format&fit=crop&q=80'
  }
];

// In-memory storage for orders
export const orders: Map<string, Order> = new Map();

// Export functions to access data
export const getMenuItems = (): MenuItem[] => menuItems;

export const getMenuItem = (id: string): MenuItem | undefined => 
  menuItems.find(item => item.id === id);

export const getOrder = (id: string): Order | undefined => orders.get(id);

export const createOrder = (order: Order): Order => {
  orders.set(order.id, order);
  return order;
};

export const updateOrderStatus = (id: string, status: Order['status']): Order | undefined => {
  const order = orders.get(id);
  if (order) {
    order.status = status;
    orders.set(id, order);
    return order;
  }
  return undefined;
};

export const getAllOrders = (): Order[] => Array.from(orders.values());
