import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function BookDiscoveryHero() {
  return (
    <div className='book-discovery-hero crossword-inspired'>
      <div className='max-width'>
        {/* Top announcement bar - inspired by Crossword's promotional messaging */}
        <div className='announcement-bar'>
          <span className='announcement-icon'>⚡</span>
          <span className='announcement-text'>Assured 4-5 Days Express Delivery with Same-Day Dispatch!</span>
          <span className='announcement-separator'>•</span>
          <span className='announcement-text'>📚 100% Authentic, Original & Brand-New Books</span>
        </div>

        <div className='hero-content'>
          <div className='hero-main'>
            <div className='hero-text'>
              {/* Company Logo */}
              <div className='company-logo-section'>
                <div className='logo-container'>
                  <Image
                    src='/company-logo-radu-marcusu-mbKApJz6RSU-unsplash.jpg'
                    alt='Company Logo'
                    width={120}
                    height={80}
                    className='company-logo'
                    priority
                  />
                </div>
                <div className='brand-tagline'>
                  <span className='brand-name'>BookHaven</span>
                  <span className='brand-subtitle'>Your Literary Paradise</span>
                </div>
              </div>

              <h1 className='hero-title'>Discover Your Next Great Read</h1>
              <p className='hero-subtitle'>
                Find books you&apos;ll love from our carefully curated collection. 
                Whether you&apos;re into fantasy epics, thrilling mysteries, or heartwarming romance, 
                your next adventure is just a page away.
              </p>

              {/* Quick categories - inspired by Crossword's category navigation */}
              <div className='quick-categories'>
                <Link href='/books?genre=Fiction' className='category-chip'>Fiction</Link>
                <Link href='/books?genre=Non-Fiction' className='category-chip'>Non Fiction</Link>
                <Link href='/books?genre=Business' className='category-chip'>Business & Management</Link>
                <Link href='/books?genre=Kids' className='category-chip'>Kids Books</Link>
              </div>

              <div className='hero-actions'>
                <Link href='/books' className='btn primary-btn hero-btn'>
                  Browse Our Collection
                </Link>
                <Link href='/new_arrivals' className='btn secondary-btn hero-btn'>
                  New Arrivals
                </Link>
              </div>
            </div>

            <div className='hero-visual'>
              {/* Book showcase - inspired by Crossword's featured books */}
              <div className='featured-book-showcase'>
                <div className='book-stack'>
                  <div className='book-item book-1'>
                    <div className='book-cover'>📖</div>
                    <span className='book-title'>Best Sellers</span>
                  </div>
                  <div className='book-item book-2'>
                    <div className='book-cover'>📚</div>
                    <span className='book-title'>New Arrivals</span>
                  </div>
                  <div className='book-item book-3'>
                    <div className='book-cover'>📓</div>
                    <span className='book-title'>Must Reads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats section - inspired by Crossword's achievements */}
          <div className='hero-stats'>
            <div className='stat-item'>
              <span className='stat-number'>10K+</span>
              <span className='stat-label'>Books Available</span>
            </div>
            <div className='stat-item'>
              <span className='stat-number'>50+</span>
              <span className='stat-label'>Categories</span>
            </div>
            <div className='stat-item'>
              <span className='stat-number'>5⭐</span>
              <span className='stat-label'>Customer Rating</span>
            </div>
            <div className='stat-item'>
              <span className='stat-number'>24/7</span>
              <span className='stat-label'>Support</span>
            </div>
          </div>
        </div>

        {/* Trust indicators - inspired by Crossword's customer assurance */}
        <div className='trust-indicators'>
          <div className='trust-item'>
            <span className='trust-icon'>🚚</span>
            <span className='trust-text'>Fast Delivery</span>
          </div>
          <div className='trust-item'>
            <span className='trust-icon'>🔒</span>
            <span className='trust-text'>Secure Shopping</span>
          </div>
          <div className='trust-item'>
            <span className='trust-icon'>↩️</span>
            <span className='trust-text'>Easy Returns</span>
          </div>
          <div className='trust-item'>
            <span className='trust-icon'>💎</span>
            <span className='trust-text'>Authentic Books</span>
          </div>
        </div>
      </div>
    </div>
  );
}
