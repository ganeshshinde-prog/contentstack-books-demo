'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { onEntryChange } from '../../contentstack-sdk';
import { getNewArrivalsRes } from '../../helper';
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

function NewArrivalsContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  async function fetchData() {
    try {
      console.log('🔍 NEW_ARRIVALS PAGE: Starting fetch from NewBookInfo content type...');
      const booksRes = await getNewArrivalsRes();
      console.log('📚 NEW_ARRIVALS PAGE: Received books:', booksRes.length, 'books from NewBookInfo');
      
      setBooks(booksRes);
      setLoading(false);
    } catch (error) {
      console.error('❌ NEW_ARRIVALS PAGE: Error fetching new arrivals:', error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    onEntryChange(() => fetchData());
  }, []);

  const displayedBooks = showAll ? books : books.slice(0, 3);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 100%)',
      minHeight: '100vh',
      padding: '80px 0'
    }}>
      <div className='max-width' style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
        {/* Header Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '60px'
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(42px, 5vw, 64px)',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif',
              letterSpacing: '-0.5px'
            }}>
              Fresh Off The Press
            </h1>
            <p style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              color: '#5a5a5a',
              maxWidth: '600px',
              lineHeight: '1.6'
            }}>
              Check out the latest additions to our growing library.
            </p>
          </div>
          
          {!showAll && books.length > 3 && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#A0522D',
                background: 'transparent',
                border: '2px solid #A0522D',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#A0522D';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#A0522D';
              }}
            >
              View All
            </button>
          )}
        </div>

        {/* Books Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {[...Array(3)].map((_, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <Skeleton height={200} />
              </div>
            ))}
          </div>
        ) : displayedBooks.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {displayedBooks.map((book) => (
              <Link
                key={book.uid}
                href={`/newbook/${book.uid}`}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  gap: '24px',
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
                  flexShrink: 0,
                  width: '140px',
                  height: '200px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
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
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#2d3748',
                    marginBottom: '8px',
                    fontFamily: 'Georgia, serif',
                    lineHeight: '1.3'
                  }}>
                    {book.title}
                  </h3>
                  
                  <p style={{
                    fontSize: '16px',
                    color: '#5a5a5a',
                    marginBottom: '12px'
                  }}>
                    {book.author}
                  </p>
                  
                  <p style={{
                    fontSize: '15px',
                    color: '#718096',
                    lineHeight: '1.6',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {book.book_description || 'A captivating new addition to our collection that will transport you to new worlds and adventures.'}
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
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
            <h3 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '12px'
            }}>
              No New Arrivals Yet
            </h3>
            <p style={{
              fontSize: '16px',
              color: '#718096',
              marginBottom: '32px'
            }}>
              Check back soon for the latest additions to our collection!
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
              Browse All Books
            </Link>
          </div>
        )}

        {/* Show Less Button */}
        {showAll && books.length > 3 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '48px'
          }}>
            <button
              onClick={() => setShowAll(false)}
              style={{
                padding: '14px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#A0522D',
                background: 'transparent',
                border: '2px solid #A0522D',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#A0522D';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#A0522D';
              }}
            >
              Show Less
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewArrivals() {
  return (
    <Suspense fallback={
      <div style={{
        background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dfd0 100%)',
        minHeight: '100vh',
        padding: '80px 0'
      }}>
        <div className='max-width' style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ marginBottom: '60px' }}>
            <h1 style={{
              fontSize: 'clamp(42px, 5vw, 64px)',
              fontWeight: '700',
              color: '#2d3748',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif'
            }}>
              Fresh Off The Press
            </h1>
            <p style={{
              fontSize: '20px',
              color: '#5a5a5a'
            }}>
              Loading the latest additions to our library...
            </p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '32px'
          }}>
            {[...Array(3)].map((_, index) => (
              <div key={index} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <Skeleton height={200} />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <NewArrivalsContent />
    </Suspense>
  );
}
