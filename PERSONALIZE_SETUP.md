# Contentstack Personalize Setup Guide

Based on the [Contentstack Compass Starter documentation](https://www.contentstack.com/docs/developers/sample-apps/build-a-website-using-contestack-compass-starter), this guide explains how to generate the required environment variables for personalization.

## Required Environment Variables

### 1. CONTENTSTACK_PERSONALIZE_PROJECT_UID

**How to generate:**
1. Log in to your Contentstack account
2. Navigate to your stack
3. Go to **Personalize** section in the left sidebar
4. Create a new Personalize project or select an existing one
5. In the project settings/dashboard, copy the **Project UID**
6. The UID typically looks like: `blt1234567890abcdef`

**Example:**
```bash
CONTENTSTACK_PERSONALIZE_PROJECT_UID=blt1234567890abcdef
```

### 2. CONTENTSTACK_PERSONALIZE_EDGE_API_URL

**How to generate:**
This is the Edge API URL for Contentstack Personalize, which varies by region:

- **North America**: `https://personalize-edge.contentstack.com`
- **Europe**: `https://eu-personalize-edge.contentstack.com`
- **Other regions**: Check your Contentstack region settings

**Example:**
```bash
CONTENTSTACK_PERSONALIZE_EDGE_API_URL=https://personalize-edge.contentstack.com
```

## Complete Environment Configuration

Add these to your `.env.local` file:

```bash
# Contentstack Personalize Configuration (Compass Starter Style)
CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_personalize_project_uid_here
CONTENTSTACK_PERSONALIZE_EDGE_API_URL=https://personalize-edge.contentstack.com

# A/B Testing Configuration (Optional)
CONTENTSTACK_AB_LANDING_PAGE_PATH=/books/war-books
CONTENTSTACK_AB_EXPERIENCE_ID=your_ab_experience_id_here
CONTENTSTACK_AB_PRIMARY_EVENT=book_viewed
```

## How to Find Your Project UID

1. **Via Contentstack Dashboard:**
   - Login to [app.contentstack.com](https://app.contentstack.com)
   - Select your stack
   - Navigate to **Personalize** → **Projects**
   - Click on your project
   - Copy the Project UID from the URL or settings

2. **Via API:**
   ```bash
   curl -X GET "https://personalize-api.contentstack.com/v1/projects" \
     -H "Authorization: Bearer YOUR_PERSONALIZE_TOKEN" \
     -H "Content-Type: application/json"
   ```

## Setting Up Personalize Attributes

Based on your books app setup, configure these attributes in Contentstack Personalize:

### Book-related Attributes
- `book_genre` (string): War, Fantasy, Mystery, etc.
- `reading_preference` (string): User's preferred genre
- `war_interest` (boolean): Special flag for War genre fans
- `military_history_fan` (boolean): Specific to War books

### User Behavior Attributes  
- `user_segment` (string): new_user, genre_enthusiast, war_enthusiast, etc.
- `browsing_behavior` (string): active_browser, casual_browser
- `price_preference` (string): premium, budget
- `personalization_level` (string): active, basic

### Session Attributes
- `session_count` (number): Number of user sessions
- `viewed_books_count` (number): Total books viewed
- `last_viewed_book` (string): Most recent book UID

## Testing Your Setup

1. **Check SDK Initialization:**
   ```javascript
   // In browser console
   console.log('Personalize SDK Status:', window.personalizeSDK?.getInitializationStatus());
   ```

2. **Verify Attributes:**
   ```javascript
   // In browser console  
   console.log('Current Attributes:', window.personalizeSDK?.getAttributes());
   ```

3. **Test Events:**
   ```javascript
   // In browser console
   window.personalizeSDK?.triggerEvent('test_event', { test: true });
   ```

## Troubleshooting

### Common Issues:

1. **SDK Not Initializing:**
   - Check if Project UID and Edge API URL are correct
   - Verify your Contentstack region matches the Edge API URL
   - Check browser console for initialization errors

2. **Attributes Not Setting:**
   - Ensure SDK is initialized before setting attributes
   - Check attribute names match your Personalize project configuration
   - Verify user has proper permissions

3. **Events Not Triggering:**
   - Confirm event names match your Personalize project setup
   - Check network tab for API calls
   - Verify project is active and properly configured

### Debug Mode:

Enable debug mode in development:
```javascript
// In services/personalize.ts
Personalize.init({
  projectUid: this.config.projectUid,
  apiUrl: this.config.edgeApiUrl,
  environment: this.config.environment,
  enableDebugMode: true // Enable for detailed logs
});
```

## Next Steps

1. Set up your environment variables
2. Create personalization attributes in Contentstack
3. Configure audiences and experiences
4. Test the personalization flow
5. Monitor analytics in Contentstack Personalize dashboard

For more details, refer to the [Contentstack Personalize documentation](https://www.contentstack.com/docs/developers/personalize/).
