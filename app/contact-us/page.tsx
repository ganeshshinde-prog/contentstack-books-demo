'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
    }, 2000);
  };

  const benefits = [
    {
      icon: '📚',
      title: 'Extensive Collection',
      description: 'Access to diverse books across all genres'
    },
    {
      icon: '⚡',
      title: 'Quick Response',
      description: 'We respond to all inquiries within 24 hours'
    },
    {
      icon: '🎯',
      title: 'Personalized Service',
      description: 'Get book recommendations tailored to your interests'
    }
  ];

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'book-request', label: 'Book Request' },
    { value: 'collaboration', label: 'Partnership/Collaboration' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback' }
  ];

  return (
    <div className='contact-us-page'>
      {/* Hero Section */}
      <div className='contact-hero'>
        <div className='max-width'>
          <div className='contact-hero-content'>
            <h1>Get in touch</h1>
            <p className='hero-subtitle'>
              Connect with fellow book lovers and discover your next great read. 
              Whether you're looking for recommendations, have questions about our collection, 
              or want to share your thoughts, we'd love to hear from you.
            </p>
            
            <div className='contact-benefits'>
              {benefits.map((benefit, index) => (
                <div key={index} className='benefit-item'>
                  <div className='benefit-icon'>{benefit.icon}</div>
                  <div className='benefit-content'>
                    <h3>{benefit.title}</h3>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className='contact-form-section'>
        <div className='max-width'>
          <div className='contact-form-container'>
            <div className='contact-form-left'>
              <h2>How can we help you?</h2>
              <p>Fill out the form below and we'll get back to you as soon as possible.</p>
              
              <div className='contact-info-cards'>
                <div className='info-card'>
                  <div className='info-icon'>📧</div>
                  <div className='info-content'>
                    <h4>Email Us</h4>
                    <p>books@yoursite.com</p>
                  </div>
                </div>
                
                <div className='info-card'>
                  <div className='info-icon'>📞</div>
                  <div className='info-content'>
                    <h4>Call Us</h4>
                    <p>+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className='info-card'>
                  <div className='info-icon'>🕒</div>
                  <div className='info-content'>
                    <h4>Response Time</h4>
                    <p>Within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='contact-form-right'>
              {submitStatus === 'success' ? (
                <div className='success-message'>
                  <div className='success-icon'>✅</div>
                  <h3>Thank you for your message!</h3>
                  <p>We've received your inquiry and will get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setSubmitStatus('')}
                    className='btn secondary-btn'
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className='contact-form'>
                  <div className='form-row'>
                    <div className='form-group'>
                      <label htmlFor='name'>Full Name *</label>
                      <input
                        type='text'
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder='Enter your full name'
                      />
                    </div>
                    
                    <div className='form-group'>
                      <label htmlFor='email'>Email Address *</label>
                      <input
                        type='email'
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder='Enter your email address'
                      />
                    </div>
                  </div>

                  <div className='form-group'>
                    <label htmlFor='inquiryType'>Inquiry Type</label>
                    <select
                      id='inquiryType'
                      name='inquiryType'
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                    >
                      {inquiryTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='form-group'>
                    <label htmlFor='subject'>Subject *</label>
                    <input
                      type='text'
                      id='subject'
                      name='subject'
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder='What is this about?'
                    />
                  </div>

                  <div className='form-group'>
                    <label htmlFor='message'>Message *</label>
                    <textarea
                      id='message'
                      name='message'
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder='Tell us more about your inquiry...'
                    />
                  </div>

                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className={`btn primary-btn submit-btn ${isSubmitting ? 'loading' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className='loading-spinner'></span>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources Section */}
      <div className='contact-resources-section'>
        <div className='max-width'>
          <div className='resources-content'>
            <h2>Looking for something else?</h2>
            <div className='resources-grid'>
              <Link href='/books' className='resource-card'>
                <div className='resource-icon'>📖</div>
                <h3>Browse Books</h3>
                <p>Explore our complete collection of books across all genres</p>
              </Link>
              
              <Link href='/books?genre=Fantasy' className='resource-card'>
                <div className='resource-icon'>🐉</div>
                <h3>Popular Genres</h3>
                <p>Discover books in Fantasy, Mystery, Romance, and more</p>
              </Link>
              
              <Link href='/' className='resource-card'>
                <div className='resource-icon'>🏠</div>
                <h3>Back to Home</h3>
                <p>Return to our homepage for book recommendations</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
