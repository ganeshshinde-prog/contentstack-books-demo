import { NextRequest, NextResponse } from 'next/server';
import { getNewBookExtendedRes } from '@/helper';

export async function GET(
  request: NextRequest,
  { params }: { params: { uid: string } }
) {
  try {
    const { uid } = params;
    
    if (!uid) {
      return NextResponse.json({
        success: false,
        error: 'Book UID is required'
      }, { status: 400 });
    }
    
    console.log(`🆕 API: Fetching extended details for new book UID: ${uid}`);
    
    const book = await getNewBookExtendedRes(uid);
    
    if (!book) {
      return NextResponse.json({
        success: false,
        error: 'New book not found',
        uid: uid
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      contentType: 'newbookinfoextended',
      book: book,
      message: `Successfully fetched extended details for new book: ${book.title}`
    });
  } catch (error: any) {
    console.error('❌ API Error fetching new book details:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch new book details'
    }, { status: 500 });
  }
}
