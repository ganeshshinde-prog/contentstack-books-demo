import { NextRequest, NextResponse } from 'next/server';
import { getBookExtendedRes, getBooksRes } from '../../../../helper';

export async function GET(request: NextRequest, { params }: { params: { uid: string } }) {
  try {
    const { uid } = params;
    
    if (!uid) {
      return NextResponse.json({
        success: false,
        error: 'Book UID is required',
      }, { status: 400 });
    }

    console.log(`🔍 Book Detail API: Fetching info for UID: ${uid}`);
    
    // First, try to get extended book info
    let bookData = await getBookExtendedRes(uid);
    
    if (bookData) {
      console.log(`✅ Book Detail API: Found extended info for: ${bookData.title}`);
      return NextResponse.json({
        success: true,
        book: bookData,
        source: 'extended'
      });
    }
    
    // If no extended info, try to get from regular books
    console.log(`🔍 Book Detail API: No extended info found, trying regular books...`);
    const regularBooks = await getBooksRes();
    const regularBook = regularBooks.find((book: any) => book.uid === uid);
    
    if (regularBook) {
      console.log(`✅ Book Detail API: Found regular book info for: ${regularBook.title}`);
      
      // Format regular book to match extended book interface
      const formattedBook = {
        ...regularBook,
        book_summary: regularBook.book_description, // Use regular description as summary
        author: regularBook.author || 'Unknown Author',
        book_type: regularBook.book_type || 'Unknown',
        publication_year: 'Unknown',
        isbn: 'Not available',
        price: regularBook.price || 0,
        number_of_pages: regularBook.number_of_pages || 0,
        key_features: [],
        bookimage: regularBook.bookimage || {
          url: '',
          title: regularBook.title || 'Book Image'
        },
        tags: regularBook.tags || [],
      };
      
      return NextResponse.json({
        success: true,
        book: formattedBook,
        source: 'regular'
      });
    }

    // If neither extended nor regular book found
    console.warn(`❌ Book Detail API: No book found for UID: ${uid}`);
    return NextResponse.json({
      success: false,
      error: 'Book not found',
    }, { status: 404 });

  } catch (error: any) {
    console.error('❌ Book Detail API Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to fetch book details',
    }, { status: 500 });
  }
}
