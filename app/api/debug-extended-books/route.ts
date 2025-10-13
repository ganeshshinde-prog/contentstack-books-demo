import { NextRequest, NextResponse } from 'next/server';
import Stack from '../../../contentstack-sdk';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Extended Books: Fetching all BookInfoExtended entries...');
    
    const response = await Stack.getEntry({
      contentTypeUid: "bookinfoextended",
      referenceFieldPath: undefined,
      jsonRtePath: ["book_summary"],
    });

    const books = response[0] || [];
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      totalExtendedBooks: books.length,
      books: books.map((book: any) => ({
        uid: book.uid,
        title: book.title,
        author: book.author || 'Not specified',
        book_type: book.book_type || 'Not specified',
        price: book.price || 'Not specified',
        hasBookSummary: !!book.book_summary,
        hasTags: !!(book.tags && book.tags.length > 0),
        tags: book.tags || [],
        allFields: Object.keys(book),
      })),
    };

    console.log(`✅ Found ${books.length} BookInfoExtended entries`);
    
    return NextResponse.json({
      success: true,
      debugInfo,
    });

  } catch (error: any) {
    console.error('❌ Debug Extended Books Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch extended book debug info',
      stack: error?.stack || 'No stack trace available',
    }, { status: 500 });
  }
}
