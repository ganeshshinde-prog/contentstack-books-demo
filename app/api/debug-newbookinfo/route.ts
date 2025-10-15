import { NextRequest, NextResponse } from 'next/server';
import { getNewArrivalsRes } from '@/helper';

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
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Testing NewBookInfo fetch...');
    
    const books = await getNewArrivalsRes();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      contentType: 'newbookinfo',
      count: books.length,
      books: books.map((book: Book) => ({
        uid: book.uid,
        title: book.title,
        author: book.author,
        book_type: book.book_type,
        price: book.price,
        hasImage: !!book.bookimage?.url,
        imageUrl: book.bookimage?.url,
        tags: book.tags
      })),
      fullBooks: books, // Include full data for debugging
      message: `Successfully fetched ${books.length} books from NewBookInfo content type`,
      debugInfo: {
        helperFunction: 'getNewArrivalsRes',
        contentTypeUid: 'newbookinfo',
        apiEndpoint: '/api/debug-newbookinfo',
        pageEndpoint: '/new_arrivals'
      }
    });
  } catch (error: any) {
    console.error('❌ DEBUG API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to debug NewBookInfo',
      stack: error.stack
    }, { status: 500 });
  }
}
