'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { onEntryChange } from '../../contentstack-sdk';
import { getBooksRes } from '../../helper';
import Skeleton from 'react-loading-skeleton';
import BookCard from '../../components/book-card';
import { useSearchParams } from 'next/navigation';
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

function BooksContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get('genre');

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

  // Filter books based on selected genre
  useEffect(() => {
    if (books.length > 0) {
      if (selectedGenre) {
        const filtered = books.filter(book => 
          book.book_type.toLowerCase() === selectedGenre.toLowerCase()
        );
        setFilteredBooks(filtered);
      } else {
        setFilteredBooks(books);
      }
    }
  }, [books, selectedGenre]);

  useEffect(() => {
    fetchData();
    onEntryChange(() => fetchData());
  }, []);

  // Get unique genres from all books
  const availableGenres = Array.from(new Set(books.map(book => book.book_type)));

  return (
    <div className='books-container'>
      <div className='max-width'>
        <div className='books-header'>
          <h1>
            {selectedGenre 
              ? `${selectedGenre} Books` 
              : 'Our Book Collection'
            }
          </h1>
          <p>
            {selectedGenre 
              ? `Explore our ${selectedGenre.toLowerCase()} collection` 
              : 'Explore our carefully curated collection of books across various genres'
            }
          </p>
        </div>

        {/* Filter Controls */}
        <div className='filter-controls'>
          <div className='filter-buttons'>
            <Link 
              href='/books' 
              className={`filter-btn ${!selectedGenre ? 'active' : ''}`}
            >
              All Books ({books.length})
            </Link>
            {availableGenres.map((genre) => {
              const genreCount = books.filter(book => book.book_type === genre).length;
              return (
                <Link
                  key={genre}
                  href={`/books?genre=${encodeURIComponent(genre)}`}
                  className={`filter-btn ${selectedGenre === genre ? 'active' : ''}`}
                >
                  {genre} ({genreCount})
                </Link>
              );
            })}
          </div>
          
          {selectedGenre && (
            <div className='active-filter'>
              <span className='filter-label'>Showing:</span>
              <span className='filter-value'>{selectedGenre}</span>
              <Link href='/books' className='clear-filter'>
                ✕ Clear Filter
              </Link>
            </div>
          )}
        </div>

        {/* Results */}
        <div className='books-results'>
          {loading ? (
            <div className='books-grid'>
              {[...Array(6)].map((_, index) => (
                <div key={index} className='book-skeleton'>
                  <Skeleton height={400} />
                </div>
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <>
              <div className='results-count'>
                {selectedGenre 
                  ? `${filteredBooks.length} ${selectedGenre.toLowerCase()} ${filteredBooks.length === 1 ? 'book' : 'books'} found`
                  : `${filteredBooks.length} books in our collection`
                }
              </div>
              <div className='books-grid'>
                {filteredBooks.map((book) => (
                  <BookCard key={book.uid} book={book} />
                ))}
              </div>
            </>
          ) : selectedGenre ? (
            <div className='no-books'>
              <div className='no-books-icon'>📚</div>
              <h3>No {selectedGenre} Books Found</h3>
              <p>We don&apos;t have any {selectedGenre.toLowerCase()} books in our collection yet.</p>
              <div className='no-books-actions'>
                <Link href='/books' className='btn secondary-btn'>
                  View All Books
                </Link>
              </div>
            </div>
          ) : (
            <div className='no-books'>
              <h3>No books available at the moment</h3>
              <p>Please check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Books() {
  return (
    <Suspense fallback={
      <div className='books-container'>
        <div className='max-width'>
          <div className='books-header'>
            <h1>Our Book Collection</h1>
            <p>Loading books...</p>
          </div>
          <div className='books-results'>
            <div className='books-grid'>
              {[...Array(6)].map((_, index) => (
                <div key={index} className='book-skeleton'>
                  <Skeleton height={400} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <BooksContent />
    </Suspense>
  );
}
