import { NextRequest, NextResponse } from 'next/server';

// In-memory cache to prevent duplicate events (in production, use Redis or similar)
const recentEvents = new Map<string, number>();

// Clean up old events every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(recentEvents.entries());
  for (const [key, timestamp] of entries) {
    if (now - timestamp > 300000) { // 5 minutes
      recentEvents.delete(key);
    }
  }
}, 300000);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      event_name,
      event_data,
      user_session,
      user_agent,
      timestamp,
      page_url,
      user_preferences,
      user_segment,
    } = body;

    // Create a deduplication key
    const dedupeKey = `${event_name}_${event_data.book_id || 'unknown'}_${user_session}`;
    const now = Date.now();
    
    // Check if we've seen this event recently (within last 10 seconds)
    if (recentEvents.has(dedupeKey)) {
      const lastEventTime = recentEvents.get(dedupeKey)!;
      if (now - lastEventTime < 10000) { // 10 seconds
        console.log(`🚫 Skipping duplicate ${event_name} event for book:`, event_data.book_id);
        return NextResponse.json({
          success: true,
          message: 'Duplicate event ignored',
          event: event_name,
          data: event_data,
        });
      }
    }
    
    // Record this event
    recentEvents.set(dedupeKey, now);

    console.log(`📊 Personalize Event API: Received ${event_name} event:`, event_data);

    // Prepare the payload for Contentstack Personalize
    const personalizePayload = {
      event: event_name,
      properties: {
        ...event_data,
        user_session,
        user_agent,
        timestamp,
        page_url,
        user_segment,
        // Add any additional tracking data
        stack_api_key: process.env.CONTENTSTACK_API_KEY,
        environment: process.env.CONTENTSTACK_ENVIRONMENT,
      },
      user_id: user_session, // Use session as user identifier
      session_id: user_session,
    };

    // Get Contentstack Personalize configuration
    const personalizeApiUrl = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_URL;
    const personalizeToken = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_TOKEN;
    const personalizeProjectId = process.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_ID;

    if (!personalizeApiUrl || !personalizeToken || !personalizeProjectId) {
      console.warn('⚠️ Contentstack Personalize not configured, storing event locally');
      
      // For development/testing, log the event that would be sent
      console.log('📊 Personalize Event (would be sent to Contentstack):', {
        url: personalizeApiUrl || 'https://personalize-api.contentstack.com/v1/events',
        project_id: personalizeProjectId || 'your-project-id',
        payload: personalizePayload,
      });

      return NextResponse.json({
        success: true,
        message: 'Event logged locally (Personalize not configured)',
        event: event_name,
        data: event_data,
      });
    }

    try {
      // Send event to Contentstack Personalize
      const personalizeUrl = `${personalizeApiUrl}/projects/${personalizeProjectId}/events`;
      
      console.log(`🚀 Sending event to Contentstack Personalize: ${personalizeUrl}`);
      
      const personalizeResponse = await fetch(personalizeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${personalizeToken}`,
          'X-CS-CLI': 'true', // Contentstack header
        },
        body: JSON.stringify(personalizePayload),
      });

      if (personalizeResponse.ok) {
        const result = await personalizeResponse.json();
        console.log(`✅ Successfully sent ${event_name} event to Contentstack Personalize`);
        
        return NextResponse.json({
          success: true,
          message: `${event_name} event sent to Contentstack Personalize`,
          event: event_name,
          data: event_data,
          personalize_response: result,
        });
      } else {
        const errorText = await personalizeResponse.text();
        console.error(`❌ Contentstack Personalize API error:`, personalizeResponse.status, errorText);
        
        return NextResponse.json({
          success: false,
          error: 'Failed to send event to Contentstack Personalize',
          status: personalizeResponse.status,
          details: errorText,
        }, { status: personalizeResponse.status });
      }
    } catch (personalizeError: any) {
      console.error('❌ Error calling Contentstack Personalize API:', personalizeError);
      
      return NextResponse.json({
        success: false,
        error: 'Contentstack Personalize API call failed',
        details: personalizeError.message,
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Personalize Event API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process personalization event',
      details: error.message,
    }, { status: 500 });
  }
}
