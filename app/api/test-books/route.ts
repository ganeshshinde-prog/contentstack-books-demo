import { NextRequest, NextResponse } from 'next/server';
import { getBooksRes } from '../../../helper';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing books loading...');
    
    const books = await getBooksRes();
    
    return NextResponse.json({
      success: true,
      message: 'Books loaded successfully',
      count: books.length,
      books: books.map((book: any) => ({
        uid: book.uid,
        title: book.title,
        author: book.author,
        book_type: book.book_type,
        price: book.price,
        hasImage: !!(book.bookimage && book.bookimage.url),
        imageUrl: book.bookimage?.url,
      })),
      bandOfBrothers: books.find((book: any) => 
        book.title && book.title.toLowerCase().includes('band of brothers')
      ) || null,
    });

  } catch (error: any) {
    console.error('❌ Error testing books:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to test books',
      stack: error?.stack || 'No stack trace available',
    }, { status: 500 });
  }
}
