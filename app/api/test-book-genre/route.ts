import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Test endpoint to verify book_genre attribute',
    instructions: [
      '1. Click on any book to trigger personalization',
      '2. Check browser network tab for user-attributes request',
      '3. Look for book_genre, bookGenre, or book_genre_interest in payload',
      '4. Check console logs for attribute debugging'
    ],
    expectedAttributes: [
      'book_genre: "War" (or other genre)',
      'bookGenre: "War" (camelCase version)',
      'War: true (dynamic genre attribute)',
      'book_genre_interest: "war"',
      'last_viewed_genre: "war"',
      'reading_preference: "war"'
    ]
  });
}
