import React from 'react';

export default function ReadingStats() {
  return (
    <div className='reading-stats-section'>
      <div className='max-width'>
        <div className='stats-container'>
          <div className='stat-card'>
            <div className='stat-icon'>📖</div>
            <div className='stat-content'>
              <h3>Start Your Journey</h3>
              <p>Every great reader started with a single page. Begin your adventure today.</p>
            </div>
          </div>
          
          <div className='stat-card'>
            <div className='stat-icon'>🌟</div>
            <div className='stat-content'>
              <h3>Curated Selection</h3>
              <p>Each book in our collection is carefully chosen for its quality and impact.</p>
            </div>
          </div>
          
          <div className='stat-card'>
            <div className='stat-icon'>🚀</div>
            <div className='stat-content'>
              <h3>Expand Your Mind</h3>
              <p>Reading opens doors to new worlds, ideas, and perspectives.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
