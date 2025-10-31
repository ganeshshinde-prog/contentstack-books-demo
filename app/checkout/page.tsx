'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../contexts/cart-context';
import { useAuth } from '../../contexts/auth-context';
import { useOrder } from '../../contexts/order-context';
import { usePersonalization } from '../../contexts/personalization-context';

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface BillingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PromoCode {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  description: string;
}

const PROMO_CODES: Record<string, PromoCode> = {
  'BOOK10': {
    code: 'BOOK10',
    discount: 10,
    type: 'percentage',
    description: '10% off on all books'
  },
  'NEWUSER': {
    code: 'NEWUSER',
    discount: 50,
    type: 'fixed',
    description: '₹50 off for new users'
  },
  'SAVE20': {
    code: 'SAVE20',
    discount: 20,
    type: 'percentage',
    description: '20% off on orders above ₹500'
  }
};

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { createOrder } = useOrder();
  const { triggerPersonalizeEvent, setPersonalizeAttributes } = usePersonalization();
  const router = useRouter();

  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOrderComplete, setIsOrderComplete] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if cart is empty or user not authenticated (but not during order processing)
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in');
      return;
    }
    
    // Don't redirect if we're processing an order or order is complete
    if (isProcessing || isOrderComplete) {
      return;
    }
    
    if (getCartCount() === 0) {
      router.push('/carts');
      return;
    }
  }, [isAuthenticated, getCartCount, router, isProcessing, isOrderComplete]);

  // Update billing address when user data changes
  useEffect(() => {
    if (user) {
      setBillingAddress(prev => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
        phone: user.phoneNumber || ''
      }));
    }
  }, [user]);

  const subtotal = getCartTotal();
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const tax = Math.round(subtotal * 0.18); // 18% GST

  const calculateDiscount = () => {
    if (!appliedPromo) return 0;
    
    if (appliedPromo.type === 'percentage') {
      return Math.round(subtotal * (appliedPromo.discount / 100));
    } else {
      return appliedPromo.discount;
    }
  };

  const discount = calculateDiscount();
  const total = subtotal + shipping + tax - discount;

  // Helper function to extract book genres from cart items
  const getBookGenres = () => {
    const genres = cartItems.map(item => {
      // Try to extract genre from item properties
      // Cart items might have genre info in different formats
      return item.isbn || item.id; // We'll need to map this to actual book data
    });
    return genres;
  };

  // Helper function to send book purchase events
  const sendBookPurchaseEvents = async () => {
    try {
      console.log('📚 Analyzing cart items for genre detection:', cartItems.map(item => ({
        title: item.title,
        author: item.author,
        isbn: item.isbn
      })));
      
      console.log('🔍 DETAILED CART ANALYSIS:');
      cartItems.forEach((item, index) => {
        console.log(`  Item ${index + 1}:`, {
          title: item.title,
          titleLower: item.title?.toLowerCase(),
          author: item.author,
          authorLower: item.author?.toLowerCase(),
          isbn: item.isbn
        });
      });

      // Check for War books
      console.log('🎯 STARTING WAR BOOK DETECTION...');
      const hasWarBooks = cartItems.some(item => {
        const titleLower = item.title?.toLowerCase() || '';
        const authorLower = item.author?.toLowerCase() || '';
        
        console.log(`🔍 Analyzing: "${item.title}" by ${item.author}`);
        console.log(`   - titleLower: "${titleLower}"`);
        console.log(`   - authorLower: "${authorLower}"`);
        
        const hasWar = titleLower.includes('war');
        const hasBattle = titleLower.includes('battle');
        const hasMilitary = titleLower.includes('military');
        const hasBrothers = titleLower.includes('brothers');
        const hasAmbrose = authorLower.includes('ambrose');
        
        console.log(`   - Contains 'war': ${hasWar}`);
        console.log(`   - Contains 'battle': ${hasBattle}`);
        console.log(`   - Contains 'military': ${hasMilitary}`);
        console.log(`   - Contains 'brothers': ${hasBrothers}`);
        console.log(`   - Author contains 'ambrose': ${hasAmbrose}`);
        
        const isWarBook = hasWar || hasBattle || hasMilitary || hasBrothers || hasAmbrose;
        
        console.log(`🔍 Final result for "${item.title}": ${isWarBook ? '✅ WAR BOOK' : '❌ NOT WAR BOOK'}`);
        return isWarBook;
      });
      
      console.log(`🎯 WAR BOOK DETECTION COMPLETE: ${hasWarBooks ? '✅ WAR BOOKS FOUND' : '❌ NO WAR BOOKS FOUND'}`);

      if (hasWarBooks) {
        console.log('🎯 War books detected in cart - sending book_purchased event and user attributes');
        
        // Send both requests in parallel (matching book_viewed pattern)
        await Promise.all([
          setPersonalizeAttributes({
            book_genre: 'War'
          }),
          triggerPersonalizeEvent('book_purchased', {
            book_genre: 'War',
            order_total: total,
            item_count: cartItems.length,
            purchased_books: cartItems.map(item => item.title).join(', '),
            timestamp: new Date().toISOString()
          })
        ]);
        console.log('✅ War genre - both attribute and event sent successfully');
      }

      // Check for other genres
      const hasFantasyBooks = cartItems.some(item => {
        const titleLower = item.title?.toLowerCase() || '';
        
        const isFantasyBook = titleLower.includes('fantasy') || 
                             titleLower.includes('magic') ||
                             titleLower.includes('dragon') ||
                             titleLower.includes('wizard') ||
                             titleLower.includes('potter') ||
                             titleLower.includes('rings');
        
        console.log(`🔍 Checking book: "${item.title}" - Fantasy book: ${isFantasyBook}`);
        return isFantasyBook;
      });
      
      if (hasFantasyBooks) {
        console.log('🎯 Fantasy books detected in cart - sending book_purchased event and user attributes');
        
        // Send both requests in parallel (matching book_viewed pattern)
        await Promise.all([
          setPersonalizeAttributes({
            book_genre: 'Fantasy'
          }),
          triggerPersonalizeEvent('book_purchased', {
            book_genre: 'Fantasy',
            order_total: total,
            item_count: cartItems.length,
            purchased_books: cartItems.map(item => item.title).join(', '),
            timestamp: new Date().toISOString()
          })
        ]);
        console.log('✅ Fantasy genre - both attribute and event sent successfully');
      }

      // Check for Mystery books
      const hasMysteryBooks = cartItems.some(item => {
        const titleLower = item.title?.toLowerCase() || '';
        const authorLower = item.author?.toLowerCase() || '';
        
        const isMysteryBook = titleLower.includes('mystery') || 
                             titleLower.includes('detective') ||
                             titleLower.includes('murder') ||
                             titleLower.includes('sherlock') ||
                             authorLower.includes('christie') ||
                             authorLower.includes('doyle');
        
        console.log(`🔍 Checking book: "${item.title}" by ${item.author} - Mystery book: ${isMysteryBook}`);
        return isMysteryBook;
      });
      
      if (hasMysteryBooks) {
        console.log('🎯 Mystery books detected in cart - sending book_purchased event and user attributes');
        
        // Send both requests in parallel (matching book_viewed pattern)
        await Promise.all([
          setPersonalizeAttributes({
            book_genre: 'Mystery'
          }),
          triggerPersonalizeEvent('book_purchased', {
            book_genre: 'Mystery',
            order_total: total,
            item_count: cartItems.length,
            purchased_books: cartItems.map(item => item.title).join(', '),
            timestamp: new Date().toISOString()
          })
        ]);
        console.log('✅ Mystery genre - both attribute and event sent successfully');
      }

      // If no specific genre detected, send a general purchase event
      if (!hasWarBooks && !hasFantasyBooks && !hasMysteryBooks) {
        console.log('📚 No specific genre detected - sending general book_purchased event and user attributes');
        console.log('🔍 Genre detection summary:', {
          hasWarBooks,
          hasFantasyBooks,
          hasMysteryBooks
        });
        
        // Send both requests in parallel (matching book_viewed pattern)
        await Promise.all([
          setPersonalizeAttributes({
            book_genre: 'General'
          }),
          triggerPersonalizeEvent('book_purchased', {
            book_genre: 'General',
            order_total: total,
            item_count: cartItems.length,
            purchased_books: cartItems.map(item => item.title).join(', '),
            timestamp: new Date().toISOString()
          })
        ]);
        console.log('✅ General genre - both attribute and event sent successfully');
      }

    } catch (error) {
      console.error('❌ Error sending book_purchased event:', error);
      // Don't fail the order if event tracking fails
    }
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
      if (formattedValue.length > 5) formattedValue = formattedValue.slice(0, 5);
    }

    // Format CVV
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBillingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const applyPromoCode = () => {
    const code = promoCode.toUpperCase().trim();
    const promo = PROMO_CODES[code];
    
    if (!promo) {
      setPromoError('Invalid promo code');
      return;
    }

    // Check if SAVE20 requires minimum order
    if (code === 'SAVE20' && subtotal < 500) {
      setPromoError('This promo code requires a minimum order of ₹500');
      return;
    }

    setAppliedPromo(promo);
    setPromoError('');
    setPromoCode('');
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError('');
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate card details
    if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!cardDetails.expiryDate || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Please enter a valid 3-digit CVV';
    }

    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter the cardholder name';
    }

    // Validate billing address
    if (!billingAddress.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!billingAddress.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!billingAddress.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!billingAddress.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!billingAddress.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!billingAddress.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!billingAddress.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    // Show confirmation first
    setShowConfirmation(true);
  };

  const confirmPlaceOrder = async () => {
    setShowConfirmation(false);
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create order using order context
      console.log('🛒 Creating order with data:', {
        itemCount: cartItems.length,
        total,
        appliedPromo: appliedPromo?.code
      });
      
      const orderId = await createOrder({
        items: cartItems,
        subtotal,
        shipping,
        tax,
        discount,
        total,
        appliedPromo: appliedPromo || undefined,
        cardDetails: {
          ...cardDetails,
          cardNumber: '**** **** **** ' + cardDetails.cardNumber.slice(-4)
        },
        billingAddress
      });

      console.log('✅ Order created successfully with ID:', orderId);

      // Send book purchase events for personalization
      await sendBookPurchaseEvents();

      // Mark order as complete to prevent cart redirect
      setIsOrderComplete(true);

      // Clear cart
      clearCart();
      console.log('🗑️ Cart cleared');

      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100));

      // Redirect to order confirmation
      console.log('🔄 Redirecting to order confirmation...');
      router.push(`/order-confirmation?orderId=${orderId}`);

    } catch (error) {
      console.error('Order processing failed:', error);
      setErrors({ submit: 'Order processing failed. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || getCartCount() === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="checkout-page">
      <div className="max-width">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/carts" className="breadcrumb-link">Cart</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">Checkout</span>
        </div>

        <div className="checkout-container">
          {/* Left Column - Forms */}
          <div className="checkout-forms">
            <h1>Checkout</h1>

            {/* Billing Address */}
            <div className="checkout-section">
              <h2>📍 Billing Address</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={billingAddress.fullName}
                    onChange={handleBillingInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-message">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={billingAddress.email}
                    onChange={handleBillingInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={billingAddress.phone}
                    onChange={handleBillingInputChange}
                    className={errors.phone ? 'error' : ''}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="address">Address *</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={billingAddress.address}
                    onChange={handleBillingInputChange}
                    className={errors.address ? 'error' : ''}
                    placeholder="Street address, apartment, suite, etc."
                  />
                  {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={billingAddress.city}
                    onChange={handleBillingInputChange}
                    className={errors.city ? 'error' : ''}
                  />
                  {errors.city && <span className="error-message">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={billingAddress.state}
                    onChange={handleBillingInputChange}
                    className={errors.state ? 'error' : ''}
                  />
                  {errors.state && <span className="error-message">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="zipCode">ZIP Code *</label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={billingAddress.zipCode}
                    onChange={handleBillingInputChange}
                    className={errors.zipCode ? 'error' : ''}
                  />
                  {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="country">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={billingAddress.country}
                    onChange={handleBillingInputChange}
                  >
                    <option value="India">India</option>
                    <option value="USA">United States</option>
                    <option value="UK">United Kingdom</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="checkout-section">
              <h2>💳 Payment Details</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="cardNumber">Card Number *</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={cardDetails.cardNumber}
                    onChange={handleCardInputChange}
                    placeholder="1234 5678 9012 3456"
                    className={errors.cardNumber ? 'error' : ''}
                  />
                  {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={cardDetails.expiryDate}
                    onChange={handleCardInputChange}
                    placeholder="MM/YY"
                    className={errors.expiryDate ? 'error' : ''}
                  />
                  {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={cardDetails.cvv}
                    onChange={handleCardInputChange}
                    placeholder="123"
                    className={errors.cvv ? 'error' : ''}
                  />
                  {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="cardholderName">Cardholder Name *</label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={cardDetails.cardholderName}
                    onChange={handleCardInputChange}
                    placeholder="Name as it appears on card"
                    className={errors.cardholderName ? 'error' : ''}
                  />
                  {errors.cardholderName && <span className="error-message">{errors.cardholderName}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              {/* Cart Items */}
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
                    <img 
                      src={item.image || '/placeholder-book.jpg'} 
                      alt={item.title}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.title}</h4>
                      <p>by {item.author}</p>
                      <p className="item-price">₹{item.price} × {item.quantity}</p>
                    </div>
                    <div className="item-total">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="promo-section">
                <h3>Have a promo code?</h3>
                <div className="promo-input">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    disabled={!!appliedPromo}
                  />
                  <button 
                    onClick={applyPromoCode}
                    disabled={!promoCode.trim() || !!appliedPromo}
                    className="apply-btn"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="error-message">{promoError}</p>}
                {appliedPromo && (
                  <div className="applied-promo">
                    <span>✅ {appliedPromo.description}</span>
                    <button onClick={removePromoCode} className="remove-promo">×</button>
                  </div>
                )}
                <p className="promo-suggestions">Try: BOOK10, NEWUSER, SAVE20</p>
              </div>

              {/* Order Totals */}
              <div className="order-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
                <div className="total-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="total-row total">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="place-order-btn"
              >
                {isProcessing ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>

              {errors.submit && (
                <p className="error-message">{errors.submit}</p>
              )}

              {/* Security Features */}
              <div className="security-features">
                <div className="feature">
                  <span>🔒</span>
                  <span>Secure Checkout</span>
                </div>
                <div className="feature">
                  <span>🚚</span>
                  <span>Fast Delivery</span>
                </div>
                <div className="feature">
                  <span>↩️</span>
                  <span>Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Confirmation Modal */}
      {showConfirmation && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <div className="confirmation-header">
              <h2>🛒 Confirm Your Order</h2>
              <p>Please review your order details before proceeding with payment.</p>
            </div>
            
            <div className="confirmation-summary">
              <div className="summary-row">
                <span>Items ({cartItems.length})</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax (GST 18%)</span>
                <span>₹{tax}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total Amount</span>
                <span>₹{total}</span>
              </div>
            </div>

            <div className="confirmation-payment">
              <p><strong>Payment Method:</strong> Card ending in {cardDetails.cardNumber.slice(-4)}</p>
              <p><strong>Billing Address:</strong> {billingAddress.fullName}, {billingAddress.city}</p>
              
              {/* Debug info for genre detection */}
              <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f0f9ff', borderRadius: '4px', fontSize: '0.75rem' }}>
                <strong>📚 Books in order:</strong>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                  {cartItems.map((item, index) => (
                    <li key={index}>{item.title} by {item.author}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="confirmation-actions">
              <button 
                onClick={() => setShowConfirmation(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                onClick={confirmPlaceOrder}
                className="confirm-btn"
              >
                ✅ Confirm & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem 0;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }

        .breadcrumb-link {
          color: #6366f1;
          text-decoration: none;
        }

        .breadcrumb-link:hover {
          text-decoration: underline;
        }

        .breadcrumb-separator {
          color: #9ca3af;
        }

        .breadcrumb-current {
          color: #374151;
          font-weight: 500;
        }

        .checkout-container {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 3rem;
          align-items: start;
        }

        .checkout-forms h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 2rem;
        }

        .checkout-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .checkout-section h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select {
          padding: 0.875rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #f9fafb;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .form-group input.error,
        .form-group select.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        .order-summary {
          position: sticky;
          top: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .summary-card h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .order-items {
          margin-bottom: 2rem;
        }

        .order-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 60px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .item-details p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .item-price {
          font-weight: 500;
          color: #374151;
        }

        .item-total {
          font-weight: 600;
          color: #1f2937;
        }

        .promo-section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .promo-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
        }

        .promo-input {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .promo-input input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
        }

        .apply-btn {
          background: #6366f1;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .apply-btn:hover:not(:disabled) {
          background: #4f46e5;
        }

        .apply-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .applied-promo {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .remove-promo {
          background: none;
          border: none;
          color: #065f46;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .promo-suggestions {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .order-totals {
          border-top: 1px solid #e5e7eb;
          padding-top: 1.5rem;
          margin-bottom: 2rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .total-row.discount {
          color: #059669;
        }

        .total-row.total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          border-top: 1px solid #e5e7eb;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }

        .place-order-btn {
          width: 100%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .place-order-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        .place-order-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .security-features {
          display: flex;
          justify-content: space-around;
          text-align: center;
        }

        .feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: #6b7280;
        }

        .feature span:first-child {
          font-size: 1.5rem;
        }

        /* Confirmation Modal Styles */
        .confirmation-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .confirmation-modal {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .confirmation-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .confirmation-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .confirmation-header p {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .confirmation-summary {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          font-size: 0.875rem;
        }

        .summary-row.discount {
          color: #059669;
        }

        .summary-row.total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          border-top: 1px solid #e5e7eb;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }

        .confirmation-payment {
          background: #eff6ff;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .confirmation-payment p {
          margin: 0.25rem 0;
          font-size: 0.875rem;
          color: #1e40af;
        }

        .confirmation-actions {
          display: flex;
          gap: 1rem;
        }

        .cancel-btn, .confirm-btn {
          flex: 1;
          padding: 0.875rem 1.5rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .cancel-btn {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-btn:hover {
          background: #e5e7eb;
        }

        .confirm-btn {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
        }

        .confirm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .checkout-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .order-summary {
            position: static;
          }
        }

        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .checkout-section {
            padding: 1.5rem;
          }

          .summary-card {
            padding: 1.5rem;
          }

          .confirmation-modal {
            padding: 1.5rem;
            margin: 1rem;
          }

          .confirmation-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
