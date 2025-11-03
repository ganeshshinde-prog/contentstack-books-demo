'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LyticsAnalytics from '../lib/lytics-analytics';

interface Book {
  uid: string;
  title: string;
  author: string;
  book_type: string;
  price: number;
  bookimage?: {
    url: string;
    title: string;
  };
}

interface SearchResult {
  books: Book[];
  total: number;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Performing search for:', searchQuery);
      
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
        book.book_type.toLowerCase().includes(searchQuery.toLowerCase())
      );

      console.log('📚 Search results:', filteredBooks.length, 'books found');
      
      // Track search event with Lytics
      LyticsAnalytics.trackSearch({
        search_query: searchQuery,
        search_results_count: filteredBooks.length,
        search_category: 'books'
      });
      
      setResults(filteredBooks.slice(0, 8)); // Limit to 8 results
      setShowResults(true);
      
    } catch (err) {
      console.error('❌ Search error:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to search results page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowResults(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleResultClick = (book: Book) => {
    setShowResults(false);
    setQuery('');
    // Navigate to book detail page
    router.push(`/books/${book.uid}`);
  };

  return (
    <div className="search-container" ref={searchRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <div className="search-icon-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for books, authors, or genres..."
            className="search-input"
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
          />
          {query && (
            <button
              type="button"
              className="search-clear-button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
          {isLoading && (
            <div className="search-loading-spinner">
              <div className="spinner-ring"></div>
            </div>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="search-results-dropdown">
          {error && (
            <div className="search-error-message">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <>
              <div className="search-results-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <span>Found {results.length} book{results.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="search-results-list">
                {results.map((book, index) => (
                  <div
                    key={book.uid}
                    className="search-result-item"
                    onClick={() => handleResultClick(book)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="result-image">
                      {book.bookimage?.url ? (
                        <img src={book.bookimage.url} alt={book.title} />
                      ) : (
                        <div className="result-image-placeholder">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="result-content">
                      <h4 className="result-title">{book.title}</h4>
                      <p className="result-author">by {book.author}</p>
                      <div className="result-meta">
                        <span className="result-genre">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                            <line x1="7" y1="7" x2="7.01" y2="7"/>
                          </svg>
                          {book.book_type}
                        </span>
                        <span className="result-price">₹{book.price}</span>
                      </div>
                    </div>

                    <div className="result-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
              
              {query.trim() && (
                <div className="search-results-footer">
                  <Link 
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    className="view-all-results"
                    onClick={() => setShowResults(false)}
                  >
                    <span>View all results for "{query}"</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}

          {!isLoading && !error && results.length === 0 && query.trim().length >= 2 && (
            <div className="search-no-results-dropdown">
              <div className="no-results-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <h4>No books found</h4>
              <p>Try searching for a different title, author, or genre</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
