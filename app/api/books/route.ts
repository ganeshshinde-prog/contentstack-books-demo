import { NextRequest, NextResponse } from 'next/server';
import { getBooksRes } from '@/helper';

export async function GET(request: NextRequest) {
  try {
    console.log('📚 API: Fetching books from BookInfo content type');
    const books = await getBooksRes();
    
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
      contentType: 'bookinfo',
      count: transformedBooks.length,
      books: transformedBooks,
      message: `Successfully fetched ${transformedBooks.length} books from BookInfo content type`
    });
  } catch (error: any) {
    console.error('❌ API Error fetching books:', error);
    return NextResponse.json({
      success: false,
      contentType: 'bookinfo',
      error: error.message || 'Failed to fetch books',
      books: []
    }, { status: 500 });
  }
}