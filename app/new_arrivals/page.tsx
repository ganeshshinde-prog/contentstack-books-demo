'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { onEntryChange } from '../../contentstack-sdk';
import { getNewArrivalsRes } from '../../helper';
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

function NewArrivalsContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const selectedGenre = searchParams.get('genre');

  async function fetchData() {
    try {
      console.log('🔍 NEW_ARRIVALS PAGE: Starting fetch from NewBookInfo content type...');
      const booksRes = await getNewArrivalsRes();
      console.log('📚 NEW_ARRIVALS PAGE: Received books:', booksRes.length, 'books from NewBookInfo');
      console.log('📦 NEW_ARRIVALS PAGE: Sample book data:', booksRes[0] ? {
        uid: booksRes[0].uid,
        title: booksRes[0].title,
        contentType: 'NewBookInfo'
      } : 'No books received');
      
      setBooks(booksRes);
      setLoading(false);
    } catch (error) {
      console.error('❌ NEW_ARRIVALS PAGE: Error fetching new arrivals:', error);
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
    <div className='new-arrivals-container'>
      <div className='max-width'>
        <div className='new-arrivals-header'>
          <div className='header-content'>
            <div className='header-badge'>
              <span className='badge-icon'>✨</span>
              <span className='badge-text'>Fresh & New</span>
            </div>
            <h1>
              {selectedGenre 
                ? `New ${selectedGenre} Arrivals` 
                : 'New Arrivals'
              }
            </h1>
            <p>
              {selectedGenre 
                ? `Discover the latest ${selectedGenre.toLowerCase()} books added to our collection` 
                : 'Discover the latest books added to our collection - fresh stories, new adventures, and exciting reads await!'
              }
            </p>
          </div>
          <div className='header-stats'>
            <div className='stat-item'>
              <span className='stat-number'>{books.length}</span>
              <span className='stat-label'>New Books</span>
            </div>
            <div className='stat-item'>
              <span className='stat-number'>{availableGenres.length}</span>
              <span className='stat-label'>Genres</span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className='filter-controls'>
          <div className='filter-buttons'>
            <Link 
              href='/new_arrivals' 
              className={`filter-btn ${!selectedGenre ? 'active' : ''}`}
            >
              All New Arrivals ({books.length})
            </Link>
            {availableGenres.map((genre) => {
              const genreCount = books.filter(book => book.book_type === genre).length;
              return (
                <Link
                  key={genre}
                  href={`/new_arrivals?genre=${encodeURIComponent(genre)}`}
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
              <span className='filter-value'>New {selectedGenre} Books</span>
              <Link href='/new_arrivals' className='clear-filter'>
                ✕ Clear Filter
              </Link>
            </div>
          )}
        </div>

        {/* Results */}
        <div className='new-arrivals-results'>
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
                  ? `${filteredBooks.length} new ${selectedGenre.toLowerCase()} ${filteredBooks.length === 1 ? 'book' : 'books'} available`
                  : `${filteredBooks.length} new ${filteredBooks.length === 1 ? 'arrival' : 'arrivals'} in our collection`
                }
              </div>
              <div className='books-grid'>
                {filteredBooks.map((book) => (
                  <div key={book.uid} className='new-arrival-book'>
                    <div className='new-badge'>NEW</div>
                    <BookCard book={book} isNewArrival={true} />
                  </div>
                ))}
              </div>
            </>
          ) : selectedGenre ? (
            <div className='no-books'>
              <div className='no-books-icon'>📚</div>
              <h3>No New {selectedGenre} Books</h3>
              <p>We don&apos;t have any new {selectedGenre.toLowerCase()} books at the moment.</p>
              <div className='no-books-actions'>
                <Link href='/new_arrivals' className='btn secondary-btn'>
                  View All New Arrivals
                </Link>
                <Link href='/books' className='btn primary-btn'>
                  Browse All Books
                </Link>
              </div>
            </div>
          ) : (
            <div className='no-books'>
              <div className='no-books-icon'>✨</div>
              <h3>No New Arrivals Yet</h3>
              <p>Check back soon for the latest additions to our collection!</p>
              <div className='no-books-actions'>
                <Link href='/books' className='btn primary-btn'>
                  Browse All Books
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className='new-arrivals-cta'>
          <div className='cta-content'>
            <h3>Stay Updated</h3>
            <p>Be the first to know when new books arrive in our collection</p>
            <div className='cta-buttons'>
              <Link href='/contact-us' className='btn primary-btn'>
                Get Notifications
              </Link>
              <Link href='/books' className='btn secondary-btn'>
                Browse All Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewArrivals() {
  return (
    <Suspense fallback={
      <div className='new-arrivals-container'>
        <div className='max-width'>
          <div className='new-arrivals-header'>
            <h1>New Arrivals</h1>
            <p>Loading new books...</p>
          </div>
          <div className='new-arrivals-results'>
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
      <NewArrivalsContent />
    </Suspense>
  );
}
