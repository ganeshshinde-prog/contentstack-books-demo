'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import parse from 'html-react-parser';
import Skeleton from 'react-loading-skeleton';
import { useCart } from '../../../contexts/cart-context';
import { usePersonalization } from '../../../contexts/personalization-context';

interface ExtendedBook {
  uid: string;
  title: string;
  author?: string;
  book_summary?: string; // This is the main field from your Contentstack entry
  book_description?: string; // Regular book description as fallback
  book_type?: string;
  price?: number;
  number_of_pages?: number;
  publication_year?: string;
  isbn?: string;
  bookimage?: {
    url: string;
    title: string;
  };
  tags: string[];
  key_features?: string[];
  rating?: number;
  reviews_count?: number;
  $: any;
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { trackBehavior } = usePersonalization();
  
  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false); // Add tracking flag

  const bookUid = params.uid as string;

  useEffect(() => {
    if (!bookUid) return;

    async function fetchBookDetails() {
      try {
        console.log(`🔍 BookDetail: Fetching extended info for UID: ${bookUid}`);
        const response = await fetch(`/api/books/${bookUid}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Book not found');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.book) {
          setBook(data.book);
          console.log(`✅ BookDetail: Loaded extended info for: ${data.book.title}`);
          
          // Only track the view once per page load
          if (!hasTrackedView) {
            console.group(`📖 BOOK VIEW TRACKING`);
            console.log(`📚 Book Details:`, {
              uid: data.book.uid,
              title: data.book.title,
              genre: data.book.book_type,
              author: data.book.author,
              price: data.book.price
            });
            console.log(`📊 Tracking book view for personalization...`);
            window.jstag.send({event: 'book_viewed', book_genre: data.book.book_type});
            
            // Send Lytics book_viewed event
            // try {
            //   if (typeof window !== 'undefined' && window.jstag) {
            //     // book_genre: data.book.book_type,
            //   //   { event: 'book_viewed',
            //   //     book_id: data.book.uid,
            //   //     book_title: data.book.title,
            //   //     book_author: data.book.author,
            //   //    book_genre: data.book.book_type ,
            //   //     book_price: data.book.price,
            //   //     book_pages: data.book.number_of_pages,
            //   //     book_tags: data.book.tags,
            //   //     page_type: 'book_detail',
            //   //     timestamp: new Date().toISOString(),
            //   //     page_url: window.location.href,
            //   //     page_title: document.
            //   // }
            //       // const lyticsEventData = {
            //       //   event: 'book_viewed',
            //       //   book_id: data.book.uid,
            //       //   book_title: data.book.title,
            //       //   book_author: data.book.author,
            //       //   book_genre: data.book.book_type,
            //       //   book_price: data.book.price,
            //       //   book_pages: data.book.number_of_pages,
            //       //   book_tags: data.book.tags,
            //       //   page_type: 'book_detail',
            //       //   timestamp: new Date().toISOString(),
            //       //   page_url: window.location.href,
            //       //   page_title: document.title
            //     };
                
            //     // Send event to Lytics default stream
            //     window.jstag.send({event: 'book_viewed', book_genre: data.book.book_type});
            //     // console.log('📊 Lytics book_viewed event sent from detail page:', lyticsEventData);
            //   } else {
            //     console.warn('⚠️ Lytics jstag not available on detail page');
            //   }
            // } catch (error) {
            //   console.error('❌ Error sending Lytics event from detail page:', error);
            // }
            
            trackBehavior('view_book', { 
              bookId: data.book.uid,
              title: data.book.title,
              genre: data.book.book_type,
              author: data.book.author,
              price: data.book.price,
            });
            
            setHasTrackedView(true);
            console.log(`✅ Book view tracked and flag set to prevent duplicates`);
            console.groupEnd();
          } else {
            console.log(`🚫 Book view already tracked for this page load`);
          }
          
        } else {
          throw new Error(data.error || 'Failed to load book details');
        }
        
        setLoading(false);
      } catch (err: any) {
        console.error('❌ BookDetail: Error fetching book details:', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchBookDetails();
  }, [bookUid]); // Remove trackBehavior and hasTrackedView from dependencies

  const handleAddToCart = async () => {
    if (!book) return;
    
    setIsAddingToCart(true);
    
      try {
        // Calculate original price (assuming 20-30% discount for demo)
        const originalPrice = Math.round((book.price || 0) * 1.25);

        addToCart({
          title: book.title,
          author: book.author || 'Unknown Author',
          price: book.price || 0,
          originalPrice: originalPrice,
          image: book.bookimage?.url || '',
          isbn: book.isbn || book.uid,
          inStock: true,
        });

        // Show adding state briefly
        await new Promise(resolve => setTimeout(resolve, 800));
        
      } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="max-width">
          <div className="book-detail-loading">
            <Skeleton height={40} width={200} style={{ marginBottom: '20px' }} />
            <div className="book-detail-skeleton">
              <Skeleton height={500} width={350} />
              <div className="book-info-skeleton">
                <Skeleton height={40} width={400} />
                <Skeleton height={20} width={300} />
                <Skeleton height={60} width="100%" />
                <Skeleton height={200} width="100%" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <div className="max-width">
          <div className="book-detail-error">
            <div className="error-content">
              <h1>📚 Book Not Found</h1>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={() => router.back()} className="btn secondary-btn">
                  ← Go Back
                </button>
                <Link href="/books" className="btn primary-btn">
                  Browse All Books
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      padding: '40px 0'
    }}>
      <style jsx>{`
        @media (max-width: 768px) {
          .book-detail-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      <div className='max-width' style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
        
        {/* Book Detail Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Main Content */}
          <div className="book-detail-grid" style={{
            display: 'grid',
            gridTemplateColumns: '400px 1fr',
            gap: '0'
          }}>
            {/* Left: Book Cover */}
            <div style={{
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e2e8f0 100%)',
              padding: '48px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {book.book_type && (
                <div style={{
                  position: 'absolute',
                  top: '24px',
                  right: '24px',
                  background: '#6B46C1',
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {book.book_type}
                </div>
              )}
              
              <div style={{
                width: '100%',
                maxWidth: '300px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                marginBottom: '24px'
              }}>
                {book.bookimage?.url ? (
                  <Image
                    src={book.bookimage.url}
                    alt={book.bookimage.title || book.title}
                    width={300}
                    height={450}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                    priority
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    paddingTop: '150%',
                    background: '#cbd5e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px'
                  }}>
                    📖
                  </div>
                )}
              </div>
            </div>

            {/* Right: Book Information */}
            <div style={{
              padding: '48px'
            }}>
              {/* Title & Author */}
              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '12px',
                lineHeight: '1.2'
              }}>
                {book.title}
              </h1>
              
              <p style={{
                fontSize: '18px',
                color: '#718096',
                marginBottom: '32px',
                fontStyle: 'italic'
              }}>
                by <span style={{ color: '#4a5568', fontWeight: '600' }}>{book.author || 'Unknown Author'}</span>
              </p>

              {/* Book Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '24px',
                marginBottom: '32px',
                padding: '24px',
                background: '#f8f9fa',
                borderRadius: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#718096',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}>PRICE:</div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#6B46C1'
                  }}>₹{book.price || 'N/A'}</div>
                </div>

                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#718096',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                    fontWeight: '600'
                  }}>PAGES:</div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>{book.number_of_pages || 'Unknown'}</div>
                </div>

                {book.publication_year && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#718096',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>PUBLISHED:</div>
                    <div style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#2d3748'
                    }}>{book.publication_year}</div>
                  </div>
                )}

                {book.isbn && (
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#718096',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                      fontWeight: '600'
                    }}>ISBN:</div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#4a5568'
                    }}>{book.isbn === 'Not available' ? book.isbn : book.isbn}</div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#4a5568',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>Tags:</h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {book.tags.map((tag, index) => (
                      <span key={index} style={{
                        padding: '6px 14px',
                        background: 'linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)',
                        color: '#00695c',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !book.price}
                  style={{
                    flex: '1',
                    minWidth: '200px',
                    padding: '18px 32px',
                    background: isAddingToCart ? '#9F7AEA' : '#6B46C1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: isAddingToCart || !book.price ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 24px rgba(107, 70, 193, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: isAddingToCart || !book.price ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isAddingToCart && book.price) {
                      e.currentTarget.style.background = '#553C9A';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(107, 70, 193, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#6B46C1';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(107, 70, 193, 0.3)';
                  }}
                >
                  {isAddingToCart ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      🛒 Add to Cart - ₹{book.price}
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => router.back()}
                  style={{
                    padding: '18px 32px',
                    background: '#f7fafc',
                    color: '#2d3748',
                    border: '2px solid #e2e8f0',
                    borderRadius: '50px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0';
                    e.currentTarget.style.borderColor = '#cbd5e0';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f7fafc';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  ← Back to Books
                </button>
              </div>
            </div>
          </div>

          {/* Book Summary Section */}
          {(book.book_summary || book.book_description) && (
            <div style={{
              padding: '48px',
              borderTop: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '20px',
                borderBottom: '3px solid #6B46C1',
                display: 'inline-block',
                paddingBottom: '8px'
              }}>Book Summary</h2>
              <div style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#4a5568'
              }}>
                {book.book_summary ? parse(book.book_summary) : parse(book.book_description!)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
