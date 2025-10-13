'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import BookCard from '@/components/book-card';
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

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Searching for:', searchQuery);
      
      // Search both regular books and new arrivals
      const [booksResponse, newArrivalsResponse] = await Promise.all([
        fetch('/api/books'),
        fetch('/api/new-arrivals')
      ]);

      const booksData = await booksResponse.json();
      const newArrivalsData = await newArrivalsResponse.json();

      let allBooks: Book[] = [];
      
      if (booksData.success) {
        allBooks = [...allBooks, ...booksData.books];
      }
      
      if (newArrivalsData.success) {
        allBooks = [...allBooks, ...newArrivalsData.books];
      }

      // Filter books based on search query
      const filteredBooks = allBooks.filter(book => 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.book_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.tags && book.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );

      console.log('📚 Found', filteredBooks.length, 'books');
      setBooks(filteredBooks);
      setTotalResults(filteredBooks.length);
      
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="search-page-container">
        <div className="max-width">
          <div className="search-page-header">
            <h1>Search Books</h1>
            <p>Enter a search term to find books in our collection</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page-container">
      <div className="max-width">
        <div className="search-page-header">
          <h1>Search Results</h1>
          {!loading && !error && (
            <p>
              {totalResults > 0 
                ? `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`
              }
            </p>
          )}
        </div>

        {loading && (
          <div className="search-loading-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="search-book-skeleton">
                <Skeleton height={400} />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="search-error-message">
            <div className="error-content">
              <h3>❌ Search Error</h3>
              <p>{error}</p>
              <button onClick={() => performSearch(query)} className="btn primary-btn">
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <>
            <div className="search-filters">
              <div className="search-stats">
                <span>Showing {books.length} results</span>
              </div>
              
              <div className="search-actions">
                <Link href="/books" className="btn secondary-btn">
                  Browse All Books
                </Link>
              </div>
            </div>

            <div className="search-results-grid">
              {books.map((book) => (
                <div key={book.uid} className="search-book-wrapper">
                  <BookCard book={book} />
                  <div className="search-match-info">
                    {book.title.toLowerCase().includes(query.toLowerCase()) && (
                      <span className="match-type">Title match</span>
                    )}
                    {book.author.toLowerCase().includes(query.toLowerCase()) && (
                      <span className="match-type">Author match</span>
                    )}
                    {book.book_type.toLowerCase().includes(query.toLowerCase()) && (
                      <span className="match-type">Genre match</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="search-no-results">
            <div className="no-results-content">
              <div className="no-results-icon">🔍</div>
              <h3>No Books Found</h3>
              <p>We couldn't find any books matching "{query}"</p>
              
              <div className="search-suggestions">
                <h4>Try searching for:</h4>
                <ul>
                  <li>Book titles (e.g., "Harry Potter", "Gone with the Wind")</li>
                  <li>Author names (e.g., "J.K. Rowling", "Stephen King")</li>
                  <li>Genres (e.g., "Fantasy", "Romance", "Mystery")</li>
                  <li>Keywords or topics</li>
                </ul>
              </div>

              <div className="search-actions">
                <Link href="/books" className="btn primary-btn">
                  Browse All Books
                </Link>
                <Link href="/new_arrivals" className="btn secondary-btn">
                  New Arrivals
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="search-page-container">
        <div className="max-width">
          <div className="search-page-header">
            <h1>Search Results</h1>
            <p>Loading search results...</p>
          </div>
          <div className="search-loading-grid">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="search-book-skeleton">
                <Skeleton height={400} />
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResults />
    </Suspense>
  );
}
