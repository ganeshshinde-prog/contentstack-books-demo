'use client';

import React from 'react';

// Common UXPilot-style improvements component
const UXPilotImprovements: React.FC = () => {
  return (
    <div className="ux-improvements">
      {/* Improved Call-to-Action Section */}
      <section className="cta-improvement">
        <div className="cta-container">
          <div className="cta-content">
            <h2 className="cta-headline">Find Your Perfect Book Today</h2>
            <p className="cta-subtext">Join thousands of readers discovering their next favorite story</p>
            <div className="cta-buttons">
              <button className="cta-primary">Start Reading Now</button>
              <button className="cta-secondary">Browse Collection</button>
            </div>
          </div>
          <div className="cta-visual">
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-number">10,000+</span>
                <span className="trust-label">Happy Readers</span>
              </div>
              <div className="trust-item">
                <span className="trust-number">4.9★</span>
                <span className="trust-label">Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved Navigation Breadcrumbs */}
      <nav className="breadcrumb-nav">
        <ol className="breadcrumb-list">
          <li><a href="/">Home</a></li>
          <li><a href="/books">Books</a></li>
          <li className="current">Fiction</li>
        </ol>
      </nav>

      {/* Social Proof Section */}
      <section className="social-proof">
        <h3>What Our Readers Say</h3>
        <div className="testimonials">
          <div className="testimonial">
            <div className="testimonial-content">
              "Amazing selection and fast delivery!"
            </div>
            <div className="testimonial-author">- Sarah M.</div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              "Found books I never knew existed."
            </div>
            <div className="testimonial-author">- John D.</div>
          </div>
        </div>
      </section>

      {/* Urgency/Scarcity Elements */}
      <div className="urgency-banner">
        <span className="urgency-icon">⚡</span>
        <span className="urgency-text">Limited time: Free shipping on orders over $25</span>
        <span className="urgency-timer">Ends in 2 days</span>
      </div>

      {/* Progress Indicators */}
      <div className="progress-indicator">
        <div className="progress-steps">
          <div className="step completed">
            <span className="step-number">1</span>
            <span className="step-label">Browse</span>
          </div>
          <div className="step active">
            <span className="step-number">2</span>
            <span className="step-label">Select</span>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <span className="step-label">Checkout</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '66%' }}></div>
        </div>
      </div>

      <style jsx>{`
        .ux-improvements {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Enhanced CTA Section */
        .cta-improvement {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          padding: 60px 40px;
          margin: 40px 0;
          color: white;
          text-align: center;
        }

        .cta-container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 40px;
          align-items: center;
        }

        .cta-headline {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 16px 0;
          line-height: 1.2;
        }

        .cta-subtext {
          font-size: 1.2rem;
          margin: 0 0 32px 0;
          opacity: 0.9;
        }

        .cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .cta-primary {
          background: white;
          color: #667eea;
          padding: 16px 32px;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .cta-secondary {
          background: transparent;
          color: white;
          padding: 16px 32px;
          border: 2px solid white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cta-secondary:hover {
          background: white;
          color: #667eea;
        }

        .trust-indicators {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .trust-item {
          background: rgba(255, 255, 255, 0.1);
          padding: 24px;
          border-radius: 16px;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .trust-number {
          display: block;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .trust-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        /* Breadcrumb Navigation */
        .breadcrumb-nav {
          margin: 20px 0;
        }

        .breadcrumb-list {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: 8px;
          align-items: center;
        }

        .breadcrumb-list li {
          color: #6b7280;
        }

        .breadcrumb-list li:not(:last-child)::after {
          content: '›';
          margin-left: 8px;
          color: #9ca3af;
        }

        .breadcrumb-list a {
          color: #667eea;
          text-decoration: none;
        }

        .breadcrumb-list a:hover {
          text-decoration: underline;
        }

        .breadcrumb-list .current {
          color: #1f2937;
          font-weight: 500;
        }

        /* Social Proof */
        .social-proof {
          background: #f9fafb;
          padding: 40px;
          border-radius: 16px;
          margin: 40px 0;
          text-align: center;
        }

        .social-proof h3 {
          margin: 0 0 32px 0;
          color: #1f2937;
        }

        .testimonials {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .testimonial {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .testimonial-content {
          font-style: italic;
          margin-bottom: 16px;
          color: #374151;
        }

        .testimonial-author {
          font-weight: 600;
          color: #667eea;
        }

        /* Urgency Banner */
        .urgency-banner {
          background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 16px 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin: 20px 0;
          animation: pulse 2s infinite;
        }

        .urgency-icon {
          font-size: 1.2rem;
        }

        .urgency-text {
          font-weight: 600;
        }

        .urgency-timer {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }

        /* Progress Indicators */
        .progress-indicator {
          margin: 40px 0;
        }

        .progress-steps {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 20px;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          color: #6b7280;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .step.completed .step-number {
          background: #10b981;
          color: white;
        }

        .step.active .step-number {
          background: #667eea;
          color: white;
        }

        .step-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .step.completed .step-label,
        .step.active .step-label {
          color: #1f2937;
          font-weight: 600;
        }

        .progress-bar {
          height: 4px;
          background: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .cta-container {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .cta-headline {
            font-size: 2rem;
          }

          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-primary,
          .cta-secondary {
            width: 100%;
            max-width: 280px;
          }

          .progress-steps {
            gap: 20px;
          }

          .urgency-banner {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default UXPilotImprovements;

