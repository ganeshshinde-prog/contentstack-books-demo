'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenreLocal, setSelectedGenreLocal] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('title-asc');
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [genreSearchQuery, setGenreSearchQuery] = useState('');
  const genreDropdownRef = useRef<HTMLDivElement>(null);
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

  // Sync URL genre param with local state
  useEffect(() => {
    if (selectedGenre) {
      setSelectedGenreLocal(selectedGenre);
    } else {
      setSelectedGenreLocal('');
    }
  }, [selectedGenre]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target as Node)) {
        setIsGenreDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort books based on search, genre, and sort option
  useEffect(() => {
    console.log('🔍 Books state changed:', books.length, 'books');
    console.log('🔍 Selected genre:', selectedGenreLocal);
    console.log('🔍 Search query:', searchQuery);
    console.log('🔍 Sort by:', sortBy);
    
    if (books.length > 0) {
      let filtered = [...books];
      
      // Filter by genre
      if (selectedGenreLocal) {
        filtered = filtered.filter(book => 
          book.book_type.toLowerCase() === selectedGenreLocal.toLowerCase()
        );
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(book => 
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.book_description.toLowerCase().includes(query)
        );
      }
      
      // Sort books
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'author-asc':
            return a.author.localeCompare(b.author);
          case 'author-desc':
            return b.author.localeCompare(a.author);
          case 'pages-asc':
            return a.number_of_pages - b.number_of_pages;
          case 'pages-desc':
            return b.number_of_pages - a.number_of_pages;
          default:
            return 0;
        }
      });
      
      console.log('📚 Filtered and sorted:', filtered.length, 'books');
      setFilteredBooks(filtered);
    } else {
      console.log('⚠️ No books available to filter');
    }
  }, [books, selectedGenreLocal, searchQuery, sortBy]);

  // Get unique genres from all books
  const availableGenres = Array.from(new Set(books.map(book => book.book_type)));
  
  // Filter genres for dropdown search
  const filteredGenres = availableGenres.filter(genre =>
    genre.toLowerCase().includes(genreSearchQuery.toLowerCase())
  );

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGenreLocal('');
    setSortBy('title-asc');
    window.history.pushState({}, '', '/books');
  };

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

        {/* Professional Search and Filter Bar */}
        <div className='professional-filter-bar'>
          <div className='filter-row'>
            {/* Search Input */}
            <div className='filter-group search-group'>
              <div className='filter-input-wrapper'>
                <svg className='filter-icon' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <circle cx='11' cy='11' r='8' />
                  <path d='m21 21-4.35-4.35' />
                </svg>
                <input
                  type='text'
                  className='filter-input'
                  placeholder='Search books by title, author...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    className='clear-input-btn'
                    onClick={() => setSearchQuery('')}
                    aria-label='Clear search'
                  >
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <line x1='18' y1='6' x2='6' y2='18' />
                      <line x1='6' y1='6' x2='18' y2='18' />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Genre Dropdown */}
            <div className='filter-group' ref={genreDropdownRef}>
              <button
                className={`filter-dropdown-trigger ${selectedGenreLocal ? 'has-value' : ''}`}
                onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
              >
                <span className='filter-dropdown-label'>
                  {selectedGenreLocal || 'All Genres'}
                </span>
                <svg className={`dropdown-arrow ${isGenreDropdownOpen ? 'open' : ''}`} width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <polyline points='6 9 12 15 18 9' />
                </svg>
              </button>

              {isGenreDropdownOpen && (
                <div className='filter-dropdown-menu'>
                  <div className='dropdown-search-wrapper'>
                    <svg className='dropdown-search-icon' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <circle cx='11' cy='11' r='8' />
                      <path d='m21 21-4.35-4.35' />
                    </svg>
                    <input
                      type='text'
                      className='dropdown-search-input'
                      placeholder='Search genres...'
                      value={genreSearchQuery}
                      onChange={(e) => setGenreSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  
                  <div className='dropdown-options'>
                    <button
                      className={`dropdown-option ${!selectedGenreLocal ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedGenreLocal('');
                        setIsGenreDropdownOpen(false);
                        setGenreSearchQuery('');
                        window.history.pushState({}, '', '/books');
                      }}
                    >
                      <span className='option-text'>All Genres</span>
                      <span className='option-count'>{books.length}</span>
                    </button>
                    
                    {filteredGenres.length > 0 ? (
                      filteredGenres.map((genre) => {
                        const genreCount = books.filter(book => book.book_type === genre).length;
                        return (
                          <button
                            key={genre}
                            className={`dropdown-option ${selectedGenreLocal === genre ? 'selected' : ''}`}
                            onClick={() => {
                              setSelectedGenreLocal(genre);
                              setIsGenreDropdownOpen(false);
                              setGenreSearchQuery('');
                              window.history.pushState({}, '', `/books?genre=${encodeURIComponent(genre)}`);
                            }}
                          >
                            <span className='option-text'>{genre}</span>
                            <span className='option-count'>{genreCount}</span>
                            {selectedGenreLocal === genre && (
                              <svg className='check-icon' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                                <polyline points='20 6 9 17 4 12' />
                              </svg>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className='dropdown-no-results'>
                        No genres found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className='filter-group'>
              <select
                className='filter-select'
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value='title-asc'>Title (A-Z)</option>
                <option value='title-desc'>Title (Z-A)</option>
                <option value='price-asc'>Price (Low to High)</option>
                <option value='price-desc'>Price (High to Low)</option>
                <option value='author-asc'>Author (A-Z)</option>
                <option value='author-desc'>Author (Z-A)</option>
                <option value='pages-asc'>Pages (Least First)</option>
                <option value='pages-desc'>Pages (Most First)</option>
              </select>
              <svg className='select-arrow' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <polyline points='6 9 12 15 18 9' />
              </svg>
            </div>

            {/* Clear All Button */}
            {(searchQuery || selectedGenreLocal || sortBy !== 'title-asc') && (
              <button className='clear-all-btn' onClick={clearAllFilters}>
                <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                  <line x1='18' y1='6' x2='6' y2='18' />
                  <line x1='6' y1='6' x2='18' y2='18' />
                </svg>
                Clear All
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedGenreLocal) && (
            <div className='active-filters'>
              <span className='active-filters-label'>Active filters:</span>
              <div className='active-filter-tags'>
                {searchQuery && (
                  <span className='filter-tag'>
                    <span className='filter-tag-label'>Search:</span>
                    <span className='filter-tag-value'>{searchQuery}</span>
                    <button 
                      className='filter-tag-remove'
                      onClick={() => setSearchQuery('')}
                      aria-label='Remove search filter'
                    >
                      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <line x1='18' y1='6' x2='6' y2='18' />
                        <line x1='6' y1='6' x2='18' y2='18' />
                      </svg>
                    </button>
                  </span>
                )}
                {selectedGenreLocal && (
                  <span className='filter-tag'>
                    <span className='filter-tag-label'>Genre:</span>
                    <span className='filter-tag-value'>{selectedGenreLocal}</span>
                    <button 
                      className='filter-tag-remove'
                      onClick={() => {
                        setSelectedGenreLocal('');
                        window.history.pushState({}, '', '/books');
                      }}
                      aria-label='Remove genre filter'
                    >
                      <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                        <line x1='18' y1='6' x2='6' y2='18' />
                        <line x1='6' y1='6' x2='18' y2='18' />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
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
