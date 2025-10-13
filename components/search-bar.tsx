'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
          <button type="submit" className="search-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="search-results">
          {isLoading && (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <span>Searching...</span>
            </div>
          )}
          
          {error && (
            <div className="search-error">
              <span>❌ {error}</span>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <>
              <div className="search-results-header">
                <span>Found {results.length} result{results.length !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="search-results-list">
                {results.map((book) => (
                  <div
                    key={book.uid}
                    className="search-result-item"
                    onClick={() => handleResultClick(book)}
                  >
                    <div className="result-image">
                      {book.bookimage?.url ? (
                        <img src={book.bookimage.url} alt={book.title} />
                      ) : (
                        <div className="result-image-placeholder">📖</div>
                      )}
                    </div>
                    
                    <div className="result-content">
                      <h4 className="result-title">{book.title}</h4>
                      <p className="result-author">by {book.author}</p>
                      <div className="result-meta">
                        <span className="result-genre">{book.book_type}</span>
                        <span className="result-price">₹{book.price}</span>
                      </div>
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
                    View all results for "{query}"
                  </Link>
                </div>
              )}
            </>
          )}

          {!isLoading && !error && results.length === 0 && query.trim().length >= 2 && (
            <div className="search-no-results">
              <div className="no-results-icon">🔍</div>
              <h4>No books found</h4>
              <p>Try searching for a different title, author, or genre</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
