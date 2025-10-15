# Contentstack Entry Creation Guide

## 🎯 **What You Need:**

1. **Management Token** - Get it from Contentstack Dashboard
2. **API Key** - ✅ Already have: `blte1f8c41539d5f7e3`
3. **Content Type UIDs** - ✅ Already know: `bookinfo`, `newbookinfo`

## 🔧 **Getting Your Management Token:**

1. Go to [Contentstack Dashboard](https://app.contentstack.com/)
2. Navigate to **Settings** → **Tokens**
3. Click **+ Create Token**
4. Choose **Management Token**
5. Give it a name like "API Entry Creation"
6. Select permissions:
   - ✅ **Content Management** → **Create**, **Read**, **Update**, **Publish**
   - ✅ **Asset Management** → **Create**, **Read** (for images)
7. Copy the generated token

## 🚀 **Quick Start:**

### Method 1: Using the Shell Script (Recommended)
```bash
# Set your management token
export CONTENTSTACK_MANAGEMENT_TOKEN=your_token_here

# Create a test book
./create-contentstack-entries.sh create-test

# List existing entries
./create-contentstack-entries.sh list bookinfo

# Create a specific book
./create-contentstack-entries.sh create-bookinfo \
  "My API Book" \
  "John Doe" \
  "Technology" \
  599 \
  300 \
  "A book created via API"
```

### Method 2: Using Node.js Script
```bash
# Set your management token
export CONTENTSTACK_MANAGEMENT_TOKEN=your_token_here

# Create a test book
node create-contentstack-entries.js create-test

# Upload ZincSearch data to Contentstack
node create-contentstack-entries.js upload-zincsearch

# List existing entries
node create-contentstack-entries.js list bookinfo
```

### Method 3: Direct cURL (Manual)
```bash
# Create a BookInfo entry
curl -X POST "https://api.contentstack.io/v3/content_types/bookinfo/entries" \
  -H "Content-Type: application/json" \
  -H "api_key: blte1f8c41539d5f7e3" \
  -H "authorization: YOUR_MANAGEMENT_TOKEN" \
  -d '{
    "entry": {
      "title": "API Created Book",
      "author": "API Author",
      "book_type": "Technology",
      "price": 499,
      "number_of_pages": 250,
      "book_description": "This book was created via API",
      "tags": ["api", "technology"]
    }
  }'
```

## 📊 **What the Scripts Can Do:**

### ✅ **Supported Operations:**
- ✅ Create `BookInfo` entries
- ✅ Create `NewBookInfo` entries  
- ✅ Publish entries to environments
- ✅ List existing entries
- ✅ Bulk upload from ZincSearch data
- ✅ Handle errors and validation

### 🔄 **Workflow:**
1. **Create Entry** → Gets UID
2. **Publish Entry** → Makes it live
3. **Verify** → Check in your app

## 🎮 **Live Example:**

Once you have the management token, I can immediately:

```bash
# Create a book based on your ZincSearch data
./create-contentstack-entries.sh create-bookinfo \
  "The Great Gatsby" \
  "F. Scott Fitzgerald" \
  "Classic Literature" \
  450 \
  180 \
  "A classic American novel set in the summer of 1922, chronicling the decadence and excess of the Jazz Age through the eyes of narrator Nick Carraway."
```

## 📈 **Advanced Features:**

### Bulk Upload ZincSearch → Contentstack
```bash
# Upload all 15 books from ZincSearch to Contentstack
node create-contentstack-entries.js upload-zincsearch
```

### Custom Book Creation
```javascript
// In the Node.js script, you can customize:
const bookData = {
  title: 'Your Custom Book',
  author: 'Your Name', 
  genre: 'Your Genre',
  price: 599,
  pages: 300,
  description: 'Your description...',
  tags: ['custom', 'api-created']
};
```

## 🛡️ **Security Notes:**
- ✅ Management token is passed via environment variable
- ✅ No tokens stored in code
- ✅ Proper error handling
- ✅ Rate limiting consideration (1 second delays)

## 🔍 **Testing Without Token:**
You can run the scripts now to see the exact error messages and requirements - they'll guide you through the token setup process.

---

**Ready to create entries?** Just get your management token and run any of the commands above! 🚀
