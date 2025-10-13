# Contentstack Multi-Content-Type Setup

This document outlines how to configure and use multiple Contentstack content types within the application.

## Content Types Configured

### BookInfo Content Type
- **Purpose**: Regular book catalog
- **Content Type UID**: `bookinfo`
- **Endpoint**: `/books` and `/api/books`
- **Usage**: Shows all published books from BookInfo content type

### NewBookInfo Content Type  
- **Purpose**: New book arrivals
- **Content Type UID**: `newbookinfo`
- **Endpoint**: `/new_arrivals` and `/api/new-arrivals`
- **Usage**: Shows newly published books from NewBookInfo content type

## How It Works

### 1. Helper Functions (`helper/index.js`)
- `getBooksRes()` - Fetches from BookInfo content type
- `getNewArrivalsRes()` - Fetches from NewBookInfo content type

### 2. API Routes
- `/api/books` - Returns books from BookInfo content type
- `/api/new-arrivals` - Returns books from NewBookInfo content type

### 3. Pages
- `/books` - Shows books from BookInfo content type
- `/new_arrivals` - Shows books from NewBookInfo content type

## Publishing Workflow

### For Regular Books (BookInfo Content Type)
1. Create/edit BookInfo entry in Contentstack
2. Publish the entry
3. Books appear on `/books` endpoint
4. Accessible via `/api/books`

### For New Arrivals (NewBookInfo Content Type)
1. Create/edit NewBookInfo entry in Contentstack  
2. Publish the entry
3. Books appear on `/new_arrivals` endpoint
4. Accessible via `/api/new-arrivals`

## Environment Variables Required

```bash
# Contentstack Configuration
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
CONTENTSTACK_ENVIRONMENT=your_environment
CONTENTSTACK_REGION=us
CONTENTSTACK_PREVIEW_HOST=preview.contentstack.com
CONTENTSTACK_PREVIEW_TOKEN=your_preview_token
CONTENTSTACK_APP_HOST=app.contentstack.com
CONTENTSTACK_LIVE_EDIT_TAGS=true

# Contentstack Personalize Configuration
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_PROJECT_UID=your_personalize_project_uid
NEXT_PUBLIC_CONTENTSTACK_PERSONALIZE_EDGE_API_URL=https://personalize-edge.contentstack.com
NEXT_PUBLIC_CONTENTSTACK_MANAGEMENT_TOKEN=your_management_token
```

## Content Type Structure

Both `BookInfo` and `NewBookInfo` should have identical field structures:
- `title` (Single Line Textbox)
- `author` (Single Line Textbox)  
- `book_description` (Rich Text Editor)
- `book_type` (Single Line Textbox)
- `price` (Number)
- `number_of_pages` (Number)
- `bookimage` (File)
- `tags` (Multiple Choice)

## Testing

### Test BookInfo Content Type
```bash
curl http://localhost:3000/api/books
```

### Test NewBookInfo Content Type  
```bash
curl http://localhost:3000/api/new-arrivals
```

## Benefits of This Approach

1. **Clear Separation**: Books and new arrivals are completely separate
2. **No Environment Complexity**: Uses single environment with different content types
3. **Easy Management**: Publishers can easily distinguish between regular books and new arrivals
4. **Flexible**: Can have different fields or validation rules for each content type if needed
5. **Scalable**: Easy to add more content types for different book categories

## Migration from Multi-Environment Approach

If you were previously using multiple environments:
1. Create the `NewBookInfo` content type as an exact copy of `BookInfo`
2. Move entries from the `new_book` environment to `NewBookInfo` content type in your main environment
3. Update your publishing workflow to use the appropriate content type
