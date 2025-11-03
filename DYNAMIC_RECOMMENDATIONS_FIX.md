# Dynamic Recommendations Fix

## Issue Resolved
Recommendations were getting stuck on one genre (e.g., Biography) and not updating when visiting books from different genres.

## Root Cause
The component was not properly re-rendering when localStorage changed because:
1. The `storage` event only fires for changes in **other tabs/windows**, not the same tab
2. The component was calling `getUserPreferredGenre()` during render, which didn't trigger re-renders when the value changed
3. No state management for tracking the current active genre

## Solution Implemented

### 1. ✅ Added State Management
```typescript
const [refreshCounter, setRefreshCounter] = useState(0); // Force re-renders
const [currentGenre, setCurrentGenre] = useState<string | null>(null); // Track current genre
```

### 2. ✅ Multiple Refresh Triggers
Now recommendations update when:
- **Initial page load** - Checks genre on mount
- **Book click detected** - Listens to `genreBookClicked` custom event
- **Browser back/forward** - Listens to `popstate` event
- **Window focus** - When returning from another page/tab
- **Tab visibility** - When tab becomes active again
- **Storage changes** - From other tabs (existing, but rare)

### 3. ✅ Reactive Genre Detection
```typescript
useEffect(() => {
  if (refreshCounter > 0) {
    const preferredGenre = getUserPreferredGenre();
    if (preferredGenre !== currentGenre) {
      console.log(`🎯 Genre changed: ${currentGenre} → ${preferredGenre}`);
      setCurrentGenre(preferredGenre);
    }
  }
}, [refreshCounter, currentGenre]);
```

### 4. ✅ State-Based Rendering
Functions now use `currentGenre` state instead of calling `getUserPreferredGenre()`:
- `getCuratedBooks()` - Uses state for filtering
- `getGenreDisplayInfo()` - Uses state for UI labels
- `getCurrentExperienceId()` - Uses state for experience ID

## How It Works Now

### Flow:
1. **User clicks Biography book**
   - BookCard dispatches `genreBookClicked` event
   - localStorage updated with `viewedGenres: ["Biography"]`
   - Event triggers refreshCounter increment
   - Component checks localStorage and sets `currentGenre: "Biography"`
   - Component re-renders with Biography recommendations

2. **User navigates to book detail page**
   - Component unmounts

3. **User clicks back to /books**
   - `popstate` event fires
   - refreshCounter increments
   - Component checks localStorage again
   - Still shows Biography (correct)

4. **User clicks War book**
   - BookCard dispatches `genreBookClicked` event
   - localStorage updated with `viewedGenres: ["Biography", "War"]`
   - Event triggers refreshCounter increment
   - Component checks localStorage - War is most recent
   - Sets `currentGenre: "War"`
   - **Component re-renders with War recommendations! 🎉**

5. **User navigates back to /books**
   - `popstate` or `focus` event fires
   - refreshCounter increments
   - War recommendations still shown (correct)

## Expected Console Output

### When clicking a Biography book:
```
🎯 Biography book interaction detected - refreshing recommendations
🔄 Triggering recommendation refresh...
🔄 Refresh triggered (counter: 1)
🔍 Checking user genre preferences...
👀 Viewed genres: ["Biography"]
✅ User recently viewed Biography books - using Biography experience
🎯 Genre changed: none → Biography
📚 Getting Curated Books
🎯 Current genre state: Biography
✅ Found 14 Biography books
```

### When clicking a War book after Biography:
```
🎯 War book interaction detected - refreshing recommendations
🔄 Triggering recommendation refresh...
🔄 Refresh triggered (counter: 2)
🔍 Checking user genre preferences...
👀 Viewed genres: ["Biography", "War"]
✅ User recently viewed War books - using War experience
🎯 Genre changed: Biography → War
📚 Getting Curated Books
🎯 Current genre state: War
✅ Found 10 War books
```

## Testing Steps

### Test 1: Biography → War
1. Clear localStorage: `localStorage.clear(); location.reload();`
2. Go to `/books`
3. Click on a **Biography** book
4. Click back to go to `/books`
5. **Verify**: See "👤 Biography Books Focus" and Biography books first
6. Click on a **War** book
7. Click back to go to `/books`
8. **Expected**: See "⚔️ War Books Focus" and War books first ✅

