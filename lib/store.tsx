'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem } from '@/types';

export interface OrderItem {
  id: string;
  slug: string;
  title: {
    ru: string;
    en: string;
  };
  price: number;
  quantity: number;
  image: string;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  deliveryMethod: 'courier' | 'pickup' | 'express';
  paymentMethod: 'test_card' | 'payme' | 'click' | 'stripe' | 'cash';
  notes?: string;
}

export interface Order {
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  customer: CustomerInfo;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'processing' | 'paid' | 'delivered';
}

interface StoreContextType {
  favorites: string[]; // array of product slugs
  compareList: string[]; // array of product slugs (up to 4)
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discountTotal: number;
  totalAmount: number;
  toggleFavorite: (idOrSlug: string) => void;
  isFavorite: (idOrSlug: string) => boolean;
  toggleCompare: (idOrSlug: string) => void;
  isInCompare: (idOrSlug: string) => boolean;
  clearCompare: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (customer: CustomerInfo) => Order;
  getOrder: (orderNumber: string) => Order | null;
  updateOrderStatus: (orderNumber: string, status: 'pending' | 'processing' | 'paid' | 'delivered') => void;
  orders: Order[];
  mounted: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const FAVORITES_KEY = 'voltstore_favorites';
const COMPARE_KEY = 'voltstore_compare';
const CART_KEY = 'voltstore_cart';
const ORDERS_KEY = 'voltstore_orders';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem(FAVORITES_KEY);
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedCompare = localStorage.getItem(COMPARE_KEY);
      if (savedCompare) setCompareList(JSON.parse(savedCompare));

      const savedCart = localStorage.getItem(CART_KEY);
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedOrders = localStorage.getItem(ORDERS_KEY);
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch {
      // Ignore localStorage read errors
    }
    setMounted(true);
  }, []);

  const saveCartToStorage = (updatedCart: CartItem[]) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    } catch {}
  };

  const toggleFavorite = (idOrSlug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(idOrSlug)
        ? prev.filter((id) => id !== idOrSlug)
        : [...prev, idOrSlug];
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isFavorite = (idOrSlug: string) => {
    return favorites.includes(idOrSlug);
  };

  const toggleCompare = (idOrSlug: string) => {
    setCompareList((prev) => {
      let next: string[];
      if (prev.includes(idOrSlug)) {
        next = prev.filter((id) => id !== idOrSlug);
      } else {
        // Max 4 items in comparison
        next = prev.length >= 4 ? [...prev.slice(1), idOrSlug] : [...prev, idOrSlug];
      }
      try {
        localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const isInCompare = (idOrSlug: string) => {
    return compareList.includes(idOrSlug);
  };

  const clearCompare = () => {
    setCompareList([]);
    try {
      localStorage.removeItem(COMPARE_KEY);
    } catch {}
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { product, quantity }];
      }
      saveCartToStorage(updated);
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.product.id !== productId);
      saveCartToStorage(updated);
      return updated;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveCartToStorage(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_KEY);
    } catch {}
  };

  const createOrder = (customer: CustomerInfo): Order => {
    // Generate secure human-readable order number: VLT-YYYYMMDD-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const orderNumber = `VLT-${dateStr}-${randomSuffix}`;

    const orderItems: OrderItem[] = cart.map((item) => ({
      id: item.product.id,
      slug: item.product.slug,
      title: item.product.title,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0] || '',
    }));

    const deliveryFee = customer.deliveryMethod === 'express' ? 50000 : customer.deliveryMethod === 'courier' ? 25000 : 0;
    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal + deliveryFee;

    const newOrder: Order = {
      orderNumber,
      createdAt: new Date().toISOString(),
      items: orderItems,
      customer,
      subtotal,
      discount: 0,
      deliveryFee,
      total,
      status: customer.paymentMethod === 'test_card' ? 'paid' : 'pending',
    };

    setOrders((prev) => {
      const nextOrders = [newOrder, ...prev];
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(nextOrders));
      } catch {}
      return nextOrders;
    });

    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderNumber: string, status: 'pending' | 'processing' | 'paid' | 'delivered') => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.orderNumber === orderNumber ? { ...o, status } : o));
      try {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const getOrder = (orderNumber: string): Order | null => {
    const found = orders.find((o) => o.orderNumber === orderNumber);
    if (found) return found;

    try {
      const savedOrders = localStorage.getItem(ORDERS_KEY);
      if (savedOrders) {
        const parsed: Order[] = JSON.parse(savedOrders);
        return parsed.find((o) => o.orderNumber === orderNumber) || null;
      }
    } catch {}

    return null;
  };

  // Calculations
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const regularPrice = item.product.oldPrice || item.product.price;
    return sum + regularPrice * item.quantity;
  }, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountTotal = Math.max(0, subtotal - totalAmount);

  return (
    <StoreContext.Provider
      value={{
        favorites: mounted ? favorites : [],
        compareList: mounted ? compareList : [],
        cart: mounted ? cart : [],
        cartCount: mounted ? cartCount : 0,
        subtotal: mounted ? subtotal : 0,
        discountTotal: mounted ? discountTotal : 0,
        totalAmount: mounted ? totalAmount : 0,
        toggleFavorite,
        isFavorite,
        toggleCompare,
        isInCompare,
        clearCompare,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        createOrder,
        getOrder,
        updateOrderStatus,
        orders: mounted ? orders : [],
        mounted,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return ctx;
}

