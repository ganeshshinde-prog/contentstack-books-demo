'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, CartItem } from '../../contexts/cart-context';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, addToCart, clearCart } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const removeItem = (id: string) => {
    removeFromCart(id);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalSavings = () => {
    return cartItems.reduce((savings, item) => 
      savings + ((item.originalPrice - item.price) * item.quantity), 0
    );
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    return subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  };

  const getFinalTotal = () => {
    return getSubtotal() + getShippingCost() - promoDiscount;
  };

  const applyPromoCode = () => {
    // Sample promo codes
    const promoCodes: Record<string, number> = {
      'BOOK10': 50,
      'NEWUSER': 100,
      'SAVE20': getSubtotal() * 0.1
    };

    if (promoCodes[promoCode.toUpperCase()]) {
      setPromoDiscount(promoCodes[promoCode.toUpperCase()]);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };

  // Helper function to add test items for checkout testing
  const addTestItems = () => {
    const testBooks = [
      {
        title: 'Band of Brothers',
        author: 'Stephen E. Ambrose',
        price: 299,
        originalPrice: 399,
        image: 'https://images.contentstack.io/v3/assets/blte1f8c41539d5f7e3/blt11801dbfc3008cad/68e6004b32b3a98c61f213db/band_of_brothers.jpeg',
        isbn: 'test-war-book-1',
        inStock: true,
      },
      {
        title: 'The Art of War',
        author: 'Sun Tzu',
        price: 349,
        originalPrice: 449,
        image: 'https://images.contentstack.io/v3/assets/blte1f8c41539d5f7e3/blt11801dbfc3008cad/68e6004b32b3a98c61f213db/band_of_brothers.jpeg',
        isbn: 'test-war-book-2',
        inStock: true,
      }
    ];

    testBooks.forEach(book => {
      addToCart(book);
    });
  };

  // Helper function to add Fantasy books for testing
  const addFantasyBooks = () => {
    const fantasyBooks = [
      {
        title: 'The Lord of the Rings',
        author: 'J.R.R. Tolkien',
        price: 599,
        originalPrice: 799,
        image: 'https://images.contentstack.io/v3/assets/blte1f8c41539d5f7e3/blt11801dbfc3008cad/68e6004b32b3a98c61f213db/band_of_brothers.jpeg',
        isbn: 'test-fantasy-book-1',
        inStock: true,
      },
      {
        title: 'Harry Potter and the Magic Stone',
        author: 'J.K. Rowling',
        price: 449,
        originalPrice: 599,
        image: 'https://images.contentstack.io/v3/assets/blte1f8c41539d5f7e3/blt11801dbfc3008cad/68e6004b32b3a98c61f213db/band_of_brothers.jpeg',
        isbn: 'test-fantasy-book-2',
        inStock: true,
      }
    ];

    fantasyBooks.forEach(book => {
      addToCart(book);
    });
  };

  // Helper function to add Mystery books for testing
  const addMysteryBooks = () => {
    const mysteryBooks = [
      {
        title: 'The Murder of Roger Ackroyd',
        author: 'Agatha Christie',
        price: 399,
        originalPrice: 499,
        image: 'https://images.contentstack.io/v3/assets/blte1f8c41539d5f7e3/blt11801dbfc3008cad/68e6004b32b3a98c61f213db/band_of_brothers.jpeg',
        isbn: 'test-mystery-book-1',
        inStock: true,
      },
      {
        title: 'Sherlock Holmes Complete Collection',
        author: 'Arthur Conan Doyle',
        price: 549,
        originalPrice: 699,
        image: 'https://images.contentstack.io/v3/assets/blte1f8c41539d5f7e3/blt11801dbfc3008cad/68e6004b32b3a98c61f213db/band_of_brothers.jpeg',
        isbn: 'test-mystery-book-2',
        inStock: true,
      }
    ];

    mysteryBooks.forEach(book => {
      addToCart(book);
    });
  };

  return (
    <div className='cart-page'>
      <div className='max-width'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <Link href='/' className='breadcrumb-link'>Home</Link>
          <span className='breadcrumb-separator'>›</span>
          <span className='breadcrumb-current'>Shopping Cart</span>
        </div>

        {cartItems.length === 0 ? (
          <div className='empty-cart-page'>
            <div className='empty-cart-content'>
              <span className='empty-cart-icon-large'>🛒</span>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven&apos;t added any books to your cart yet.</p>
              
              {/* Test Button for Checkout Testing */}
        <div style={{ margin: '1.5rem 0' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={() => clearCart()}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5a6268'}
              onMouseOut={(e) => e.currentTarget.style.background = '#6c757d'}
            >
              🗑️ Clear Cart
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={addTestItems}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#c82333'}
              onMouseOut={(e) => e.currentTarget.style.background = '#dc3545'}
            >
              ⚔️ Add War Books
            </button>
            
            <button
              onClick={addFantasyBooks}
              style={{
                background: '#6f42c1',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#5a32a3'}
              onMouseOut={(e) => e.currentTarget.style.background = '#6f42c1'}
            >
              🧙‍♂️ Add Fantasy Books
            </button>
            
            <button
              onClick={addMysteryBooks}
              style={{
                background: '#fd7e14',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#e8690b'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fd7e14'}
            >
              🔍 Add Mystery Books
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
            Use these buttons to test genre-specific purchase tracking
          </p>
        </div>
              
              <Link href='/books' className='btn primary-btn'>
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div className='cart-content-page'>
            <div className='cart-header'>
              <h1>Shopping Cart ({cartItems.length} items)</h1>
              <Link href='/books' className='continue-shopping'>
                ← Continue Shopping
              </Link>
            </div>

            <div className='cart-layout'>
              {/* Cart Items */}
              <div className='cart-items-section'>
                <div className='cart-items-header'>
                  <span>Product</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                  <span>Action</span>
                </div>

                <div className='cart-items-list'>
                  {cartItems.map((item) => (
                    <div key={item.id} className='cart-item-row'>
                      <div className='item-product'>
                        <div className='item-image-large'>
                          <Image
                            src={item.image}
                            alt={item.title}
                            width={120}
                            height={180}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className='item-info'>
                          <h3>{item.title}</h3>
                          <p className='author'>by {item.author}</p>
                          <p className='isbn'>ISBN: {item.isbn}</p>
                          <div className='stock-status'>
                            {item.inStock ? (
                              <span className='in-stock'>✅ In Stock</span>
                            ) : (
                              <span className='out-of-stock'>❌ Out of Stock</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='item-price'>
                        <div className='price-info'>
                          <span className='current-price'>₹{item.price}</span>
                          <span className='original-price'>₹{item.originalPrice}</span>
                          <span className='discount-badge'>
                            {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% off
                          </span>
                        </div>
                      </div>

                      <div className='item-quantity'>
                        <div className='quantity-controls-large'>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className='qty-btn-large'
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className='quantity-display'>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className='qty-btn-large'
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className='item-total'>
                        <span className='total-price'>₹{item.price * item.quantity}</span>
                      </div>

                      <div className='item-actions'>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className='remove-btn-large'
                          title='Remove item'
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div style={{ marginBottom: '1rem' }}>
                <button
                  onClick={() => clearCart()}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#5a6268'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#6c757d'}
                >
                  🗑️ Clear All Items
                </button>
              </div>

              <div className='order-summary'>
                <h3>Order Summary</h3>

                <div className='summary-details'>
                  <div className='summary-row'>
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                  <div className='summary-row savings'>
                    <span>You Save:</span>
                    <span>₹{getTotalSavings()}</span>
                  </div>
                  <div className='summary-row'>
                    <span>Shipping:</span>
                    <span>
                      {getShippingCost() === 0 ? (
                        <span className='free-shipping'>FREE</span>
                      ) : (
                        `₹${getShippingCost()}`
                      )}
                    </span>
                  </div>
                  {promoApplied && (
                    <div className='summary-row promo'>
                      <span>Promo Discount:</span>
                      <span>-₹{promoDiscount}</span>
                    </div>
                  )}
                  <div className='summary-divider'></div>
                  <div className='summary-row total'>
                    <span>Total:</span>
                    <span>₹{getFinalTotal()}</span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className='promo-section'>
                  <h4>Have a promo code?</h4>
                  <div className='promo-input'>
                    <input
                      type='text'
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder='Enter promo code'
                      disabled={promoApplied}
                    />
                    <button 
                      onClick={applyPromoCode}
                      disabled={!promoCode || promoApplied}
                      className='apply-promo-btn'
                    >
                      Apply
                    </button>
                  </div>
                  {promoApplied && (
                    <div className='promo-success'>
                      ✅ Promo code applied!
                    </div>
                  )}
                  <div className='promo-codes-hint'>
                    <small>Try: BOOK10, NEWUSER, SAVE20</small>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" className='checkout-btn-large'>
                  Proceed to Checkout
                </Link>

                {/* Trust Indicators */}
                <div className='checkout-trust'>
                  <div className='trust-item'>
                    <span>🔒</span>
                    <span>Secure Checkout</span>
                  </div>
                  <div className='trust-item'>
                    <span>🚚</span>
                    <span>Fast Delivery</span>
                  </div>
                  <div className='trust-item'>
                    <span>↩️</span>
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className='shipping-info'>
              <h3>📦 Shipping Information</h3>
              <div className='shipping-benefits'>
                <div className='shipping-benefit'>
                  <strong>Free Shipping:</strong> On orders above ₹500
                </div>
                <div className='shipping-benefit'>
                  <strong>Express Delivery:</strong> 4-5 days with same-day dispatch
                </div>
                <div className='shipping-benefit'>
                  <strong>Secure Packaging:</strong> Books arrive in perfect condition
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
