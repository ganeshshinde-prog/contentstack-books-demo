'use client';

import React, { useState } from 'react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Add your authentication logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
          <button className='close-btn' onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className='auth-form'>
          {!isLogin && (
            <div className='form-group'>
              <label htmlFor='name'>Full Name</label>
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
            <label htmlFor='email'>Email Address</label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              placeholder='Enter your email'
            />
          </div>
          
          <div className='form-group'>
            <label htmlFor='password'>Password</label>
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
              <label htmlFor='confirmPassword'>Confirm Password</label>
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
          
          <button type='submit' className='auth-submit-btn'>
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        
        <div className='auth-switch'>
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type='button' 
              className='switch-btn'
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Create Account' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Hook to use the modal
export function useSignInModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  
  return { isOpen, openModal, closeModal, SignInModal };
}
