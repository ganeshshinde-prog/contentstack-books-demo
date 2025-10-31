import React, { useState } from 'react';
import parse from 'html-react-parser';
import { useCart } from '../contexts/cart-context';
import { usePersonalization } from '../contexts/personalization-context';
import LyticsAnalytics from '../lib/lytics-analytics';

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

interface BookCardProps {
  book: Book;
  isNewArrival?: boolean;
}

export default function BookCard({ book, isNewArrival = false }: BookCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const { personalizeSDK, setPersonalizeAttributes, triggerPersonalizeEvent, trackBehavior } = usePersonalization();

  const bookLink = isNewArrival ? `/newbook/${book.uid}` : `/books/${book.uid}`;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    const originalPrice = Math.round(book.price * 1.25);
    
    addToCart({
      title: book.title,
      author: book.author,
      price: book.price,
      originalPrice: originalPrice,
      image: book.bookimage.url,
      isbn: book.uid,
      inStock: true,
    });
    
    // Track add to cart with Lytics
    LyticsAnalytics.trackAddToCart({
      book_id: book.uid,
      book_title: book.title,
      book_author: book.author,
      book_genre: book.book_type,
      book_price: book.price,
      quantity: 1
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAdding(false);
  };

  const handleBookClick = () => {
    console.group('📚 BOOK CLICK - Personalization + Lytics');
    console.log('Book:', book.title, 'Genre:', book.book_type);
    
          // Track behavior for Lytics personalization (genre tracking)
          trackBehavior('view_book', {
            bookId: book.uid,
            genre: book.book_type,
            title: book.title,
            author: book.author,
            price: book.price
          });

          // Dispatch custom event for any genre book to update recommendations
          console.log(`🎯 ${book.book_type} book clicked - dispatching custom event for recommendations update`);
          const genreBookEvent = new CustomEvent('genreBookClicked', {
            detail: {
              bookId: book.uid,
              title: book.title,
              genre: book.book_type
            }
          });
          window.dispatchEvent(genreBookEvent);

          // Also dispatch specific genre event for backward compatibility
          if (book.book_type === 'War') {
            const warBookEvent = new CustomEvent('warBookClicked', {
              detail: {
                bookId: book.uid,
                title: book.title,
                genre: book.book_type
              }
            });
            window.dispatchEvent(warBookEvent);
          }
    
    // Send Lytics book_viewed event
    LyticsAnalytics.trackBookView({
      book_id: book.uid,
      book_title: book.title,
      book_author: book.author,
      book_genre: book.book_type,
      book_price: book.price,
      book_pages: book.number_of_pages,
      book_tags: book.tags,
      is_new_arrival: isNewArrival,
      page_type: 'book_card'
    });
    
    // Contentstack personalization - send only book_genre
    if (personalizeSDK && book.book_type) {
      console.log('✅ Sending book_genre attribute:', book.book_type);
      
      // Set book_genre attribute and trigger event with proper async handling
      const sendPersonalizationData = async () => {
        try {
          // Send both requests in parallel with timeout protection
          await Promise.all([
            setPersonalizeAttributes({
              book_genre: book.book_type
            }),
            triggerPersonalizeEvent('book_viewed', {
              book_id: book.uid,
              book_title: book.title,
              book_genre: book.book_type,
              book_author: book.author,
              book_price: book.price,
              timestamp: new Date().toISOString(),
            })
          ]);
          
          console.log('✅ Personalization complete - both attribute and event sent');
          return true;
        } catch (error) {
          console.error('❌ Personalization failed:', error);
          
                // Fallback: Use sendBeacon for critical tracking if available
                if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
            try {
              const fallbackData = {
                event: 'book_viewed',
                book_genre: book.book_type,
                book_id: book.uid,
                timestamp: new Date().toISOString()
              };
              
              // Note: This would need a server endpoint to handle beacon data
              console.log('📡 Attempting fallback with sendBeacon:', fallbackData);
            } catch (beaconError) {
              console.error('❌ Beacon fallback also failed:', beaconError);
            }
          }
          
          return false;
        }
      };
      
      // Execute personalization and navigate
      sendPersonalizationData().finally(() => {
        // Navigate after a small delay regardless of success/failure
        setTimeout(() => {
          window.location.href = bookLink;
        }, 150); // Slightly longer delay to ensure completion
      });
      
    } else {
      console.warn('⚠️ Personalize SDK not available or book type missing');
      console.warn('   - personalizeSDK:', !!personalizeSDK);
      console.warn('   - book.book_type:', book.book_type);
      
      console.groupEnd();
      
      // Navigate immediately if no personalization
      window.location.href = bookLink;
    }
  };

  return (
    <div 
      className='book-card' 
      {...book.$?.title}
      onClick={handleBookClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="book-card-content">
        <div className='book-image-container'>
          {book.bookimage?.url ? (
            <img
              src={book.bookimage.url}
              alt={book.bookimage.title || book.title}
              className='book-image'
              {...book.$?.bookimage?.url}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                console.warn(`Failed to load image for book: ${book.title}`);
              }}
            />
          ) : (
            <div className='book-image-placeholder'>
              📖
            </div>
          )}
          {book.book_type && (
            <div className='book-type-badge'>
              {isNewArrival ? '🆕 ' : ''}{book.book_type}
            </div>
          )}
        </div>
        
        <div className='book-content'>
          <h3 className='book-title' {...book.$?.title}>
            {book.title || 'Untitled'}
          </h3>
          
          <p className='book-author' {...book.$?.author}>
            by {book.author || 'Unknown Author'}
          </p>
          
          <div className='book-description' {...book.$?.book_description}>
            {book.book_description ? parse(book.book_description) : 'No description available.'}
          </div>
          
          <div className='book-details'>
            <div className='book-pages'>
              <span className='detail-label'>Pages:</span>
              <span className='detail-value' {...book.$?.number_of_pages}>
                {book.number_of_pages || 'N/A'}
              </span>
            </div>
            
            <div className='book-price'>
              <span className='current-price' {...book.$?.price}>
                ₹{book.price || 'N/A'}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          className={`add-to-cart-btn ${isAdding ? 'adding' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAddToCart();
          }}
          disabled={isAdding || !book.price}
        >
          {isAdding ? (
            <>
              <span className='loading-spinner-small'></span>
              Adding...
            </>
          ) : !book.price ? (
            <>
              <span className='cart-icon-small'>❌</span>
              Price Unavailable
            </>
          ) : (
            <>
              <span className='cart-icon-small'>🛒</span>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
