'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { onEntryChange } from '../../../contentstack-sdk';
import { getNewBookExtendedRes } from '../../../helper';
import Skeleton from 'react-loading-skeleton';
import Link from 'next/link';
import Image from 'next/image';
import parse from 'html-react-parser';
import { useCart } from '../../../contexts/cart-context';
import { usePersonalization } from '../../../contexts/personalization-context';

interface ExtendedBook {
  uid: string;
  title: string;
  author: string;
  book_description: string;
  book_summary: string;
  book_type: string;
  price: number;
  number_of_pages: number;
  publication_year: string;
  isbn: string;
  bookimage: {
    url: string;
    title: string;
  };
  tags: string[];
  key_features: string[];
  $: any;
}

export default function NewBookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { trackBehavior } = usePersonalization();
  const [book, setBook] = useState<ExtendedBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const bookUid = params.uid as string;

  useEffect(() => {
    if (bookUid) {
      fetchBookDetails();
      onEntryChange(() => fetchBookDetails());
    }
  }, [bookUid]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔍 NEWBOOK PAGE: Fetching details for UID: ${bookUid}`);
      const bookData = await getNewBookExtendedRes(bookUid);
      
      if (!bookData) {
        setError('New book not found');
        console.error(`❌ NEWBOOK PAGE: No data found for UID: ${bookUid}`);
        return;
      }
      
      console.log(`✅ NEWBOOK PAGE: Loaded book:`, bookData.title);
      setBook(bookData);
      
      // Track book view for personalization and Lytics
      if (bookData.book_type) {
        // Send Lytics book_viewed event
        try {
          if (typeof window !== 'undefined' && window.jstag) {
            const lyticsEventData = {
              event: 'book_viewed',
              book_id: bookData.uid,
              book_title: bookData.title,
              book_author: bookData.author,
              book_genre: bookData.book_type,
              book_price: bookData.price,
              book_pages: bookData.number_of_pages,
              book_tags: bookData.tags,
              is_new_arrival: true,
              page_type: 'new_book_detail',
              timestamp: new Date().toISOString(),
              page_url: window.location.href,
              page_title: document.title
            };
            
            // Send event to Lytics default stream
            window.jstag.send(lyticsEventData);
            console.log('📊 Lytics book_viewed event sent from new book detail page:', lyticsEventData);
          } else {
            console.warn('⚠️ Lytics jstag not available on new book detail page');
          }
        } catch (error) {
          console.error('❌ Error sending Lytics event from new book detail page:', error);
        }
        
        trackBehavior('view_book', {
          bookId: bookData.uid,
          bookTitle: bookData.title,
          bookGenre: bookData.book_type,
          bookAuthor: bookData.author,
          bookPrice: bookData.price,
        });
      }
      
    } catch (err) {
      console.error('❌ NEWBOOK PAGE: Error fetching book details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;
    
    setIsAddingToCart(true);
    
    try {
      // Calculate original price (assuming 20-30% discount for demo)
      const originalPrice = Math.round(book.price * 1.25);
      
      addToCart({
        title: book.title,
        author: book.author,
        price: book.price,
        originalPrice: originalPrice,
        image: book.bookimage.url,
        isbn: book.isbn || book.uid,
        inStock: true,
      });
      
      // Track purchase intent for personalization
      trackBehavior('add_to_cart', {
        bookId: book.uid,
        bookTitle: book.title,
        bookGenre: book.book_type,
        bookPrice: book.price,
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
      <div className='book-detail-container'>
        <div className='max-width'>
          <div className='book-detail-loading'>
            <Skeleton height={600} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className='book-detail-container'>
        <div className='max-width'>
          <div className='book-not-found'>
            <div className='not-found-content'>
              <div className='not-found-icon'>📚</div>
              <h1>New Book Not Found</h1>
              <p>{error || 'The new book you are looking for could not be found.'}</p>
              <div className='not-found-actions'>
                <button onClick={() => router.back()} className='btn secondary-btn'>
                  ← Go Back
                </button>
                <Link href='/new_arrivals' className='btn primary-btn'>
                  Browse New Arrivals
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='book-detail-container'>
      <div className='max-width'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <Link href='/'>Home</Link>
          <span className='breadcrumb-separator'>›</span>
          <Link href='/new_arrivals'>New Arrivals</Link>
          <span className='breadcrumb-separator'>›</span>
          <span className='breadcrumb-current'>{book.title}</span>
        </div>

        <div className='book-detail-content'>
          {/* Book Image */}
          <div className='book-image-section'>
            <div className='book-image-container-large'>
              {book.bookimage?.url ? (
                <Image
                  src={book.bookimage.url}
                  alt={book.bookimage.title || book.title}
                  width={400}
                  height={600}
                  className='book-image-large'
                  priority
                  {...book.$?.bookimage?.url}
                />
              ) : (
                <div className='book-image-placeholder-large'>
                  📖
                </div>
              )}
              
              {book.book_type && (
                <div className='book-type-badge-large new-arrival-badge'>
                  🆕 New Arrival - {book.book_type}
                </div>
              )}
            </div>
          </div>

          {/* Book Details */}
          <div className='book-info-section'>
            <div className='book-header'>
              <h1 className='book-title-large' {...book.$?.title}>
                {book.title}
              </h1>
              
              <p className='book-author-large' {...book.$?.author}>
                by <span className='author-name'>{book.author}</span>
              </p>
              
              <div className='book-meta'>
                <div className='meta-item'>
                  <span className='meta-label'>Publication Year:</span>
                  <span className='meta-value' {...book.$?.publication_year}>
                    {book.publication_year}
                  </span>
                </div>
                
                <div className='meta-item'>
                  <span className='meta-label'>ISBN:</span>
                  <span className='meta-value' {...book.$?.isbn}>
                    {book.isbn}
                  </span>
                </div>
                
                <div className='meta-item'>
                  <span className='meta-label'>Pages:</span>
                  <span className='meta-value' {...book.$?.number_of_pages}>
                    {book.number_of_pages}
                  </span>
                </div>
              </div>
            </div>

            {/* Price and Actions */}
            <div className='book-pricing'>
              <div className='price-section'>
                <div className='current-price' {...book.$?.price}>
                  ₹{book.price}
                </div>
                <div className='original-price'>
                  ₹{Math.round(book.price * 1.25)}
                </div>
                <div className='discount-badge'>
                  20% OFF
                </div>
              </div>
              
              <button 
                className={`add-to-cart-btn-large ${isAddingToCart ? 'adding' : ''}`}
                onClick={handleAddToCart}
                disabled={isAddingToCart || !book.price}
              >
                {isAddingToCart ? (
                  <>
                    <span className='loading-spinner'></span>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <span className='cart-icon'>🛒</span>
                    Add to Cart - ₹{book.price}
                  </>
                )}
              </button>
            </div>

            {/* Book Description */}
            <div className='book-description-section'>
              <h3>Description</h3>
              <div className='book-description-content' {...book.$?.book_description}>
                {book.book_description ? parse(book.book_description) : 'No description available.'}
              </div>
            </div>

            {/* Book Summary */}
            {book.book_summary && (
              <div className='book-summary-section'>
                <h3>Summary</h3>
                <div className='book-summary-content' {...book.$?.book_summary}>
                  {parse(book.book_summary)}
                </div>
              </div>
            )}

            {/* Key Features */}
            {book.key_features && book.key_features.length > 0 && (
              <div className='book-features-section'>
                <h3>Key Features</h3>
                <ul className='book-features-list'>
                  {book.key_features.map((feature, index) => (
                    <li key={index} className='feature-item'>
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className='book-tags-section'>
                <h3>Tags</h3>
                <div className='book-tags-list'>
                  {book.tags.map((tag, index) => (
                    <span key={index} className='book-tag-large'>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className='book-navigation'>
              <button onClick={() => router.back()} className='btn secondary-btn'>
                ← Back to New Arrivals
              </button>
              <Link href='/new_arrivals' className='btn tertiary-btn'>
                Browse More New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
