'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function RequestBookPage() {
  const [formData, setFormData] = useState({
    isbn: '',
    bookTitle: '',
    author: '',
    quantity: '1',
    email: '',
    phone: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<boolean | 'success' | 'inactive'>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send email notification to the customer using Contentstack automation
      const emailResponse = await fetch('/api/send-book-request-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerEmail: formData.email,
          bookTitle: formData.bookTitle,
          author: formData.author,
          isbn: formData.isbn,
          quantity: formData.quantity,
          phone: formData.phone,
          additionalNotes: formData.additionalNotes,
          customerName: formData.email.split('@')[0], // Extract name from email prefix
        }),
      });

      if (!emailResponse.ok) {
        throw new Error('Failed to send confirmation email');
      }

      const emailResult = await emailResponse.json();
      console.log('Email response:', emailResult);
      
      if (emailResult.success === false && emailResult.data?.status === 'automation_inactive') {
        // Handle automation inactive case
        setSubmitted('inactive');
      } else if (emailResult.success) {
        // Handle successful email case
        setSubmitted('success');
      } else {
        throw new Error(emailResult.message || 'Failed to process request');
      }
      
      console.log('Book request submitted:', formData);
    } catch (error) {
      console.error('Error submitting book request:', error);
      alert('There was an error submitting your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      isbn: '',
      bookTitle: '',
      author: '',
      quantity: '1',
      email: '',
      phone: '',
      additionalNotes: ''
    });
    setSubmitted(false);
  };

  return (
    <div className='request-book-page' style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', minHeight: '100vh', paddingTop: '40px' }}>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: center;
          margin-bottom: 60px;
          padding: 40px 20px;
        }
        
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }
      `}</style>
      
      <div className='max-width'>
        {/* Hero Section with Illustration */}
        <div className='hero-grid'>
          {/* Left Side - Text Content */}
          <div>
            <div className='breadcrumb' style={{ marginBottom: '30px' }}>
              <Link href='/' className='breadcrumb-link'>Home</Link>
              <span className='breadcrumb-separator'>›</span>
              <span className='breadcrumb-current'>Request New Book</span>
            </div>
            
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: '800',
              color: '#2d3748',
              marginBottom: '24px',
              lineHeight: '1.2'
            }}>
              Request a New Book
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#4a5568',
              lineHeight: '1.7',
              marginBottom: '32px'
            }}>
              Can&apos;t find the book you&apos;re looking for in our collection? Submit a request and we&apos;ll do our best to add it for you and other readers.
            </p>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#A0522D' }}>24-48h</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Review Time</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#A0522D' }}>1000+</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Books Added</div>
              </div>
              <div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: '#A0522D' }}>95%</div>
                <div style={{ fontSize: '14px', color: '#718096' }}>Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Side - Illustration */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src='/request_book.png' 
              alt='Request a book' 
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                animation: 'float 3s ease-in-out infinite'
              }}
            />
          </div>
        </div>

        {!submitted ? (
          <div className='request-form-section' style={{ marginBottom: '80px' }}>
            <div className='form-container' style={{
              background: 'white',
              borderRadius: '24px',
              padding: '48px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
              maxWidth: '900px',
              margin: '0 auto'
            }}>
              <div className='form-intro' style={{ textAlign: 'center', marginBottom: '48px' }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '12px'
                }}>Tell us about the book</h2>
                <p style={{
                  fontSize: '16px',
                  color: '#718096',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}>Please provide as much information as possible to help us find the exact book you&apos;re looking for.</p>
              </div>

              <form onSubmit={handleSubmit} className='request-form'>
                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='isbn'>
                      ISBN (Optional)
                      <span className='field-help'>
                        <span className='help-icon'>ℹ️</span>
                        <span className='help-text'>13-digit International Standard Book Number</span>
                      </span>
                    </label>
                    <input
                      type='text'
                      id='isbn'
                      name='isbn'
                      value={formData.isbn}
                      onChange={handleChange}
                      placeholder='e.g., 9780123456789'
                      maxLength={13}
                    />
                  </div>
                  <div className='form-group'>
                    <label htmlFor='quantity'>Quantity</label>
                    <select
                      id='quantity'
                      name='quantity'
                      value={formData.quantity}
                      onChange={handleChange}
                    >
                      {[1,2,3,4,5,10].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className='form-group'>
                  <label htmlFor='bookTitle'>Book Title *</label>
                  <input
                    type='text'
                    id='bookTitle'
                    name='bookTitle'
                    value={formData.bookTitle}
                    onChange={handleChange}
                    required
                    placeholder='Enter the complete book title'
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='author'>Author</label>
                  <input
                    type='text'
                    id='author'
                    name='author'
                    value={formData.author}
                    onChange={handleChange}
                    placeholder='Author name (if known)'
                  />
                </div>

                <div className='form-row'>
                  <div className='form-group'>
                    <label htmlFor='email'>Email Address *</label>
                    <input
                      type='email'
                      id='email'
                      name='email'
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder='your.email@example.com'
                    />
                    <small className='field-note'>We&apos;ll notify you when the book becomes available</small>
                  </div>
                  <div className='form-group'>
                    <label htmlFor='phone'>Phone/Mobile</label>
                    <input
                      type='tel'
                      id='phone'
                      name='phone'
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder='+1 (555) 123-4567'
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label htmlFor='additionalNotes'>Additional Information</label>
                  <textarea
                    id='additionalNotes'
                    name='additionalNotes'
                    value={formData.additionalNotes}
                    onChange={handleChange}
                    placeholder='Any additional details like specific edition, publisher, publication year, or why you recommend this book...'
                    rows={4}
                  ></textarea>
                </div>

                <div className='form-actions' style={{
                  display: 'flex',
                  gap: '16px',
                  marginTop: '32px',
                  justifyContent: 'center'
                }}>
                  <button 
                    type='submit' 
                    className='btn primary-btn submit-btn' 
                    disabled={loading}
                    style={{
                      background: '#A0522D',
                      color: 'white',
                      padding: '16px 48px',
                      fontSize: '18px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '50px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 24px rgba(160, 82, 45, 0.3)',
                      opacity: loading ? 0.7 : 1
                    }}
                  >
                    {loading ? (
                      <>
                        <span className='loading-spinner'></span>
                        Submitting Request...
                      </>
                    ) : (
                      '📚 Submit Book Request'
                    )}
                  </button>
                </div>
              </form>

              {/* Info Section Below Form */}
              <div style={{
                marginTop: '48px',
                padding: '32px',
                background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
                borderRadius: '16px'
              }}>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#2d3748',
                  marginBottom: '20px',
                  textAlign: 'center'
                }}>📋 What happens next?</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '24px',
                  marginTop: '24px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔍</div>
                    <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: '600' }}>We Review</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>Within 24-48 hours</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>✅</div>
                    <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: '600' }}>We Add It</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>To our collection</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📧</div>
                    <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: '600' }}>You Get Notified</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>Via email</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
                    <div style={{ fontSize: '14px', color: '#4a5568', fontWeight: '600' }}>Available</div>
                    <div style={{ fontSize: '12px', color: '#718096', marginTop: '4px' }}>For all readers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='success-section' style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            padding: '40px 20px'
          }}>
            <div className='success-content' style={{
              background: 'white',
              borderRadius: '24px',
              padding: '60px 48px',
              maxWidth: '700px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
            }}>
              <div className='success-icon' style={{
                fontSize: '72px',
                marginBottom: '24px',
                animation: 'bounce 1s ease'
              }}>✅</div>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '16px'
              }}>Request Submitted Successfully!</h2>
              <p style={{
                fontSize: '18px',
                color: '#718096',
                marginBottom: '32px'
              }}>Thank you for your book request! We&apos;ve received your submission and will review it shortly.</p>
              
              {submitted === 'success' ? (
                <div className='email-confirmation-notice'>
                  <div className='confirmation-icon'>📧</div>
                  <div className='confirmation-text'>
                    <strong>Confirmation Email Sent!</strong>
                    <p>A confirmation email has been sent to <strong>{formData.email}</strong> with your request details.</p>
                  </div>
                </div>
              ) : submitted === 'inactive' ? (
                <div className='email-confirmation-notice inactive'>
                  <div className='confirmation-icon'>⚠️</div>
                  <div className='confirmation-text'>
                    <strong>Email Service Temporarily Unavailable</strong>
                    <p>Your request has been saved successfully, but we couldn&apos;t send a confirmation email to <strong>{formData.email}</strong> right now. You&apos;ll still receive updates about your request status.</p>
                  </div>
                </div>
              ) : null}
              
              <div className='success-details'>
                <h3>Request Details:</h3>
                <div className='detail-grid'>
                  <div className='detail-item'>
                    <strong>Book Title:</strong>
                    <span>{formData.bookTitle}</span>
                  </div>
                  {formData.author && (
                    <div className='detail-item'>
                      <strong>Author:</strong>
                      <span>{formData.author}</span>
                    </div>
                  )}
                  {formData.isbn && (
                    <div className='detail-item'>
                      <strong>ISBN:</strong>
                      <span>{formData.isbn}</span>
                    </div>
                  )}
                  <div className='detail-item'>
                    <strong>Quantity:</strong>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className='detail-item'>
                    <strong>Email:</strong>
                    <span>{formData.email}</span>
                  </div>
                </div>
              </div>

              <div className='success-actions' style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: '32px'
              }}>
                <button 
                  className='btn primary-btn'
                  onClick={resetForm}
                  style={{
                    background: '#A0522D',
                    color: 'white',
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 6px 20px rgba(160, 82, 45, 0.3)'
                  }}
                >
                  Request Another Book
                </button>
                <Link 
                  href='/books' 
                  className='btn secondary-btn'
                  style={{
                    background: '#f7fafc',
                    color: '#2d3748',
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: '2px solid #e2e8f0',
                    borderRadius: '50px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    transition: 'all 0.3s ease'
                  }}
                >
                  Browse Our Collection
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
