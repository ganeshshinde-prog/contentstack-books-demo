'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, signup, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate passwords match for registration
      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await signup({
          fullName: formData.name,
          email: formData.email,
          phoneNumber: formData.phone || undefined,
          password: formData.password
        });
      }

      if (result.success) {
        // Redirect to home page after successful login/registration
        router.push('/');
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='sign-in-page'>
      <div className='max-width'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <Link href='/' className='breadcrumb-link'>Home</Link>
          <span className='breadcrumb-separator'>›</span>
          <span className='breadcrumb-current'>{isLogin ? 'Sign In' : 'Create Account'}</span>
        </div>

        <div className='sign-in-container'>
          <div className='sign-in-content'>
            <div className='auth-header'>
              <h1>{isLogin ? 'Welcome Back!' : 'Join BookHaven'}</h1>
              <p className='auth-subtitle'>
                {isLogin 
                  ? 'Sign in to access your account and continue your literary journey'
                  : 'Create your account and discover thousands of amazing books'
                }
              </p>
            </div>

            <div className='auth-tabs'>
              <button 
                className={`tab-btn ${isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(true)}
              >
                Sign In
              </button>
              <button 
                className={`tab-btn ${!isLogin ? 'active' : ''}`}
                onClick={() => setIsLogin(false)}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className='auth-form-page'>
              {error && (
                <div className='error-message'>
                  <span className='error-icon'>⚠️</span>
                  {error}
                </div>
              )}

              {!isLogin && (
                <div className='form-group'>
                  <label htmlFor='name'>Full Name *</label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder='Enter your full name'
                  />
                </div>
              )}

              <div className='form-group'>
                <label htmlFor='email'>Email Address *</label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder='Enter your email address'
                />
              </div>

              {!isLogin && (
                <div className='form-group'>
                  <label htmlFor='phone'>Phone Number</label>
                  <input
                    type='tel'
                    id='phone'
                    name='phone'
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder='Enter your phone number (optional)'
                  />
                </div>
              )}

              <div className='form-group'>
                <label htmlFor='password'>Password *</label>
                <input
                  type='password'
                  id='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder='Enter your password'
                />
              </div>

              {!isLogin && (
                <div className='form-group'>
                  <label htmlFor='confirmPassword'>Confirm Password *</label>
                  <input
                    type='password'
                    id='confirmPassword'
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLogin}
                    placeholder='Confirm your password'
                  />
                </div>
              )}

              {isLogin && (
                <div className='form-options'>
                  <div className='remember-me'>
                    <input type='checkbox' id='remember' />
                    <label htmlFor='remember'>Remember me</label>
                  </div>
                  <Link href='/forgot-password' className='forgot-password'>
                    Forgot Password?
                  </Link>
                </div>
              )}

              <button type='submit' className='auth-submit-btn-page' disabled={loading}>
                {loading ? (
                  <>
                    <span className='loading-spinner'></span>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className='auth-divider'>
              <span>or</span>
            </div>

            <div className='social-auth'>
              <button className='social-btn google-btn'>
                <span className='social-icon'>📧</span>
                Continue with Google
              </button>
              <button className='social-btn facebook-btn'>
                <span className='social-icon'>📘</span>
                Continue with Facebook
              </button>
            </div>

            <div className='auth-footer'>
              <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  type='button' 
                  className='switch-link'
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Create Account' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>

          {/* Side benefits panel */}
          <div className='auth-benefits'>
            <h3>Why Join BookHaven?</h3>
            <div className='benefit-list'>
              <div className='benefit-item'>
                <span className='benefit-icon'>📚</span>
                <div>
                  <h4>Vast Collection</h4>
                  <p>Access to thousands of books across all genres</p>
                </div>
              </div>
              <div className='benefit-item'>
                <span className='benefit-icon'>🚚</span>
                <div>
                  <h4>Fast Delivery</h4>
                  <p>Express delivery within 4-5 days with same-day dispatch</p>
                </div>
              </div>
              <div className='benefit-item'>
                <span className='benefit-icon'>💰</span>
                <div>
                  <h4>Best Prices</h4>
                  <p>Competitive pricing with regular discounts and offers</p>
                </div>
              </div>
              <div className='benefit-item'>
                <span className='benefit-icon'>🔒</span>
                <div>
                  <h4>Secure Shopping</h4>
                  <p>100% secure payments and authentic books guaranteed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
