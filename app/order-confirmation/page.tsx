'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useOrder } from '../../contexts/order-context';

interface Order {
  id: string;
  items: any[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
  appliedPromo?: any;
  cardDetails: any;
  billingAddress: any;
  orderDate: string;
  status: string;
}

function OrderConfirmationContent() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { getOrder } = useOrder();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (orderId) {
      const foundOrder = getOrder(orderId);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    }
    setLoading(false);
  }, [orderId, getOrder]);

  if (loading) {
    return (
      <div className="confirmation-page">
        <div className="max-width">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="max-width">
          <div className="error-state">
            <h1>Order Not Found</h1>
            <p>We couldn't find the order you're looking for.</p>
            <Link href="/" className="home-btn">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const orderDate = new Date(order.orderDate);
  const estimatedDelivery = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days later

  return (
    <div className="confirmation-page">
      <div className="max-width">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        {/* Order Details */}
        <div className="order-details-container">
          <div className="order-info">
            <div className="order-summary-section">
              <h2>Order Summary</h2>
              <div className="order-meta">
                <div className="meta-item">
                  <span className="label">Order ID:</span>
                  <span className="value">{order.id}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Order Date:</span>
                  <span className="value">{orderDate.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="meta-item">
                  <span className="label">Status:</span>
                  <span className="value status-confirmed">Confirmed</span>
                </div>
                <div className="meta-item">
                  <span className="label">Estimated Delivery:</span>
                  <span className="value">{estimatedDelivery.toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items-section">
              <h3>Items Ordered</h3>
              <div className="items-list">
                {order.items.map((item) => (
                  <div key={item.id} className="order-item">
                    <img 
                      src={item.image || '/placeholder-book.jpg'} 
                      alt={item.title}
                      className="item-image"
                    />
                    <div className="item-details">
                      <h4>{item.title}</h4>
                      <p>by {item.author}</p>
                      <p className="item-meta">Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Address */}
            <div className="billing-section">
              <h3>Billing Address</h3>
              <div className="address-card">
                <p><strong>{order.billingAddress.fullName}</strong></p>
                <p>{order.billingAddress.address}</p>
                <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zipCode}</p>
                <p>{order.billingAddress.country}</p>
                <p>📧 {order.billingAddress.email}</p>
                <p>📞 {order.billingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="payment-section">
              <h3>Payment Method</h3>
              <div className="payment-card">
                <p>💳 Card ending in {order.cardDetails.cardNumber.slice(-4)}</p>
                <p>Cardholder: {order.cardDetails.cardholderName}</p>
              </div>
            </div>
          </div>

          {/* Order Total */}
          <div className="order-total-section">
            <div className="total-card">
              <h3>Order Total</h3>
              <div className="total-breakdown">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping}`}</span>
                </div>
                <div className="total-row">
                  <span>Tax (GST 18%)</span>
                  <span>₹{order.tax}</span>
                </div>
                {order.discount > 0 && (
                  <div className="total-row discount">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                {order.appliedPromo && (
                  <div className="promo-applied">
                    <span>🎉 {order.appliedPromo.description}</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total Paid</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="next-steps">
              <h3>What's Next?</h3>
              <div className="steps-list">
                <div className="step completed">
                  <div className="step-icon">✅</div>
                  <div className="step-content">
                    <h4>Order Confirmed</h4>
                    <p>We've received your order and payment</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-icon">📦</div>
                  <div className="step-content">
                    <h4>Processing</h4>
                    <p>We're preparing your books for shipment</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-icon">🚚</div>
                  <div className="step-content">
                    <h4>Shipped</h4>
                    <p>Your order will be dispatched within 24 hours</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-icon">🏠</div>
                  <div className="step-content">
                    <h4>Delivered</h4>
                    <p>Expected delivery by {estimatedDelivery.toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <Link href="/" className="continue-shopping-btn">
            Continue Shopping
          </Link>
          <button 
            onClick={() => window.print()} 
            className="print-btn"
          >
            Print Receipt
          </button>
        </div>

        {/* Email Notification */}
        <div className="email-notification">
          <p>📧 A confirmation email has been sent to <strong>{order.billingAddress.email}</strong></p>
        </div>
      </div>

      <style jsx>{`
        .confirmation-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          padding: 2rem 0;
        }

        .loading-state,
        .error-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner {
          width: 3rem;
          height: 3rem;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .success-header {
          text-align: center;
          margin-bottom: 3rem;
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .success-header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #059669;
          margin-bottom: 1rem;
        }

        .success-header p {
          font-size: 1.125rem;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto;
        }

        .order-details-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .order-info > div {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .order-info h2,
        .order-info h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .order-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 600;
        }

        .status-confirmed {
          color: #059669;
          background: #d1fae5;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          width: fit-content;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #f9fafb;
          border-radius: 12px;
        }

        .item-image {
          width: 80px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .item-details p {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0;
        }

        .item-price {
          font-size: 1.125rem;
          font-weight: 700;
          color: #059669;
        }

        .address-card,
        .payment-card {
          background: #f9fafb;
          padding: 1.5rem;
          border-radius: 12px;
        }

        .address-card p,
        .payment-card p {
          margin: 0.5rem 0;
          color: #374151;
        }

        .total-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .total-card h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .total-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .total-row.discount {
          color: #059669;
        }

        .total-row.final-total {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          border-top: 1px solid #e5e7eb;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }

        .promo-applied {
          background: #d1fae5;
          color: #065f46;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.875rem;
          text-align: center;
        }

        .next-steps {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .next-steps h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .step {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .step.completed {
          opacity: 1;
        }

        .step:not(.completed) {
          opacity: 0.6;
        }

        .step-icon {
          font-size: 1.5rem;
          width: 2.5rem;
          height: 2.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f3f4f6;
          border-radius: 50%;
        }

        .step.completed .step-icon {
          background: #d1fae5;
        }

        .step-content h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .step-content p {
          font-size: 0.75rem;
          color: #6b7280;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .continue-shopping-btn,
        .print-btn {
          padding: 1rem 2rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .continue-shopping-btn {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border: none;
        }

        .print-btn {
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .continue-shopping-btn:hover,
        .print-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .email-notification {
          text-align: center;
          background: #eff6ff;
          color: #1e40af;
          padding: 1rem 2rem;
          border-radius: 12px;
          border: 1px solid #bfdbfe;
        }

        .home-btn {
          background: #6366f1;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          display: inline-block;
          margin-top: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .order-details-container {
            grid-template-columns: 1fr;
          }

          .order-meta {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .confirmation-page {
            padding: 1rem 0;
          }

          .success-header {
            padding: 2rem 1rem;
          }

          .success-header h1 {
            font-size: 2rem;
          }

          .order-info > div,
          .total-card,
          .next-steps {
            padding: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }

          .continue-shopping-btn,
          .print-btn {
            width: 100%;
            max-width: 300px;
            text-align: center;
          }
        }

        /* Print Styles */
        @media print {
          .action-buttons,
          .email-notification {
            display: none;
          }
          
          .confirmation-page {
            background: white;
          }
          
          .order-details-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="confirmation-page">
        <div className="max-width">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading order details...</p>
          </div>
        </div>
      </div>
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}
