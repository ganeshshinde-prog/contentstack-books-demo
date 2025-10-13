# Multi-Environment Contentstack Setup

This setup allows you to use different Contentstack environments for different endpoints:

## Environment Configuration

### Development Environment
- **Purpose**: Regular book catalog
- **Environment Name**: `development`
- **Endpoint**: `/books` and `/api/books`
- **Usage**: Shows all published books from development environment

### New Book Environment  
- **Purpose**: New book arrivals
- **Environment Name**: `new_book`
- **Endpoint**: `/new-arrivals` and `/api/new-arrivals`
- **Usage**: Shows newly published books from new_book environment

## How It Works

### 1. Multi-Environment SDK (`contentstack-sdk/multi-environment.js`)
- Creates separate Stack instances for each environment
- Provides environment-specific methods:
  - `getDevelopmentEntry()` - Fetches from development environment
  - `getNewBookEntry()` - Fetches from new_book environment

### 2. Helper Functions (`helper/index.js`)
- `getBooksRes()` - Uses development environment
- `getNewArrivalsRes()` - Uses new_book environment

### 3. API Routes
- `/api/books` - Returns books from development environment
- `/api/new-arrivals` - Returns books from new_book environment

### 4. Pages
- `/books` - Shows books from development environment
- `/new-arrivals` - Shows books from new_book environment

## Publishing Workflow

### For Regular Books (Development Environment)
1. Create/edit BookInfo entry in Contentstack
2. Publish to **development** environment
3. Books appear on `/books` endpoint
4. Accessible via `/api/books`

### For New Arrivals (New Book Environment)
1. Create/edit BookInfo entry in Contentstack  
2. Publish to **new_book** environment
3. Books appear on `/new-arrivals` endpoint
4. Accessible via `/api/new-arrivals`

## Environment Variables Required

```bash
# Contentstack Configuration
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_REGION=us
CONTENTSTACK_ENVIRONMENT=development  # Default environment (still used for other content)

# Optional: Live Preview
CONTENTSTACK_PREVIEW_HOST=your_preview_host
CONTENTSTACK_PREVIEW_TOKEN=your_preview_token
CONTENTSTACK_LIVE_EDIT_TAGS=true
```

## Testing the Setup

### 1. Test Development Environment
```bash
curl http://localhost:3001/api/books
```

### 2. Test New Books Environment  
```bash
curl http://localhost:3001/api/new-arrivals
```

### 3. Check Console Logs
Look for these logs to confirm environment usage:
- `📚 Fetching books from DEVELOPMENT environment`
- `🆕 Fetching new arrivals from NEW_BOOKS environment`

## Troubleshooting

### If books don't appear:
1. Check that BookInfo entries are published to the correct environment
2. Verify environment names match exactly (`development` and `new_books`)
3. Check console logs for API errors
4. Ensure delivery tokens have access to both environments

### Environment Debug Info:
- Visit `/new-arrivals` and expand "Environment Debug Info" section
- Check browser console for detailed logging
- Verify API responses include correct environment information

## Adding More Environments

To add additional environments:

1. **Update `multi-environment.js`**:
   ```javascript
   const MyNewStack = createStack('my_new_environment');
   
   getMyNewEntry({ contentTypeUid, referenceFieldPath, jsonRtePath }) {
     return getEntryFromStack(MyNewStack, { contentTypeUid, referenceFieldPath, jsonRtePath });
   }
   ```

2. **Add helper function**:
   ```javascript
   export const getMyNewContentRes = async () => {
     const response = await MultiEnvStack.getMyNewEntry({
       contentTypeUid: "bookinfo",
       // ... other params
     });
     return response[0] || [];
   };
   ```

3. **Create API route**: `/app/api/my-new-endpoint/route.ts`

4. **Create page**: `/app/my-new-page/page.tsx`
