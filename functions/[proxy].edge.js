/**
 * Launch Edge Proxy for Contentstack Personalize
 * Based on: https://www.contentstack.com/docs/personalize/setup-nextjs-website-with-personalize-launch
 */

import Personalize from '@contentstack/personalize-edge-sdk';

export default async function handler(request, context) {
  const parsedUrl = new URL(request.url);
  
  // Exclude asset calls for better performance
  if (
    parsedUrl.pathname.startsWith('/_next/') ||
    parsedUrl.pathname.startsWith('/static/') ||
    parsedUrl.pathname.startsWith('/styles/') ||
    parsedUrl.pathname.startsWith('/images/') ||
    parsedUrl.pathname.includes('.') // Skip files with extensions
  ) {
    return fetch(request);
  }

  console.log('🎯 Launch Edge Proxy: Processing request for', parsedUrl.pathname);

  try {
    // Set custom edge API URL if provided
    if (context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL) {
      console.log('🌐 Setting Edge API URL:', context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL);
      Personalize.setEdgeApiUrl(context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL);
    }

    // Initialize the Personalize SDK with the request context
    const personalizeSdk = await Personalize.init(
      context.env.NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID, 
      { request }
    );

    console.log('✅ Personalize SDK initialized in Edge Proxy');

    // Get the variant parameter from the SDK
    const variantParam = personalizeSdk.getVariantParam();
    
    if (variantParam) {
      console.log('🎭 Adding variant parameter to URL:', variantParam);
      // Set the variant parameter as a query param in the URL
      parsedUrl.searchParams.set(Personalize.VARIANT_QUERY_PARAM, variantParam);
    } else {
      console.log('ℹ️ No variants available for this request');
    }

    // Create modified request with the updated URL
    const modifiedRequest = new Request(parsedUrl.toString(), request);
    
    // Fetch the response from the origin
    const response = await fetch(modifiedRequest);
    
    // Create modified response
    const modifiedResponse = new Response(response.body, response);
    
    // Add personalization state to response (cookies for user identification)
    await personalizeSdk.addStateToResponse(modifiedResponse);
    
    // Ensure that the response is not cached on the browser
    modifiedResponse.headers.set('cache-control', 'no-store');
    
    console.log('✅ Edge Proxy: Response modified with personalization state');
    
    return modifiedResponse;

  } catch (error) {
    console.error('❌ Edge Proxy Error:', error);
    // Fallback to original request if personalization fails
    return fetch(request);
  }
}