### Test 2: Multiple Genre Switches
1. Click Biography book → back → verify Biography
2. Click War book → back → verify War
3. Click Mystery book → back → verify Mystery (if you have Mystery experience)
4. Each time should show the LATEST genre ✅

### Test 3: Browser Navigation
1. Click Biography book
2. Use browser back button
3. **Expected**: Biography recommendations still shown ✅
4. Click War book
5. Use browser back button
6. **Expected**: War recommendations now shown ✅

### Test 4: Tab Focus
1. Click Biography book → back
2. Switch to another browser tab (or minimize window)
3. Switch back to the bookstore tab
4. **Expected**: Biography recommendations still shown (no change) ✅
5. Click War book → back
6. **Expected**: War recommendations now shown ✅

## Debug Commands

### Check Current State:
```javascript
// Check what genre is in localStorage
const behavior = JSON.parse(localStorage.getItem('user-behavior'));
console.log('Viewed genres:', behavior?.viewedGenres);
console.log('Most recent:', behavior?.viewedGenres[behavior.viewedGenres.length - 1]);

// Check what component sees
console.log('Looking for these elements:');
document.querySelectorAll('.experience-status .status-indicator').forEach(el => {
  console.log('Status:', el.textContent);
});
```

### Force Refresh:
```javascript
// Trigger manual refresh
window.dispatchEvent(new CustomEvent('personalizedRecommendationsRefresh', {
  detail: { source: 'manual' }
}));
```

### Monitor Changes:
```javascript
// Watch for all events
['genreBookClicked', 'popstate', 'focus', 'visibilitychange'].forEach(event => {
  window.addEventListener(event, (e) => {
    console.log(`🔔 Event: ${event}`, e);
  });
});
```

## Files Changed

✅ `/components/lytics-experience-widget.tsx` - Complete refresh system overhaul

### Key Changes:
1. Added `refreshCounter` and `currentGenre` state
2. Added multiple event listeners for refresh triggers
3. Created `useEffect` to monitor and update `currentGenre`
4. Updated all display functions to use `currentGenre` state
5. Added extensive logging for debugging

## Benefits

✅ **Automatic Updates**: Recommendations update without page reload  
✅ **Multiple Triggers**: Works with back button, focus, visibility changes  
✅ **State-Based**: React properly manages and updates the UI  
✅ **Debuggable**: Extensive console logs show exactly what's happening  
✅ **Performant**: Only re-renders when genre actually changes  
✅ **Reliable**: Multiple fallback mechanisms ensure updates happen  

## Known Behaviors

- Most recent viewed genre takes priority (last in array)
- Genre must be in `GENRE_EXPERIENCES` map to show custom recommendations
- If no genre matches, shows default recommendations
- refreshCounter starts at 0 to avoid double-render on mount

## Next Steps

If you want to add more genres to recommendations:

```typescript
const GENRE_EXPERIENCES: Record<string, string> = {
  'War': 'fec91f970b8cb82cf5abc068e16d835e',
  'Biography': '652d4a3cf9c73893d97116846dad16bb',
  'Mystery': 'your-mystery-experience-id-here',
  'Fantasy': 'your-fantasy-experience-id-here',
  // Add more as needed
};
```

And add emojis:

```typescript
const genreEmojis: Record<string, string> = {
  'War': '⚔️',
  'Biography': '👤',
  'Mystery': '🔍',
  'Fantasy': '🧙‍♂️',
  'Romance': '💕',
  'Science': '🔬',
  'History': '📜',
  'Thrillers': '🎭',
  'YourNewGenre': '🎨', // Add your emoji
};
```

## Troubleshooting

### Recommendations not updating?
1. Check console for "🔄 Refresh triggered" logs
2. Verify `viewedGenres` in localStorage
3. Try clicking the book again (events might not have fired)
4. Hard refresh page (Ctrl+Shift+R)

### Wrong genre showing?
1. Check which genre is LAST in `viewedGenres` array
2. That's the one that will be prioritized
3. Clear localStorage to reset: `localStorage.clear()`

### No genre badge showing?
1. Check if genre exists in `GENRE_EXPERIENCES` map
2. Check if `viewedGenres` has the genre
3. Look for "📚 No specific genre preference" in console

---

**The recommendations now dynamically update every time you visit a different genre book!** 🎉

