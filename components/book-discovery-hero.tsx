import React from 'react';
import Link from 'next/link';

export default function BookDiscoveryHero() {
  return (
    <div className='book-discovery-hero-compact'>
      <div className='max-width'>
        <div className='hero-content-compact'>
          <div className='hero-text-compact'>
            <h1 className='hero-title-compact'>Discover Your Next Great Read</h1>
            <p className='hero-subtitle-compact'>
              Find books you'll love from our carefully curated collection.
            </p>
            
            <div className='hero-actions-compact'>
              <Link href='/books' className='btn primary-btn'>
                Browse Books
              </Link>
              <Link href='/new_arrivals' className='btn secondary-btn'>
                New Arrivals
              </Link>
            </div>
          </div>
          
          <div className='hero-stats-compact'>
            <div className='stat-compact'>
              <span className='stat-number-compact'>10K+</span>
              <span className='stat-label-compact'>Books</span>
            </div>
            <div className='stat-compact'>
              <span className='stat-number-compact'>50+</span>
              <span className='stat-label-compact'>Genres</span>
            </div>
            <div className='stat-compact'>
              <span className='stat-number-compact'>5⭐</span>
              <span className='stat-label-compact'>Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
