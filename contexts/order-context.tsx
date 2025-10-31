'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Order {
  id: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  appliedPromo?: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    description: string;
  };
  cardDetails: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardholderName: string;
  };
  billingAddress: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  createOrder: (orderData: Omit<Order, 'id' | 'orderDate' | 'status'>) => Promise<string>;
  getOrder: (orderId: string) => Order | null;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getOrderHistory: () => Order[];
  clearOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load orders from localStorage on mount
  useEffect(() => {
    const loadOrders = () => {
      try {
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        const storedOrders = localStorage.getItem('bookhaven-orders');
        if (storedOrders) {
          const parsedOrders = JSON.parse(storedOrders);
          setOrders(parsedOrders);
          console.log('✅ Loaded orders from localStorage:', parsedOrders.length);
        }
      } catch (error) {
        console.error('Error loading orders from localStorage:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('bookhaven-orders');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      localStorage.setItem('bookhaven-orders', JSON.stringify(orders));
    }
  }, [orders, isLoading]);

  const createOrder = async (orderData: Omit<Order, 'id' | 'orderDate' | 'status'>): Promise<string> => {
    try {
      setIsLoading(true);

      // Generate unique order ID
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Calculate estimated delivery (5 business days)
      const orderDate = new Date();
      const estimatedDelivery = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000));

      const newOrder: Order = {
        ...orderData,
        id: orderId,
        orderDate: orderDate.toISOString(),
        status: 'confirmed',
        estimatedDelivery: estimatedDelivery.toISOString(),
        trackingNumber: `TRK${Date.now().toString().slice(-8)}`
      };

      // Add to orders array
      setOrders(prev => [newOrder, ...prev]);
      setCurrentOrder(newOrder);

      console.log('✅ Order created successfully:', orderId);
      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrder = (orderId: string): Order | null => {
    return orders.find(order => order.id === orderId) || null;
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { ...order, status }
          : order
      )
    );

    // Update current order if it matches
    if (currentOrder?.id === orderId) {
      setCurrentOrder(prev => prev ? { ...prev, status } : null);
    }

    console.log(`✅ Order ${orderId} status updated to: ${status}`);
  };

  const getOrderHistory = (): Order[] => {
    return orders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
  };

  const clearOrders = () => {
    setOrders([]);
    setCurrentOrder(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bookhaven-orders');
    }
    console.log('✅ All orders cleared');
  };

  const value: OrderContextType = {
    orders,
    currentOrder,
    isLoading,
    createOrder,
    getOrder,
    updateOrderStatus,
    getOrderHistory,
    clearOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export default OrderProvider;
