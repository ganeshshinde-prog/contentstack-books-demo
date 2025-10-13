'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePersonalization } from '../../contexts/personalization-context';

export default function PreferencesPage() {
  const { userPreferences, updatePreferences, trackBehavior } = usePersonalization();
  const [preferences, setPreferences] = useState(userPreferences);
  const [saved, setSaved] = useState(false);

  const genres = [
    'Thrillers', 'Mystery', 'Fantasy', 'War', 'Romance', 'Science Fiction', 
    'Historical Fiction', 'Biography', 'Self-Help', 'Business', 'Horror',
    'Adventure', 'Crime', 'Drama', 'Non-Fiction', 'Philosophy', 'Poetry',
    'Young Adult', 'Kids', 'Health', 'Travel', 'Cooking', 'Art', 'Technology'
  ];

  const authors = [
    'Agatha Christie', 'Stephen King', 'J.K. Rowling', 'Dan Brown',
    'Paulo Coelho', 'James Clear', 'Malcolm Gladwell', 'Yuval Noah Harari',
    'Gillian Flynn', 'Tara Westover', 'Michelle Obama', 'Bill Bryson'
  ];

  const handleGenreToggle = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handleAuthorToggle = (author: string) => {
    setPreferences(prev => ({
      ...prev,
      preferredAuthors: prev.preferredAuthors.includes(author)
        ? prev.preferredAuthors.filter(a => a !== author)
        : [...prev.preferredAuthors, author]
    }));
  };

  const handleSave = () => {
    updatePreferences(preferences);
    setSaved(true);
    
    trackBehavior('update_preferences', {
      genres: preferences.favoriteGenres,
      authors: preferences.preferredAuthors,
      priceRange: preferences.priceRange,
      readingGoals: preferences.readingGoals,
    });

    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className='preferences-page'>
      <div className='max-width'>
        {/* Breadcrumb */}
        <div className='breadcrumb'>
          <Link href='/' className='breadcrumb-link'>Home</Link>
          <span className='breadcrumb-separator'>›</span>
          <span className='breadcrumb-current'>Reading Preferences</span>
        </div>

        <div className='preferences-container'>
          <div className='preferences-header'>
            <h1>📚 Personalize Your Experience</h1>
            <p>Tell us about your reading preferences to get better book recommendations</p>
          </div>

          <div className='preferences-form'>
            {/* Favorite Genres */}
            <section className='preference-section'>
              <h3>What genres do you enjoy?</h3>
              <p className='section-description'>Select all that apply to get personalized recommendations</p>
              <div className='genre-grid'>
                {genres.map(genre => (
                  <button
                    key={genre}
                    className={`genre-chip ${preferences.favoriteGenres.includes(genre) ? 'selected' : ''}`}
                    onClick={() => handleGenreToggle(genre)}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </section>

            {/* Preferred Authors */}
            <section className='preference-section'>
              <h3>Do you have favorite authors?</h3>
              <p className='section-description'>We'll recommend books by these authors and similar writers</p>
              <div className='author-grid'>
                {authors.map(author => (
                  <button
                    key={author}
                    className={`author-chip ${preferences.preferredAuthors.includes(author) ? 'selected' : ''}`}
                    onClick={() => handleAuthorToggle(author)}
                  >
                    {author}
                  </button>
                ))}
              </div>
            </section>

            {/* Reading Level */}
            <section className='preference-section'>
              <h3>What's your reading level?</h3>
              <div className='radio-group'>
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <label key={level} className='radio-option'>
                    <input
                      type='radio'
                      name='readingLevel'
                      value={level}
                      checked={preferences.readingLevel === level}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        readingLevel: e.target.value as any 
                      }))}
                    />
                    <span className='radio-label'>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Price Range */}
            <section className='preference-section'>
              <h3>What's your budget for books?</h3>
              <div className='price-range'>
                <div className='range-inputs'>
                  <div className='range-input'>
                    <label>Minimum: ₹{preferences.priceRange.min}</label>
                    <input
                      type='range'
                      min='0'
                      max='1000'
                      step='50'
                      value={preferences.priceRange.min}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                  <div className='range-input'>
                    <label>Maximum: ₹{preferences.priceRange.max}</label>
                    <input
                      type='range'
                      min='100'
                      max='2000'
                      step='50'
                      value={preferences.priceRange.max}
                      onChange={(e) => setPreferences(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: parseInt(e.target.value) }
                      }))}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Reading Goals */}
            <section className='preference-section'>
              <h3>How many books do you want to read per month?</h3>
              <div className='reading-goals'>
                <input
                  type='number'
                  min='1'
                  max='20'
                  value={preferences.readingGoals}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    readingGoals: parseInt(e.target.value) || 1
                  }))}
                  className='goals-input'
                />
                <span className='goals-label'>books per month</span>
              </div>
            </section>

            {/* Preferred Formats */}
            <section className='preference-section'>
              <h3>What book formats do you prefer?</h3>
              <div className='format-options'>
                {['physical', 'ebook', 'audiobook'].map(format => (
                  <label key={format} className='checkbox-option'>
                    <input
                      type='checkbox'
                      checked={preferences.preferredFormats.includes(format as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPreferences(prev => ({
                            ...prev,
                            preferredFormats: [...prev.preferredFormats, format as any]
                          }));
                        } else {
                          setPreferences(prev => ({
                            ...prev,
                            preferredFormats: prev.preferredFormats.filter(f => f !== format)
                          }));
                        }
                      }}
                    />
                    <span className='checkbox-label'>
                      {format === 'physical' ? '📚 Physical Books' : 
                       format === 'ebook' ? '📱 E-books' : '🎧 Audiobooks'}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Age Group */}
            <section className='preference-section'>
              <h3>What age group do you read for?</h3>
              <div className='radio-group'>
                {[
                  { value: 'kids', label: '👶 Kids (0-12)' },
                  { value: 'teen', label: '🧒 Teen (13-17)' },
                  { value: 'adult', label: '👨 Adult (18+)' }
                ].map(({ value, label }) => (
                  <label key={value} className='radio-option'>
                    <input
                      type='radio'
                      name='ageGroup'
                      value={value}
                      checked={preferences.ageGroup === value}
                      onChange={(e) => setPreferences(prev => ({ 
                        ...prev, 
                        ageGroup: e.target.value as any 
                      }))}
                    />
                    <span className='radio-label'>{label}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Save Button */}
            <div className='preferences-actions'>
              <button 
                className={`save-preferences-btn ${saved ? 'saved' : ''}`}
                onClick={handleSave}
              >
                {saved ? (
                  <>
                    <span className='check-icon'>✅</span>
                    Preferences Saved!
                  </>
                ) : (
                  <>
                    <span className='save-icon'>💾</span>
                    Save My Preferences
                  </>
                )}
              </button>
              
              <Link href='/' className='btn secondary-btn'>
                Back to Home
              </Link>
            </div>
          </div>

          {/* Preview */}
          <div className='preferences-preview'>
            <h3>🎯 Your Personalization Summary</h3>
            <div className='summary-grid'>
              <div className='summary-item'>
                <span className='summary-label'>Favorite Genres:</span>
                <span className='summary-value'>
                  {preferences.favoriteGenres.length > 0 
                    ? preferences.favoriteGenres.join(', ') 
                    : 'None selected'}
                </span>
              </div>
              <div className='summary-item'>
                <span className='summary-label'>Reading Goal:</span>
                <span className='summary-value'>{preferences.readingGoals} books/month</span>
              </div>
              <div className='summary-item'>
                <span className='summary-label'>Budget:</span>
                <span className='summary-value'>₹{preferences.priceRange.min} - ₹{preferences.priceRange.max}</span>
              </div>
              <div className='summary-item'>
                <span className='summary-label'>Formats:</span>
                <span className='summary-value'>{preferences.preferredFormats.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
