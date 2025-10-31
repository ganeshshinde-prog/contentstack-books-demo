'use client';

import React from 'react';

export default function TestGenreDetection() {
  // Test books to verify genre detection logic
  const testBooks = [
    { title: 'Band of Brothers', author: 'Stephen E. Ambrose', expectedGenre: 'War' },
    { title: 'The Art of War', author: 'Sun Tzu', expectedGenre: 'War' },
    { title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', expectedGenre: 'Fantasy' },
    { title: 'Harry Potter and the Magic Stone', author: 'J.K. Rowling', expectedGenre: 'Fantasy' },
    { title: 'The Murder of Roger Ackroyd', author: 'Agatha Christie', expectedGenre: 'Mystery' },
    { title: 'Sherlock Holmes Complete Collection', author: 'Arthur Conan Doyle', expectedGenre: 'Mystery' },
    { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', expectedGenre: 'General' },
    { title: 'To Kill a Mockingbird', author: 'Harper Lee', expectedGenre: 'General' },
  ];

  // Genre detection logic (copied from checkout page)
  const detectGenre = (book: { title: string; author: string }) => {
    const titleLower = book.title?.toLowerCase() || '';
    const authorLower = book.author?.toLowerCase() || '';
    
    // Check for War books
    const isWarBook = titleLower.includes('war') || 
                     titleLower.includes('battle') ||
                     titleLower.includes('military') ||
                     titleLower.includes('brothers') ||
                     authorLower.includes('ambrose');
    
    if (isWarBook) return 'War';
    
    // Check for Fantasy books
    const isFantasyBook = titleLower.includes('fantasy') || 
                         titleLower.includes('magic') ||
                         titleLower.includes('dragon') ||
                         titleLower.includes('wizard') ||
                         titleLower.includes('potter') ||
                         titleLower.includes('rings');
    
    if (isFantasyBook) return 'Fantasy';
    
    // Check for Mystery books
    const isMysteryBook = titleLower.includes('mystery') || 
                         titleLower.includes('detective') ||
                         titleLower.includes('murder') ||
                         titleLower.includes('sherlock') ||
                         authorLower.includes('christie') ||
                         authorLower.includes('doyle');
    
    if (isMysteryBook) return 'Mystery';
    
    return 'General';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🧪 Genre Detection Test</h1>
      <p>This page tests the genre detection logic used in the checkout process.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Book Title</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'left' }}>Author</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>Expected</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>Detected</th>
              <th style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {testBooks.map((book, index) => {
              const detectedGenre = detectGenre(book);
              const isCorrect = detectedGenre === book.expectedGenre;
              
              return (
                <tr key={index}>
                  <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{book.title}</td>
                  <td style={{ padding: '1rem', border: '1px solid #ddd' }}>{book.author}</td>
                  <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      background: '#e9ecef',
                      fontSize: '0.875rem'
                    }}>
                      {book.expectedGenre}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px', 
                      background: isCorrect ? '#d4edda' : '#f8d7da',
                      color: isCorrect ? '#155724' : '#721c24',
                      fontSize: '0.875rem'
                    }}>
                      {detectedGenre}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    {isCorrect ? '✅' : '❌'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3>🔍 How to Test:</h3>
        <ol>
          <li>Go to <a href="/carts" style={{ color: '#007bff' }}>/carts</a></li>
          <li>Click "🗑️ Clear Cart" to remove any old items</li>
          <li>Click "⚔️ Add War Books" to add War genre books</li>
          <li>Proceed to checkout and complete the purchase</li>
          <li>Check Network tab for <code>book_genre: "War"</code> in the payload</li>
        </ol>
      </div>
    </div>
  );
}
