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
            
            // Send Lytics book_viewed event
            try {
              if (typeof window !== 'undefined' && window.jstag) {
                const lyticsEventData = {
                  event: 'book_viewed',
                  book_id: data.book.uid,
                  book_title: data.book.title,
                  book_author: data.book.author,
                  book_genre: data.book.book_type,
                  book_price: data.book.price,
                  book_pages: data.book.number_of_pages,
                  book_tags: data.book.tags,
                  page_type: 'book_detail',
                  timestamp: new Date().toISOString(),
                  page_url: window.location.href,
                  page_title: document.title
                };
                
                // Send event to Lytics default stream
                window.jstag.send(lyticsEventData);
                console.log('📊 Lytics book_viewed event sent from detail page:', lyticsEventData);
              } else {
                console.warn('⚠️ Lytics jstag not available on detail page');
              }
            } catch (error) {
              console.error('❌ Error sending Lytics event from detail page:', error);
            }
            
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
    <div className="book-detail-page">
      <div className="max-width">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">›</span>
          <Link href="/books" className="breadcrumb-link">Books</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{book.title}</span>
        </div>

        {/* Book Detail Content */}
        <div className="book-detail-content">
          {/* Book Image and Basic Info */}
          <div className="book-detail-main">
            <div className="book-image-section">
              <div className="book-image-container">
                {book.bookimage?.url ? (
                  <Image
                    src={book.bookimage.url}
                    alt={book.bookimage.title || book.title}
                    width={400}
                    height={600}
                    className="book-detail-image"
                    priority
                  />
                ) : (
                  <div className="book-image-placeholder large">
                    📖
                  </div>
                )}
                {book.book_type && (
                  <div className="book-type-badge large">
                    {book.book_type}
                  </div>
                )}
              </div>
            </div>

            <div className="book-info-section">
              <div className="book-header">
                <h1 className="book-title" {...book.$?.title}>
                  {book.title}
                </h1>
                <p className="book-author" {...book.$?.author}>
                  by <strong>{book.author || 'Unknown Author'}</strong>
                </p>
                
                {/* Rating and Reviews */}
                {book.rating && (
                  <div className="book-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(book.rating!) ? 'filled' : ''}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="rating-text">
                      {book.rating}/5 ({book.reviews_count || 0} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="book-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Price:</span>
                  <span className="detail-value price-large">₹{book.price || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Pages:</span>
                  <span className="detail-value">{book.number_of_pages || 'N/A'}</span>
                </div>
                {book.publication_year && (
                  <div className="detail-item">
                    <span className="detail-label">Published:</span>
                    <span className="detail-value">{book.publication_year}</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="detail-item">
                    <span className="detail-label">ISBN:</span>
                    <span className="detail-value">{book.isbn}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {book.tags && book.tags.length > 0 && (
                <div className="book-tags-section">
                  <h3>Tags:</h3>
                  <div className="book-tags">
                    {book.tags.map((tag, index) => (
                      <span key={index} className="book-tag large">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Features */}
              {book.key_features && book.key_features.length > 0 && (
                <div className="key-features-section">
                  <h3>Key Features:</h3>
                  <ul className="key-features-list">
                    {book.key_features.map((feature, index) => (
                      <li key={index} className="key-feature">
                        ✓ {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="book-actions-section">
                <button 
                  className={`add-to-cart-btn large ${isAddingToCart ? 'adding' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || !book.price}
                >
                  {isAddingToCart ? (
                    <>
                      <span className="loading-spinner-small"></span>
                      Adding to Cart...
                    </>
                  ) : !book.price ? (
                    <>
                      <span className="cart-icon-small">❌</span>
                      Price Unavailable
                    </>
                  ) : (
                    <>
                      <span className="cart-icon-small">🛒</span>
                      Add to Cart - ₹{book.price}
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => router.back()} 
                  className="btn secondary-btn large"
                >
                  ← Back to Books
                </button>
              </div>
            </div>
          </div>

          {/* Extended Content */}
          <div className="book-extended-content">
            {/* Show book summary if available (from BookInfoExtended) */}
            {book.book_summary && (
              <div className="content-section">
                <h2>Book Summary</h2>
                <div className="book-summary-extended" {...book.$?.book_summary}>
                  {parse(book.book_summary)}
                </div>
              </div>
            )}

            {/* If no extended summary but has regular description, show it */}
            {!book.book_summary && book.book_description && (
              <div className="content-section">
                <h2>About This Book</h2>
                <div className="book-description-extended" {...book.$?.book_description}>
                  {parse(book.book_description)}
                </div>
              </div>
            )}

            {/* If neither summary nor description available */}
            {!book.book_summary && !book.book_description && (
              <div className="content-section">
                <h2>About This Book</h2>
                <div className="book-description-extended">
                  <p>Detailed information about "{book.title}" is not available at the moment.</p>
                  <p>This book is available for purchase. Please check back later for more details.</p>
                </div>
              </div>
            )}

            {/* Additional info section for regular books */}
            <div className="content-section">
              <h2>Book Information</h2>
              <div className="book-info-grid">
                <div className="info-item">
                  <strong>Title:</strong> {book.title}
                </div>
                <div className="info-item">
                  <strong>Author:</strong> {book.author || 'Unknown Author'}
                </div>
                <div className="info-item">
                  <strong>Genre:</strong> {book.book_type || 'Not specified'}
                </div>
                {book.price && book.price > 0 && (
                  <div className="info-item">
                    <strong>Price:</strong> ₹{book.price}
                  </div>
                )}
                {book.number_of_pages && book.number_of_pages > 0 && (
                  <div className="info-item">
                    <strong>Pages:</strong> {book.number_of_pages}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
