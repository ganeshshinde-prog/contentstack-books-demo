import { NextRequest, NextResponse } from 'next/server';
import { getNewArrivalsRes } from '@/helper';

export async function GET(request: NextRequest) {
  try {
    console.log('🆕 API: Fetching new arrivals from NewBookInfo content type');
    
    const books = await getNewArrivalsRes();
    
    // Transform the data to a simpler format for the frontend
    const transformedBooks = books.map((book: any) => ({
      uid: book.uid,
      title: book.title,
      author: book.author,
      book_type: book.book_type,
      price: book.price,
      number_of_pages: book.number_of_pages,
      book_description: book.book_description,
      bookimage: book.bookimage,
      tags: book.tags || []
    }));
    
    return NextResponse.json({
      success: true,
      contentType: 'newbookinfo',
      count: transformedBooks.length,
      books: transformedBooks,
      message: `Successfully fetched ${transformedBooks.length} new arrival books from NewBookInfo content type`
    });
  } catch (error: any) {
    console.error('❌ API Error fetching new arrivals:', error);
    return NextResponse.json({
      success: false,
      contentType: 'newbookinfo',
      error: error.message || 'Failed to fetch new arrivals',
      books: []
    }, { status: 500 });
  }
}
