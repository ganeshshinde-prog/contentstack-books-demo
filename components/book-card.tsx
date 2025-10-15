import React, { useState } from 'react';
import Link from 'next/link';
import parse from 'html-react-parser';
import { useCart } from '../contexts/cart-context';
import { usePersonalize, BookPersonalizationUtils } from './context/PersonalizeContext'; // New Launch-compatible hook
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
  isNewArrival?: boolean; // New prop to indicate if this is from new arrivals
}

export default function BookCard({ book, isNewArrival = false }: BookCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const personalizeSDK = usePersonalize(); // New Launch-compatible hook

  // Determine the correct link based on whether it's a new arrival
  const bookLink = isNewArrival ? `/newbook/${book.uid}` : `/books/${book.uid}`;

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Calculate original price (assuming 20-30% discount for demo)
    const originalPrice = Math.round(book.price * 1.25);
    
    addToCart({
      title: book.title,
      author: book.author,
      price: book.price,
      originalPrice: originalPrice,
      image: book.bookimage.url,
      isbn: book.uid, // Using uid as ISBN for demo
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
    
    // Show adding state briefly
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAdding(false);
  };

  // Handle book click with Launch-compatible personalization + Lytics tracking
  const handleBookClick = async () => {
    console.group('📚 BOOK CLICK - Launch Personalization + Lytics');
    console.log('Book:', book.title, 'Genre:', book.book_type);
    
    // Send Lytics book_viewed event using utility
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
    
    // Continue with existing Contentstack personalization
    if (personalizeSDK && book.book_type) {
      // Set book genre attributes using Launch-compatible approach
      await BookPersonalizationUtils.setBookGenreAttributes(
        personalizeSDK, 
        book.book_type, 
        book.uid
      );
      
      // Trigger book view event
      await BookPersonalizationUtils.triggerBookEvent(personalizeSDK, 'bookViewed', {
        book_id: book.uid,
        book_title: book.title,
        book_genre: book.book_type,
        book_author: book.author,
        book_price: book.price,
        timestamp: new Date().toISOString(),
      });
      
      console.log('✅ Launch personalization attributes and events set');
    } else {
      console.warn('⚠️ Personalize SDK not available or book type missing');
    }
    
    console.groupEnd();
  };
  return (
    <div className='book-card' {...book.$?.title}>
      {/* Clickable area for book details */}
      <Link href={bookLink} className="book-card-link" onClick={handleBookClick}>
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
              <span className='detail-label'>Price:</span>
              <span className='detail-value price' {...book.$?.price}>
                {book.price ? `₹${book.price}` : 'Price not available'}
              </span>
            </div>
          </div>
          
          {book.tags && Array.isArray(book.tags) && book.tags.length > 0 && (
            <div className='book-tags'>
              {book.tags.map((tag, index) => (
                <span key={index} className='book-tag'>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>

      {/* Add to Cart Button - Outside the link to prevent navigation */}
      <div className='book-actions'>
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
