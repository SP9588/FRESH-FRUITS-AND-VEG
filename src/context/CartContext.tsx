import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string, variations?: any) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => 
        i.id === product.id && 
        JSON.stringify(i.selectedVariations) === JSON.stringify(product.selectedVariations)
      );
      if (existing) {
        return prev.map(i => 
          (i.id === product.id && JSON.stringify(i.selectedVariations) === JSON.stringify(product.selectedVariations))
            ? { ...i, quantity: i.quantity + quantity } 
            : i
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId: string, variations?: any) => {
    setItems(prev => prev.filter(i => 
      !(i.id === productId && JSON.stringify(i.selectedVariations) === JSON.stringify(variations))
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
