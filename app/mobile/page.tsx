'use client';

import React from 'react';
import Link from 'next/link';

export default function MobilePage() {
  return (
    <div className='page-container'>
      <div className='max-width'>
        <div className='page-header'>
          <h1>📱 Mobile Experience</h1>
          <p>Take BookHaven wherever you go</p>
        </div>
        
        <div className='page-content'>
          <section className='mobile-section'>
            <h2>Download Our Mobile App</h2>
            <p>
              Get the full BookHaven experience on your mobile device. Browse, discover, and purchase books 
              on the go with our intuitive mobile application.
            </p>
            
            <div className='app-download-section'>
              <div className='app-features'>
                <h3>Features Include:</h3>
                <ul>
                  <li>📚 Browse our complete book catalog</li>
                  <li>🎯 Personalized recommendations</li>
                  <li>🛒 Easy purchasing and cart management</li>
                  <li>📖 Reading progress tracking</li>
                  <li>🔔 New arrivals notifications</li>
                  <li>⭐ Reviews and ratings</li>
                </ul>
              </div>
              
              <div className='download-buttons'>
                <Link href='https://apps.apple.com' className='app-download-btn ios'>
                  <div className='app-icon'>📱</div>
                  <div className='app-text'>
                    <span className='download-text'>Download on the</span>
                    <span className='store-name'>App Store</span>
                  </div>
                </Link>
                
                <Link href='https://play.google.com' className='app-download-btn android'>
                  <div className='app-icon'>🤖</div>
                  <div className='app-text'>
                    <span className='download-text'>Get it on</span>
                    <span className='store-name'>Google Play</span>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <section className='mobile-section'>
            <h2>Mobile Web Experience</h2>
            <p>
              You're currently viewing our mobile-optimized website. Our responsive design ensures 
              a great experience across all devices, whether you're on a phone, tablet, or desktop.
            </p>
          </section>

          <div className='page-actions'>
            <Link href='/books' className='btn primary-btn'>
              Browse Books
            </Link>
            <Link href='/' className='btn secondary-btn'>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
