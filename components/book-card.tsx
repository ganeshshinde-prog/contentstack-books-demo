import React from 'react';
import parse from 'html-react-parser';

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
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className='book-card' {...book.$?.title}>
      <div className='book-image-container'>
        <img
          src={book.bookimage.url}
          alt={book.bookimage.title}
          className='book-image'
          {...book.bookimage.$?.url}
        />
        <div className='book-type-badge'>
          {book.book_type}
        </div>
      </div>
      
      <div className='book-content'>
        <h3 className='book-title' {...book.$?.title}>
          {book.title}
        </h3>
        
        <p className='book-author' {...book.$?.author}>
          by {book.author}
        </p>
        
        <div className='book-description' {...book.$?.book_description}>
          {parse(book.book_description)}
        </div>
        
        <div className='book-details'>
          <div className='book-pages'>
            <span className='detail-label'>Pages:</span>
            <span className='detail-value' {...book.$?.number_of_pages}>
              {book.number_of_pages}
            </span>
          </div>
          
          <div className='book-price'>
            <span className='detail-label'>Price:</span>
            <span className='detail-value price' {...book.$?.price}>
              ₹{book.price}
            </span>
          </div>
        </div>
        
        {book.tags && book.tags.length > 0 && (
          <div className='book-tags'>
            {book.tags.map((tag, index) => (
              <span key={index} className='book-tag'>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
