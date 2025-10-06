import React from 'react';
import Link from 'next/link';

interface Genre {
  name: string;
  icon: string;
  description: string;
  color: string;
}

const genres: Genre[] = [
  {
    name: 'Fantasy',
    icon: '🐉',
    description: 'Epic adventures in magical worlds',
    color: '#8B5CF6'
  },
  {
    name: 'Science Fiction',
    icon: '🚀',
    description: 'Explore the future and beyond',
    color: '#06B6D4'
  },
  {
    name: 'Mystery',
    icon: '🔍',
    description: 'Unravel thrilling puzzles',
    color: '#EC4899'
  },
  {
    name: 'Romance',
    icon: '💕',
    description: 'Heartwarming love stories',
    color: '#F59E0B'
  },
  {
    name: 'Historical Fiction',
    icon: '🏛️',
    description: 'Journey through time',
    color: '#10B981'
  },
  {
    name: 'Horror',
    icon: '👻',
    description: 'Spine-chilling tales',
    color: '#EF4444'
  },
  {
    name: 'Biography',
    icon: '👤',
    description: 'Real stories of remarkable lives',
    color: '#6366F1'
  },
  {
    name: 'Self Help',
    icon: '📈',
    description: 'Transform your life',
    color: '#84CC16'
  }
];

export default function GenreCategories() {
  return (
    <div className='genre-categories-section'>
      <div className='max-width'>
        <div className='section-header'>
          <h2>Explore by Genre</h2>
          <p>Find your perfect book by browsing our diverse collection of genres</p>
        </div>
        
        <div className='genres-grid'>
          {genres.map((genre, index) => (
            <Link 
              href={`/books?genre=${encodeURIComponent(genre.name)}`} 
              key={index}
              className='genre-card'
              style={{ '--genre-color': genre.color } as React.CSSProperties}
            >
              <div className='genre-icon'>{genre.icon}</div>
              <h3 className='genre-name'>{genre.name}</h3>
              <p className='genre-description'>{genre.description}</p>
            </Link>
          ))}
        </div>
        
        <div className='view-all-genres'>
          <Link href='/books' className='btn secondary-btn'>
            View All Books
          </Link>
        </div>
      </div>
    </div>
  );
}
