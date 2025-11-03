# Personalization Debugging Guide

This guide helps you debug personalization issues on your deployed website at https://contentstack-books-demo.contentstackapps.com/

## Issue: Recommendations Not Showing After Viewing War Books

### Root Causes

1. **Corrupted LocalStorage Data**: Old data from before the `viewedGenres` fix
2. **Missing Genre Tracking**: The `viewedGenres` array might be empty or malformed
3. **Browser Cache**: Old JavaScript code might be cached

---

## Quick Fix Steps

### Step 1: Open Browser Console

1. Go to https://contentstack-books-demo.contentstackapps.com/books
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the "Console" tab

### Step 2: Check Current LocalStorage State

Run this in the console:

```javascript
// Check user behavior data
const behavior = JSON.parse(localStorage.getItem('user-behavior'));
console.log('📊 User Behavior:', behavior);
console.log('👀 Viewed Genres:', behavior?.viewedGenres);
console.log('📚 Viewed Books:', behavior?.viewedBooks);

// Check user preferences
const prefs = JSON.parse(localStorage.getItem('user-preferences'));
console.log('⭐ User Preferences:', prefs);
console.log('💕 Favorite Genres:', prefs?.favoriteGenres);

// Check storage version
console.log('📦 Storage Version:', localStorage.getItem('storage-version'));
```

### Step 3: Look for Debug Logs

After clicking on a War book and then going to `/books`, you should see these logs:

```
🔄 LocalStorage Migration Check
📦 Stored version: 2.0.0
📦 Current version: 2.0.0
✅ LocalStorage is up to date

🔍 Checking user genre preferences...
📊 Raw behavior data: exists
📖 Parsed behavior: {...}
👀 Viewed genres: ["War"]
🎯 Available experiences: ["War", "Biography"]
✅ User recently viewed War books - using War experience
```

### Step 4: Force Clear and Retry (If Needed)

If you see errors or the `viewedGenres` is not an array:

```javascript
// Clear all personalization data
localStorage.removeItem('user-behavior');
localStorage.removeItem('user-preferences');
localStorage.removeItem('storage-version');

// Reload the page
location.reload();
```

Then:
1. Click on a War book
2. Go back to `/books`
3. You should see War recommendations

---

## Expected Behavior

### When You Click on a War Book:

1. **Console logs should show:**
   ```
   🎯 PERSONALIZATION: VIEW_BOOK Event
   📊 Event Data: { bookId: "...", genre: "War", ... }
   📖 Updated viewed genres for Lytics: ["War"]
   ```

2. **LocalStorage should update:**
   - `user-behavior.viewedGenres` should include `"War"`
   - `user-preferences.favoriteGenres` might include `"War"`

### When You Visit `/books`:

1. **Console logs should show:**
   ```
   📚 Getting Curated Books
   📖 Total books with images: X
   🎯 Preferred genre: War
   👆 Has War interaction: true
   📚 Prioritizing War books for recommendations
   ✅ Found X War books
   ```

2. **UI should show:**
   - "⚔️ War Books Focus" badge
   - "War Books Experience Active" subtitle
   - War books appear first in the recommendations

---

## Common Issues & Solutions

### Issue 1: `viewedGenres is not iterable`

**Solution:** This was fixed in the latest code. Clear localStorage and reload:

```javascript
localStorage.clear();
location.reload();
```

### Issue 2: No Recommendations Showing at All

**Check:**
1. Are you on exactly `/books` (not `/books?genre=War`)?
2. Do any books have images? The component only shows books with images.

**Debug in console:**
```javascript
// Check if books have images
const books = Array.from(document.querySelectorAll('.book-card-curated'));
console.log('📚 Books in recommendations:', books.length);
```

### Issue 3: Wrong Genre Recommendations

**Check:**
```javascript
const behavior = JSON.parse(localStorage.getItem('user-behavior'));
console.log('Most recent genre:', behavior?.viewedGenres[behavior.viewedGenres.length - 1]);
```

The most recently viewed genre takes priority.

### Issue 4: Recommendations Not Updating

**Solution:**
1. The page might be cached. Hard reload: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache for the site

---

## Testing Procedure

### Full Test Flow:

1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Go to a War book:**
   - Click on any War book from the collection
   - Check console for "📖 Updated viewed genres for Lytics: ["War"]"

3. **Go to /books page:**
   - Navigate to https://contentstack-books-demo.contentstackapps.com/books
   - Check console for "🎯 Preferred genre: War"
   - Check UI for "⚔️ War Books Focus" badge

4. **Verify recommendations:**
   - War books should appear first
   - Should show "War Recommendations" title

---

## Advanced Debugging

### Check Migration Status:

```javascript
// Run the migration manually
async function checkMigration() {
  const { migrateLocalStorage, getStorageDebugInfo } = await import('/utils/localstorage-migration');
  
  console.log('Running migration...');
  migrateLocalStorage();
  
  console.log('Debug info:', getStorageDebugInfo());
}

checkMigration();
```

### Monitor Storage Changes:

```javascript
// Watch for storage changes
window.addEventListener('storage', (e) => {
  console.log('🔔 Storage changed:', e.key, e.newValue);
});

// Or manually check after actions
const original = localStorage.getItem('user-behavior');
// ... do some action ...
const updated = localStorage.getItem('user-behavior');
console.log('Changed:', original !== updated);
```

### Export Debug Data:

```javascript
// Copy all personalization data for debugging
const debugData = {
  behavior: JSON.parse(localStorage.getItem('user-behavior') || 'null'),
  preferences: JSON.parse(localStorage.getItem('user-preferences') || 'null'),
  version: localStorage.getItem('storage-version'),
  userAgent: navigator.userAgent,
  timestamp: new Date().toISOString()
};

console.log('📋 Debug data to share:', JSON.stringify(debugData, null, 2));
// Copy from console and share
```

---

## Environment Variables Check

Make sure your deployed app has these environment variables set:

```bash
# Contentstack
CONTENTSTACK_API_KEY=your_api_key
CONTENTSTACK_DELIVERY_TOKEN=your_token
CONTENTSTACK_ENVIRONMENT=production

# Lytics (if using)
NEXT_PUBLIC_LYTICS_CID=your_lytics_cid

# Hosted URL
NEXT_PUBLIC_HOSTED_URL=https://contentstack-books-demo.contentstackapps.com
```

---

## Need More Help?

If the issue persists after trying these steps:

1. **Share console logs**: Copy the full console output when navigating from a War book to `/books`
2. **Share localStorage data**: Use the "Export Debug Data" script above
3. **Share network requests**: Check the Network tab for any failed API calls
4. **Browser info**: Which browser and version you're using

---

## Changes Made to Fix This Issue

1. ✅ Added `Array.isArray()` checks for `viewedGenres` everywhere
2. ✅ Created automatic localStorage migration on page load
3. ✅ Added extensive debug logging to track personalization flow
4. ✅ Fixed corrupted data handling in `personalization-context.tsx`
5. ✅ Added safety checks in `lytics-experience-widget.tsx`

After deploying these changes, the issue should be resolved! 🎉

