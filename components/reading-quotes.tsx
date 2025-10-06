import React from 'react';

interface Quote {
  text: string;
  author: string;
}

const bookQuotes: Quote[] = [
  {
    text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin"
  },
  {
    text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.",
    author: "Dr. Seuss"
  },
  {
    text: "Books are a uniquely portable magic.",
    author: "Stephen King"
  },
  {
    text: "So many books, so little time.",
    author: "Frank Zappa"
  },
  {
    text: "A room without books is like a body without a soul.",
    author: "Marcus Tullius Cicero"
  }
];

export default function ReadingQuotes() {
  // Pick a random quote each time the component renders
  const randomQuote = bookQuotes[Math.floor(Math.random() * bookQuotes.length)];

  return (
    <div className='reading-quotes-section'>
      <div className='max-width'>
        <div className='quote-container'>
          <div className='quote-icon'>📚</div>
          <blockquote className='featured-quote'>
            <p>"{randomQuote.text}"</p>
            <cite>— {randomQuote.author}</cite>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
