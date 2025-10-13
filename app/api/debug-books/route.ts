import { NextRequest, NextResponse } from 'next/server';
import { getBooksRes } from '../../../helper';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching all books from Contentstack...');
    
    // Get all books without filtering
    const response = await getBooksRes();
    
    const diagnostics = {
      timestamp: new Date().toISOString(),
      totalBooks: response.length,
      books: response.map((book: any) => ({
        uid: book.uid,
        title: book.title,
        author: book.author,
        book_type: book.book_type,
        price: book.price,
        hasImage: !!(book.bookimage && book.bookimage.url),
        imageUrl: book.bookimage?.url,
        hasDescription: !!book.book_description,
        tags: book.tags,
        allFields: Object.keys(book),
        missingFields: [],
      })),
    };

    // Check for missing fields
    diagnostics.books.forEach((book: any) => {
      const requiredFields = ['title', 'author', 'book_description', 'book_type', 'price'];
      requiredFields.forEach(field => {
        const originalBook = response.find((b: any) => b.uid === book.uid);
        if (!originalBook[field]) {
          book.missingFields.push(field);
        }
      });
    });

    // Find "Band of Brothers" specifically
    const bandOfBrothers = diagnostics.books.find((book: any) => 
      book.title && book.title.toLowerCase().includes('band of brothers')
    );

    if (bandOfBrothers) {
      console.log('✅ Found "Band of Brothers" book:', bandOfBrothers);
    } else {
      console.log('❌ "Band of Brothers" book not found in results');
      console.log('📚 Available books:', diagnostics.books.map((b: any) => b.title));
    }

    return NextResponse.json({
      success: true,
      diagnostics,
      bandOfBrothers: bandOfBrothers || null,
    });

  } catch (error: any) {
    console.error('❌ Error in book diagnostics:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch debug info',
      stack: error?.stack || 'No stack trace available',
    }, { status: 500 });
  }
}
