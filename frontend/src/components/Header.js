import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { totalItems, totalPrice } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Utensils className="w-6 h-6 text-primary" />
            <span>FoodHub</span>
          </Link>

          <Link to="/cart" className="relative flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <>
                <span className="font-medium">₹{totalPrice}</span>
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
