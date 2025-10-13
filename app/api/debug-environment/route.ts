import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔧 Environment Debug Test');
    
    // Test both environments
    const testResults = {
      timestamp: new Date().toISOString(),
      environments: {
        development: {
          name: 'development',
          configured: true,
        },
        new_book: {
          name: 'new_book', 
          configured: true,
        }
      },
      environmentVariables: {
        CONTENTSTACK_API_KEY: process.env.CONTENTSTACK_API_KEY ? 'Set ✅' : 'Missing ❌',
        CONTENTSTACK_DELIVERY_TOKEN: process.env.CONTENTSTACK_DELIVERY_TOKEN ? 'Set ✅' : 'Missing ❌',
        CONTENTSTACK_ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT || 'Not set',
        CONTENTSTACK_REGION: process.env.CONTENTSTACK_REGION || 'us (default)',
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Environment debug information',
      data: testResults
    });
  } catch (error) {
    console.error('❌ Environment debug error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message || 'Failed to get environment debug info'
    }, { status: 500 });
  }
}
