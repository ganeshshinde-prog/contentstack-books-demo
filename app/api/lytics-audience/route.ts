import { NextRequest, NextResponse } from 'next/server';

// API endpoint to help with Lytics audience detection and testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_behavior, 
      session_data, 
      engagement_metrics 
    } = body;

    console.log('🎯 Lytics Audience Detection API called');
    console.log('📊 User Behavior:', user_behavior);
    console.log('📈 Session Data:', session_data);
    console.log('🔍 Engagement Metrics:', engagement_metrics);

    // Analyze user behavior to determine audience segment
    const audience = determineAudience(user_behavior, session_data, engagement_metrics);
    
    console.log('✅ Determined audience:', audience);

    return NextResponse.json({
      success: true,
      audience,
      timestamp: new Date().toISOString(),
      analysis: {
        engagement_level: audience.engagement_level,
        confidence: audience.confidence,
        factors: audience.factors
      }
    });

  } catch (error) {
    console.error('❌ Lytics Audience API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to determine audience',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

function determineAudience(userBehavior: any, sessionData: any, engagementMetrics: any) {
  const viewedBooks = userBehavior?.viewedBooks?.length || 0;
  const sessionCount = userBehavior?.sessionCount || 0;
  const clickPatterns = Object.keys(userBehavior?.clickPatterns || {}).length;
  const timeOnSite = sessionData?.session_duration || 0;
  const pagesViewed = engagementMetrics?.pages_viewed || viewedBooks;

  // Calculate engagement score
  const engagementScore = (
    (viewedBooks * 2) +           // Book views weight heavily
    (sessionCount * 5) +          // Return visits are very important
    (clickPatterns * 1.5) +       // Interaction patterns
    (timeOnSite / 60000 * 0.5) +  // Time on site (convert ms to minutes)
    (pagesViewed * 1)             // Page depth
  );

  let audience: {
    id: string;
    name: string;
    slug: string;
    engagement_level: 'first_time' | 'repeat' | 'deeply_engaged';
    confidence: number;
    factors: string[];
  } = {
    id: 'first_time_visitors',
    name: 'First-time Visitors',
    slug: 'first_time_visitors',
    engagement_level: 'first_time',
    confidence: 0.7,
    factors: []
  };

  const factors = [];

  // Deeply Engaged Users (highest tier)
  if (
    sessionCount >= 3 && 
    viewedBooks >= 10 && 
    engagementScore >= 25
  ) {
    audience = {
      id: 'deeply_engaged_users',
      name: 'Deeply Engaged Users',
      slug: 'deeply_engaged_users',
      engagement_level: 'deeply_engaged',
      confidence: 0.9,
      factors: []
    };
    factors.push('Multiple return visits (3+)');
    factors.push('High book exploration (10+ books)');
    factors.push('Strong engagement patterns');
    
  // Repeat Visitors (middle tier)
  } else if (
    (sessionCount >= 2 || viewedBooks >= 5) && 
    engagementScore >= 10
  ) {
    audience = {
      id: 'repeat_visitors',
      name: 'Repeat Visitors',
      slug: 'repeat_visitors',
      engagement_level: 'repeat',
      confidence: 0.8,
      factors: []
    };
    factors.push(sessionCount >= 2 ? 'Return visitor' : 'Single session explorer');
    factors.push(`Viewed ${viewedBooks} books`);
    factors.push('Moderate engagement');
    
  // First-time visitors (default)
  } else {
    factors.push('New or low-engagement user');
    factors.push(`Limited exploration (${viewedBooks} books)`);
    if (sessionCount === 0) factors.push('First visit');
  }

  audience.factors = factors;

  return {
    ...audience,
    engagement_score: engagementScore,
    metrics: {
      viewed_books: viewedBooks,
      session_count: sessionCount,
      click_patterns: clickPatterns,
      time_on_site_minutes: Math.round(timeOnSite / 60000),
      pages_viewed: pagesViewed
    }
  };
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Lytics Audience Detection API',
    endpoints: {
      POST: 'Analyze user behavior and determine audience segment'
    },
    audience_types: [
      {
        id: 'deeply_engaged_users',
        name: 'Deeply Engaged Users',
        criteria: 'Multiple visits (3+), high book exploration (10+), strong engagement'
      },
      {
        id: 'repeat_visitors', 
        name: 'Repeat Visitors',
        criteria: 'Return visits (2+) or moderate exploration (5+ books)'
      },
      {
        id: 'first_time_visitors',
        name: 'First-time Visitors',
        criteria: 'New users or limited engagement'
      }
    ]
  });
}
