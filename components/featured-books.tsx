import React, { useState, useEffect } from 'react';
import BookCard from './book-card';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';

interface Book {
  uid: string;
  title: string;
  author: string;
  book_description: string;
  book_type: string;
  price: number;
  number_of_pages: number;
  bookimage: {
    url: string;
    title: string;
  };
  tags: string[];
  $: any;
}

export default function FeaturedBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchBooks() {
    try {
      console.log('🔍 FeaturedBooks: Fetching via /api/books...');
      const response = await fetch('/api/books');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.books) {
        setBooks(data.books.slice(0, 4)); // Show first 4 books as bestsellers
        console.log('✅ FeaturedBooks: Loaded', data.books.length, 'books, showing first 4');
      } else {
        throw new Error(data.error || 'Failed to load books');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('❌ FeaturedBooks: Error fetching books:', error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      padding: '100px 0',
      marginTop: '0'
    }}>
      <div className='max-width' style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: 'clamp(36px, 5vw, 52px)',
            fontWeight: '700',
            color: '#2d3748',
            marginBottom: '16px',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.5px'
          }}>
            Bestsellers <span style={{ fontStyle: 'italic' }}>&</span> Favorites
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            color: '#5a5a5a',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Discover the books that readers can&apos;t stop talking about.
          </p>
        </div>
        
        {/* Books Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {[...Array(4)].map((_, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <Skeleton height={350} />
              </div>
            ))}
          </div>
        ) : books.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            {books.map((book) => (
              <Link
                key={book.uid}
                href={`/books/${book.uid}`}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                }}
              >
                {/* Book Cover */}
                <div style={{
                  width: '100%',
                  height: '320px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '20px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                }}>
                  <img
                    src={book.bookimage?.url || '/placeholder-book.jpg'}
                    alt={book.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>

                {/* Book Info */}
                <div style={{
                  width: '100%',
                  textAlign: 'center'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginBottom: '8px',
                    fontFamily: 'Georgia, serif',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '56px'
                  }}>
                    {book.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '16px',
                    color: '#718096',
                    marginBottom: '0'
                  }}>
                    {book.author}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '12px'
            }}>
              Coming Soon!
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#718096',
              marginBottom: '32px'
            }}>
              We&apos;re working on adding more amazing books to our collection.
            </p>
            <Link
              href='/books'
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: '#A0522D',
                border: 'none',
                borderRadius: '50px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(160, 82, 45, 0.3)'
              }}
            >
              View Available Books
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
