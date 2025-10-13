'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className='page-container'>
      <div className='max-width'>
        <div className='page-header'>
          <h1>About BookHaven</h1>
          <p>Your Literary Paradise</p>
        </div>
        
        <div className='page-content'>
          <section className='about-section'>
            <h2>Our Story</h2>
            <p>
              BookHaven was founded with a simple mission: to create the ultimate destination for book lovers. 
              We believe that every reader deserves access to quality books and a personalized reading experience 
              that matches their unique tastes and preferences.
            </p>
          </section>

          <section className='about-section'>
            <h2>What We Do</h2>
            <p>
              We curate an extensive collection of books across all genres, from timeless classics to the latest 
              bestsellers. Our platform uses advanced personalization technology to recommend books that perfectly 
              match your reading preferences, making book discovery an exciting journey.
            </p>
          </section>

          <section className='about-section'>
            <h2>Our Values</h2>
            <ul>
              <li><strong>Quality:</strong> We provide only authentic, high-quality books</li>
              <li><strong>Personalization:</strong> Every recommendation is tailored to your unique taste</li>
              <li><strong>Community:</strong> We foster a community of passionate readers</li>
              <li><strong>Innovation:</strong> We continuously improve your reading experience</li>
            </ul>
          </section>

          <div className='page-actions'>
            <Link href='/books' className='btn primary-btn'>
              Explore Our Collection
            </Link>
            <Link href='/contact-us' className='btn secondary-btn'>
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
