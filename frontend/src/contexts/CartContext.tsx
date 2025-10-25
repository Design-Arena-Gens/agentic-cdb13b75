import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI, CartItem } from '../lib/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  cartTotal: number;
  cartItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    if (!user) {
      setCart([]);
      return;
    }
    try {
      setLoading(true);
      const cartData = await cartAPI.getCart();
      setCart(cartData);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number) => {
    try {
      await cartAPI.addToCart({ product_id: productId, quantity });
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const updateCartItem = async (id: number, quantity: number) => {
    try {
      await cartAPI.updateCartItem(id, { quantity });
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await cartAPI.removeFromCart(id);
      await refreshCart();
    } catch (error) {
      throw error;
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateCartItem, removeFromCart, refreshCart, cartTotal, cartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
