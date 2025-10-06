import React, { useState, useEffect } from 'react';
import { getBooksRes } from '../helper';
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
      const booksRes = await getBooksRes();
      setBooks(booksRes.slice(0, 2)); // Show only first 2 books as featured
      setLoading(false);
    } catch (error) {
      console.error('Error fetching featured books:', error);
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className='featured-books-section'>
      <div className='max-width'>
        <div className='section-header'>
          <h2>Featured in Our Collection</h2>
          <p>Hand-picked recommendations from our curated library</p>
        </div>
        
        {loading ? (
          <div className='featured-books-grid'>
            <div className='featured-book-skeleton'>
              <Skeleton height={400} />
            </div>
            <div className='featured-book-skeleton'>
              <Skeleton height={400} />
            </div>
          </div>
        ) : books.length > 0 ? (
          <>
            <div className='featured-books-grid'>
              {books.map((book) => (
                <div key={book.uid} className='featured-book-wrapper'>
                  <BookCard book={book} />
                  <div className='featured-badge'>⭐ Featured</div>
                </div>
              ))}
            </div>
            <div className='view-all-books'>
              <Link href='/books' className='btn primary-btn'>
                Explore Full Collection
              </Link>
            </div>
          </>
        ) : (
          <div className='no-featured-books'>
            <h3>Coming Soon!</h3>
            <p>We&apos;re working on adding more amazing books to our collection.</p>
            <Link href='/books' className='btn secondary-btn'>
              View Available Books
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
