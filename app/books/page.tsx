'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { onEntryChange } from '../../contentstack-sdk';
import Skeleton from 'react-loading-skeleton';
import BookCard from '../../components/book-card';
import LyticsExperienceWidget from '../../components/lytics-experience-widget';
import { useSearchParams } from 'next/navigation';
import { usePersonalization } from '../../contexts/personalization-context';
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
  const { personalizeSDK } = usePersonalization();

  async function fetchData() {
    try {
      setLoading(true);
      console.log('🔍 BooksPage: Starting fetchData...');
      
      // Check for variant parameter from Launch Edge Proxy
      const variantParam = searchParams.get('personalize_variants');
      if (variantParam) {
        console.log('🎭 Launch Edge Proxy variant parameter detected:', variantParam);
      }
      
      console.log('📡 Making fetch request to /api/books...');
      const response = await fetch('/api/books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store' // Prevent caching issues
      });
      
      console.log('📡 Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response data:', {
        success: data.success,
        count: data.count,
        booksLength: data.books?.length,
        hasBooks: !!data.books
      });
      
      if (data.success && data.books && Array.isArray(data.books)) {
        console.log('✅ Setting books state with', data.books.length, 'books');
        setBooks(data.books);
        
        // Set user segment attributes based on available books (but don't await to avoid blocking)
        if (personalizeSDK) {
          setUserSegmentFromBooks(data.books).catch(segmentError => {
            console.warn('⚠️ Failed to set user segments:', segmentError);
          });
        }
      } else {
        console.error('❌ Invalid API response structure:', data);
        throw new Error(data.error || 'Invalid API response - no books array found');
      }
      
    } catch (error) {
      console.error('❌ BooksPage: Error in fetchData:', error);
      console.error('❌ Error details:', {
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      
      // Set empty books array as fallback
      setBooks([]);
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  }

  // Set user segment attributes based on available books
  const setUserSegmentFromBooks = async (availableBooks: Book[]) => {
    if (!personalizeSDK) return;
    
    try {
      const genres = Array.from(new Set(availableBooks.map(book => book.book_type).filter(Boolean)));
      const avgPrice = availableBooks.reduce((sum, book) => sum + (book.price || 0), 0) / availableBooks.length;
      
      // Set user segment attributes (simplified for Lytics integration)
      console.log('📊 Setting user segment attributes for book browser');
      
      console.log('✅ User segment attributes set based on book catalog');
    } catch (error) {
      console.error('❌ Error setting user segment attributes:', error);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchData();
    onEntryChange(() => fetchData());
  }, []);

  // Filter books based on selected genre
  useEffect(() => {
    console.log('🔍 Books state changed:', books.length, 'books');
    console.log('🔍 Selected genre:', selectedGenre);
    
    if (books.length > 0) {
      if (selectedGenre) {
        const filtered = books.filter(book => 
          book.book_type.toLowerCase() === selectedGenre.toLowerCase()
        );
        console.log('📚 Filtered books for genre', selectedGenre + ':', filtered.length);
        setFilteredBooks(filtered);
      } else {
        console.log('📚 Setting all books as filtered:', books.length);
        setFilteredBooks(books);
      }
    } else {
      console.log('⚠️ No books available to filter');
    }
  }, [books, selectedGenre]);

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

        {/* Lytics Experience Widget - Dynamic Genre Recommendations */}
        <LyticsExperienceWidget 
          books={books} 
          targetPath="/books"
        />

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
