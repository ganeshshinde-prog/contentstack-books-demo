# Contentstack Personalization Setup Guide

This guide explains how to set up Contentstack Personalize for the books demo application, following patterns from the [contentstack-onkar-demo](https://github.com/onkarj-47/contentstack-onkar-demo) repository.

## Prerequisites

1. **Contentstack Account** with Personalize enabled
2. **Project Setup** in Contentstack Personalize
3. **Environment Variables** configured

## Environment Variables

Add these to your `.env.local` file:

```bash
# Contentstack Personalize Configuration
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_URL=https://personalize-api.contentstack.com/v1
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_TOKEN=your_personalize_api_token
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_ID=your_personalize_project_id

# Contentstack Core Configuration
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=development
```

## 1. Event Tracking Setup

### Book View Events
When users view books, we track:
- `book_viewed` - Core viewing event
- `genre_interest` - Genre preference learning
- `author_preference` - Author interest tracking

### User Behavior Events
- `session_start` - User session initialization
- `search_performed` - Search behavior tracking
- `cart_interaction` - Shopping behavior
- `purchase_completed` - Conversion tracking

## 2. Audience Segmentation

### Primary Segments
1. **New User** - First-time visitors
2. **Genre Enthusiast** - Users with specific genre preferences (War, Thriller, etc.)
3. **Frequent Reader** - High engagement users
4. **Price Conscious** - Budget-focused users
5. **Casual Browser** - Low engagement users
6. **Returning Customer** - Users with purchase history

### War Genre Specialization
Users who view War books are automatically:
- Added to "War Enthusiast" audience
- Served War-focused content
- Given priority War book recommendations

## 3. Personalization Rules

### Content Prioritization
1. **War Books Priority** - 70% War books for War enthusiasts
2. **Genre Matching** - Books matching user's favorite genres
3. **Price Range Filtering** - Books within user's budget
4. **Author Preferences** - Books by preferred authors

### Dynamic Content
- **Hero Section** - Personalized based on user segment
- **Recommendations** - AI-powered book suggestions
- **Promotional Banners** - Targeted offers
- **Email Campaigns** - Personalized book suggestions

## 4. Implementation Architecture

### Client-Side Tracking
```typescript
// Event tracking
trackBehavior('view_book', {
  bookId: 'book-uuid',
  title: 'Book Title',
  genre: 'War',
  author: 'Author Name',
  price: 500
});
```

### Server-Side API
```typescript
// Personalized content endpoint
POST /api/personalized-content
{
  "userSegment": "genre_enthusiast",
  "preferences": {
    "favoriteGenres": ["War", "History"],
    "priceRange": { "min": 0, "max": 1000 }
  },
  "behavior": {
    "viewedBooks": ["book-1", "book-2"],
    "searchHistory": ["war books", "history"]
  }
}
```

### Real-time Personalization
- **Context API** - Global personalization state
- **Local Storage** - Persistent user preferences
- **Session Tracking** - Temporary behavior data
- **API Integration** - Real-time content updates

## 5. Testing Personalization

### Debug Mode
1. Open browser developer console
2. Look for personalization logs:
   - `🎯 PERSONALIZATION: VIEW_BOOK Event`
   - `🏷️ USER SEGMENT UPDATE`
   - `🎭 GENRE ENTHUSIAST Logic`

### Visual Debug Panel
- Click "🎯 Debug Personalization" button on homepage
- View current user segment and preferences
- Monitor real-time personalization changes

### Test Scenarios
1. **New User Journey**
   - Visit homepage → See general recommendations
   - View War book → Auto-learn War preference
   - Return to homepage → See War-focused content

2. **Genre Enthusiast Path**
   - View multiple War books
   - Segment changes to "genre_enthusiast"
   - Recommendations prioritize War books (70/30 split)

3. **Cross-Genre Interest**
   - View books from multiple genres
   - System balances recommendations
   - Maintains genre diversity

## 6. Analytics & Monitoring

### Key Metrics
- **Engagement Rate** - Time spent on personalized content
- **Conversion Rate** - Purchases from recommendations
- **Genre Affinity** - User preference accuracy
- **Segment Distribution** - User segment breakdown

### Event Logging
All events are logged to console for debugging:
```
📊 Sending book_viewed event to Contentstack Personalize
🎖️ WAR GENRE RECOMMENDATIONS: 3 books
🔄 SEGMENT CHANGED: new_user → genre_enthusiast
```

## 7. Advanced Features

### AI-Powered Recommendations
- **Collaborative Filtering** - Similar user preferences
- **Content-Based Filtering** - Book similarity matching
- **Hybrid Approach** - Combined recommendation strategies

### Real-time Adaptation
- **Immediate Learning** - Instant preference updates
- **Session-based Adjustments** - Within-session optimization
- **Long-term Profiling** - Cross-session user modeling

### A/B Testing Integration
- **Experience Variants** - Test different recommendation algorithms
- **Content Variations** - Test different book presentations
- **Performance Monitoring** - Track variant effectiveness

## 8. Troubleshooting

### Common Issues
1. **Events Not Tracking**
   - Check environment variables
   - Verify API token permissions
   - Review console for errors

2. **Recommendations Not Updating**
   - Clear browser localStorage
   - Check user segment assignment
   - Verify API responses

3. **Debug Panel Not Showing**
   - Refresh page
   - Check PersonalizationProvider wrapper
   - Verify context imports

### Debug Commands
```bash
# Clear personalization data
localStorage.clear()

# Check current user state
console.log(usePersonalization())

# View API responses
# Check Network tab in DevTools
```

## 9. Next Steps

### Enhanced Personalization
1. **Email Integration** - Personalized email campaigns
2. **Push Notifications** - Targeted book alerts
3. **Social Sharing** - Personalized book recommendations
4. **Wishlist Features** - Personalized book collections

### Advanced Analytics
1. **Heatmap Tracking** - User interaction patterns
2. **Conversion Funnels** - Purchase journey analysis
3. **Retention Analysis** - Long-term user engagement
4. **ROI Measurement** - Personalization effectiveness

---

This implementation follows the patterns established in the [contentstack-onkar-demo repository](https://github.com/onkarj-47/contentstack-onkar-demo) and provides a robust foundation for book recommendation personalization.
