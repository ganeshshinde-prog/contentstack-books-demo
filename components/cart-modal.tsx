'use client';

import React, { useState } from 'react';

interface CartItem {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: string;
}

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    // Sample cart items for demonstration
    {
      id: '1',
      title: 'The Silent Patient',
      author: 'Alex Michaelides',
      price: 275,
      originalPrice: 399,
      quantity: 1,
      image: '/api/placeholder/100/150'
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalSavings = () => {
    return cartItems.reduce((savings, item) => 
      savings + ((item.originalPrice - item.price) * item.quantity), 0
    );
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='cart-modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Your Cart ({cartItems.length} items)</h2>
          <button className='close-btn' onClick={onClose}>×</button>
        </div>
        
        <div className='cart-content'>
          {cartItems.length === 0 ? (
            <div className='empty-cart'>
              <span className='empty-cart-icon'>🛒</span>
              <h3>Your cart is empty</h3>
              <p>Add some books to get started!</p>
            </div>
          ) : (
            <>
              <div className='cart-items'>
                {cartItems.map((item) => (
                  <div key={item.id} className='cart-item'>
                    <div className='item-image'>
                      <img src={item.image} alt={item.title} />
                    </div>
                    <div className='item-details'>
                      <h4>{item.title}</h4>
                      <p className='author'>by {item.author}</p>
                      <div className='price-section'>
                        <span className='current-price'>₹{item.price}</span>
                        <span className='original-price'>₹{item.originalPrice}</span>
                        <span className='discount'>
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                        </span>
                      </div>
                    </div>
                    <div className='quantity-controls'>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className='qty-btn'
                      >
                        -
                      </button>
                      <span className='quantity'>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className='qty-btn'
                      >
                        +
                      </button>
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.id, 0)}
                      className='remove-btn'
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              
              <div className='cart-summary'>
                <div className='summary-row'>
                  <span>Subtotal:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                <div className='summary-row savings'>
                  <span>You Save:</span>
                  <span>₹{getTotalSavings()}</span>
                </div>
                <div className='summary-row total'>
                  <span>Total:</span>
                  <span>₹{getTotalPrice()}</span>
                </div>
                
                <button className='checkout-btn'>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook to use the cart modal
export function useCartModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  return { isOpen, openModal, closeModal, CartModal };
}
