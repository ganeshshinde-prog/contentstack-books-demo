'use client';

import React, { useState } from 'react';

export default function RequestNewBook() {
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
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Send email notification to the customer using the API
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
      
      setSubmitted(true);
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
    setShowForm(false);
  };

  return (
    <section className='request-book-section'>
      <div className='max-width'>
        <div className='request-book-header'>
          <div className='request-icon'>📚</div>
          <h2>Can&apos;t Find What You&apos;re Looking For?</h2>
          <p>Request a book and we&apos;ll do our best to add it to our collection</p>
          
          {!showForm && !submitted && (
            <button 
              className='btn primary-btn request-trigger-btn'
              onClick={() => setShowForm(true)}
            >
              📖 Request New Book
            </button>
          )}
        </div>

        {showForm && !submitted && (
          <div className='request-book-form-container'>
            <div className='form-header'>
              <h3>Request a Book</h3>
              <p>Please fill in the details below. We&apos;ll notify you as soon as the book becomes available.</p>
            </div>

            <form onSubmit={handleSubmit} className='request-book-form'>
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
                  placeholder='Enter the book title'
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
                <label htmlFor='additionalNotes'>Additional Notes</label>
                <textarea
                  id='additionalNotes'
                  name='additionalNotes'
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  placeholder='Any additional information about the book (edition, publisher, etc.)'
                  rows={3}
                ></textarea>
              </div>

              <div className='form-actions'>
                <button 
                  type='button' 
                  className='btn secondary-btn'
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
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
              </div>
            </form>
          </div>
        )}

        {submitted && (
          <div className='request-success'>
            <div className='success-icon'>✅</div>
            <h3>Book Request Submitted Successfully!</h3>
            <p>Thank you for your request! We&apos;ve received your book suggestion and will review it shortly.</p>
            <div className='success-details'>
              <div className='detail-item'>
                <strong>Book:</strong> {formData.bookTitle}
              </div>
              {formData.author && (
                <div className='detail-item'>
                  <strong>Author:</strong> {formData.author}
                </div>
              )}
              <div className='detail-item'>
                <strong>Email:</strong> {formData.email}
              </div>
            </div>
            <div className='success-actions'>
              <button 
                className='btn primary-btn'
                onClick={resetForm}
              >
                Request Another Book
              </button>
              <button 
                className='btn secondary-btn'
                onClick={() => window.location.href = '/books'}
              >
                Browse Current Collection
              </button>
            </div>
          </div>
        )}

        <div className='request-book-info'>
          <div className='info-cards'>
            <div className='info-card'>
              <div className='info-icon'>⚡</div>
              <h4>Quick Response</h4>
              <p>We typically review book requests within 2-3 business days</p>
            </div>
            <div className='info-card'>
              <div className='info-icon'>📧</div>
              <h4>Email Updates</h4>
              <p>Get notified when your requested book becomes available</p>
            </div>
            <div className='info-card'>
              <div className='info-icon'>🎯</div>
              <h4>Quality Selection</h4>
              <p>We carefully curate our collection based on reader requests</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
