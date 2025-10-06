import React from 'react';
import Link from 'next/link';

export default function BookDiscoveryHero() {
  return (
    <div className='book-discovery-hero'>
      <div className='max-width'>
        <div className='hero-content'>
          <div className='hero-text'>
            <h1>Discover Your Next Great Read</h1>
            <p className='hero-subtitle'>
              Find books you&apos;ll love from our carefully curated collection. 
              Whether you&apos;re into fantasy epics, thrilling mysteries, or heartwarming romance, 
              your next adventure is just a page away.
            </p>
            <div className='hero-actions'>
              <Link href='/books' className='btn primary-btn hero-btn'>
                Browse Our Collection
              </Link>
              <Link href='/books' className='btn secondary-btn hero-btn'>
                View Featured Books
              </Link>
            </div>
          </div>
          <div className='hero-stats'>
            <div className='stat-item'>
              <span className='stat-number'>2+</span>
              <span className='stat-label'>Books Available</span>
            </div>
            <div className='stat-item'>
              <span className='stat-number'>5+</span>
              <span className='stat-label'>Genres</span>
            </div>
            <div className='stat-item'>
              <span className='stat-number'>∞</span>
              <span className='stat-label'>Adventures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
