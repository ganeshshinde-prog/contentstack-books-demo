'use client';

import React, { useState, useEffect } from 'react';
import { getBooksRes } from '../helper';
import { onEntryChange } from '../contentstack-sdk';

interface Book {
  uid: string;
  title: string;
  author: string;
  book_type: string;
  bookimage: {
    url: string;
    title: string;
    $?: any;
  };
  $: any;
}

export default function ScrollingBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    try {
      const booksRes = await getBooksRes();
      setBooks(booksRes);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    onEntryChange(() => fetchData());
  }, []);

  if (loading) {
    return (
      <section className='scrolling-books-section'>
        <div className='max-width'>
          <div className='section-header'>
            <h2>Our Book Collection</h2>
            <p>Discover amazing books from our curated collection</p>
          </div>
          <div className='scrolling-container'>
            <div className='scrolling-track loading'>
              {[...Array(8)].map((_, index) => (
                <div key={index} className='book-scroll-item skeleton'>
                  <div className='book-cover-placeholder'></div>
                  <div className='book-info-placeholder'>
                    <div className='title-placeholder'></div>
                    <div className='author-placeholder'></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (books.length === 0) {
    return null;
  }

  // Duplicate books array to create seamless infinite scroll
  const duplicatedBooks = [...books, ...books, ...books];

  return (
    <section className='scrolling-books-section'>
      <div className='max-width'>
        <div className='section-header'>
          <h2>Our Book Collection</h2>
          <p>Discover amazing books from our curated collection</p>
        </div>
        <div className='scrolling-container'>
          <div className='scrolling-track'>
            {duplicatedBooks.map((book, index) => (
              <div key={`${book.uid}-${index}`} className='book-scroll-item' {...book.$?.title}>
                <div className='book-cover'>
                  <img
                    src={book.bookimage.url}
                    alt={book.bookimage.title}
                    {...book.bookimage.$?.url}
                  />
                  <div className='book-overlay'>
                    <div className='book-type-badge'>
                      {book.book_type}
                    </div>
                  </div>
                </div>
                <div className='book-info'>
                  <h4 className='book-title' {...book.$?.title}>
                    {book.title}
                  </h4>
                  <p className='book-author' {...book.$?.author}>
                    by {book.author}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
