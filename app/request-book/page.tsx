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
    <div className='request-book-page'>
      <div className='max-width'>
        {/* Page Header */}
        <div className='request-page-header'>
          <div className='breadcrumb'>
            <Link href='/' className='breadcrumb-link'>Home</Link>
            <span className='breadcrumb-separator'>›</span>
            <span className='breadcrumb-current'>Request New Book</span>
          </div>
          
          <div className='page-hero'>
            <div className='hero-icon'>📚</div>
            <h1>Request a New Book</h1>
            <p className='hero-description'>
              Can&apos;t find the book you&apos;re looking for in our collection? Submit a request and we&apos;ll do our best to add it for you and other readers.
            </p>
          </div>
        </div>

        {!submitted ? (
          <div className='request-form-section'>
            <div className='form-container'>
              <div className='form-intro'>
                <h2>Tell us about the book</h2>
                <p>Please provide as much information as possible to help us find the exact book you&apos;re looking for.</p>
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

                <div className='form-actions'>
                  <button 
                    type='submit' 
                    className='btn primary-btn submit-btn' 
                    disabled={loading}
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
                  <Link href='/' className='btn secondary-btn'>
                    Back to Home
                  </Link>
                </div>
              </form>
            </div>

            {/* Sidebar with information */}
            <div className='request-info-sidebar'>
              <div className='info-card'>
                <h3>📋 What happens next?</h3>
                <ul className='info-list'>
                  <li>We review your request within 2-3 business days</li>
                  <li>If approved, we&apos;ll add the book to our collection</li>
                  <li>You&apos;ll receive an email notification when it&apos;s available</li>
                  <li>The book will appear in our catalog for all readers</li>
                </ul>
              </div>

              <div className='info-card'>
                <h3>💡 Tips for better results</h3>
                <ul className='info-list'>
                  <li>Provide the complete and accurate book title</li>
                  <li>Include the author&apos;s full name if known</li>
                  <li>Add ISBN for faster and more accurate identification</li>
                  <li>Mention specific edition if it matters to you</li>
                </ul>
              </div>

              <div className='info-card'>
                <h3>🔍 Already in our collection?</h3>
                <p>Check if the book you&apos;re looking for is already available:</p>
                <div className='quick-actions'>
                  <Link href='/books' className='btn secondary-btn small'>
                    Browse All Books
                  </Link>
                  <Link href='/new_arrivals' className='btn secondary-btn small'>
                    New Arrivals
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='success-section'>
            <div className='success-content'>
              <div className='success-icon'>✅</div>
              <h2>Request Submitted Successfully!</h2>
              <p>Thank you for your book request! We&apos;ve received your submission and will review it shortly.</p>
              
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

              <div className='success-actions'>
                <button 
                  className='btn primary-btn'
                  onClick={resetForm}
                >
                  Request Another Book
                </button>
                <Link href='/books' className='btn secondary-btn'>
                  Browse Our Collection
                </Link>
                <Link href='/' className='btn secondary-btn'>
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
