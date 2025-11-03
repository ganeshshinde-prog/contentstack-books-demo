import React from 'react';
import Link from 'next/link';

export default function BookDiscoveryHero() {
  return (
    <div 
      style={{
        backgroundImage: 'url(/library-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1
      }}></div>
      
      {/* Hero Content */}
      <div style={{ 
        position: 'relative', 
        zIndex: 2,
        textAlign: 'center',
        padding: '0 20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '24px',
          lineHeight: '1.1',
          textShadow: '2px 4px 12px rgba(0, 0, 0, 0.8)',
          letterSpacing: '-1px'
        }}>
          Find Your Next Chapter
        </h1>
        
        <p style={{
          fontSize: 'clamp(18px, 2vw, 24px)',
          color: '#ffffff',
          marginBottom: '40px',
          maxWidth: '800px',
          margin: '0 auto 40px',
          lineHeight: '1.6',
          textShadow: '1px 2px 8px rgba(0, 0, 0, 0.8)',
          fontWeight: '400'
        }}>
          Explore thousands of worlds, one page at a time. Your next great adventure is just a click away.
        </p>
        
        <Link 
          href='/books' 
          style={{
            display: 'inline-block',
            padding: '18px 48px',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            background: '#A0522D',
            border: 'none',
            borderRadius: '50px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 24px rgba(160, 82, 45, 0.4)',
            textTransform: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#8B4513';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(160, 82, 45, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#A0522D';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(160, 82, 45, 0.4)';
          }}
        >
          Explore Our Collection
        </Link>
      </div>
    </div>
  );
}
