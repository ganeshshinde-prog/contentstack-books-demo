# Lytics Setup Checklist ✅

## Quick Setup Guide to Enable Lytics-Powered Personalization

### Step 1: Deploy the Code ✅
```bash
git add .
git commit -m "Add Lytics audience-based personalization"
git push
```

---

### Step 2: Create Lytics Audiences 🎯

Login to your Lytics dashboard and create these audiences:

#### 1. War Books Audience
- **Name**: `war_books`
- **Description**: Users interested in War books
- **Conditions**:
  ```
  ANY of:
  - book_genre equals "War"
  - event equals "book_viewed" AND book_genre equals "War"
  ```
- **Save & Publish**

#### 2. Biography Books Audience
- **Name**: `biography_books`
- **Description**: Users interested in Biography books
- **Conditions**:
  ```
  ANY of:
  - book_genre equals "Biography"
  - event equals "book_viewed" AND book_genre equals "Biography"
  ```
- **Save & Publish**

#### 3. Fantasy Books Audience (Optional)
- **Name**: `fantasy_books`
- **Conditions**: `book_genre equals "Fantasy"`

#### 4. Mystery Books Audience (Optional)
- **Name**: `mystery_books`
- **Conditions**: `book_genre equals "Mystery"`

---

### Step 3: Test the Integration 🧪

1. **Open your site** in incognito mode
2. **Open browser console** (F12)
3. Look for these logs:
   ```
   🚀 Initializing Lytics Personalization Service...
   ✅ jstag is ready
   ✅ Lytics Personalization Service ready
   ```

4. **Click on a War book**
5. **Wait 2-3 seconds** (Lytics processes the event)
6. **Go back to /books**
7. Look for:
   ```
   🔄 Refreshing Lytics audience data...
   ✅ Lytics data refreshed
   👥 User audiences: [{name: "war_books"}]
   ✅ Lytics says: War
   ```

8. **Check the UI**:
   - Should see "⚔️ War Books Focus"
   - Subtitle should say "Powered by Lytics Audiences"

---

### Step 4: Verify in Lytics Dashboard 👥

1. Go to **Lytics → Audiences**
2. Click on `war_books` audience
3. Check **Population** - should have users
4. Click **View Users**
5. Find your test user (by seerid)
6. Verify they're in the audience

---

## Console Commands for Testing

### Check Lytics Service Status:
```javascript
// Get Lytics service instance
const checkLytics = async () => {
  const { default: service } = await import('/lib/lytics-personalization-service');
  
  console.log('=== LYTICS STATUS ===');
  console.log('Ready:', service.isServiceReady());
  console.log('Lytics ID:', service.getLyticsId());
  console.log('Audiences:', service.getUserAudiences());
  console.log('Preferred Genre:', service.getPreferredGenreFromAudiences());
  console.log('Is New Visitor:', service.isNewVisitor());
};

checkLytics();
```

### Manually Refresh Lytics Data:
```javascript
const refreshLytics = async () => {
  const { default: service } = await import('/lib/lytics-personalization-service');
  await service.refresh();
  console.log('Refreshed! New audiences:', service.getUserAudiences());
};

refreshLytics();
```

### Check Which Source Is Being Used:
```javascript
// In /books page console
const info = document.querySelector('.experience-subtitle')?.textContent;
console.log('Source:', info);

// Should say either:
// "Powered by Lytics Audiences" ← Using Lytics! ✅
// or
// "War Books Experience Active" ← Using localStorage fallback
```

---

## Expected Behavior

### For New Users:
1. **First visit** → No Lytics data yet
   - Uses localStorage fallback
   - Shows "✅ Personalized"
   
2. **After clicking War book** → Lytics processes
   - Event sent to Lytics
   - Takes 1-3 seconds to process
   - User added to war_books audience
   
3. **Next visit** → Lytics data available!
   - Shows "⚔️ War Books Focus"
   - Subtitle: "Powered by Lytics Audiences"
   - Console: "✅ Lytics says: War"

### For Returning Users:
- **Immediate personalization** from Lytics
- **Cross-device** - Works on mobile and desktop with same seerid
- **Real-time** - Updates as user behavior changes

---

## Troubleshooting

### ❌ Not seeing "Powered by Lytics Audiences"?

**Checklist:**
- [ ] Lytics audiences created with correct names
- [ ] User has clicked on books (events sent)
- [ ] Waited 2-3 seconds for Lytics to process
- [ ] Refreshed the /books page
- [ ] Check Lytics dashboard - user in audience?

### ❌ Console shows "Lytics not ready"?

**Checklist:**
- [ ] jstag script loaded in layout.tsx
- [ ] Correct CID in jstag.init()
- [ ] Network tab shows Lytics scripts loaded
- [ ] No errors in console

### ❌ Events sending but no audiences?

**Checklist:**
- [ ] Audience conditions match event data
- [ ] book_genre field name is correct
- [ ] Audience is published (not draft)
- [ ] Allow time - can take a few seconds

---

## Quick Reference: Audience Naming

| Lytics Audience Name | Genre Detected | Required Condition |
|---------------------|----------------|-------------------|
| `war_books` | War | book_genre = "War" |
| `war_enthusiasts` | War | book_genre = "War" |
| `war_audience` | War | book_genre = "War" |
| `biography_books` | Biography | book_genre = "Biography" |
| `biography_readers` | Biography | book_genre = "Biography" |
| `fantasy_books` | Fantasy | book_genre = "Fantasy" |
| `mystery_books` | Mystery | book_genre = "Mystery" |
| `thriller_fans` | Thrillers | book_genre = "Thrillers" |

**Or** name can **contain** the keyword (case insensitive):
- Contains "war" → War
- Contains "biography" → Biography
- etc.

---

## Success Criteria ✅

You'll know it's working when:

1. ✅ Console shows:
   ```
   ✅ Lytics ready - checking genre from audiences
   👥 User audiences: [{name: "war_books", ...}]
   ✅ Lytics says: War
   ```

2. ✅ UI shows:
   - "⚔️ War Books Focus" badge
   - "Powered by Lytics Audiences" subtitle

3. ✅ Lytics Dashboard shows:
   - Audiences have users
   - Events are being received
   - User profiles are building

4. ✅ Recommendations change based on Lytics audiences

---

## Need Help?

### Debugging Commands:
```javascript
// 1. Check if jstag is loaded
console.log('jstag available:', typeof window.jstag !== 'undefined');

// 2. Get Lytics ID
console.log('Lytics ID:', window.jstag?.getid());

// 3. Get raw user entity
window.jstag?.call('getEntity', (entity) => {
  console.log('Raw Lytics entity:', entity);
});

// 4. Check service
import('/lib/lytics-personalization-service').then(m => {
  console.log('Service:', m.default);
  console.log('Ready:', m.default.isServiceReady());
  console.log('Audiences:', m.default.getUserAudiences());
});
```

---

## What's Different Now?

### Before:
```
localStorage → Filter books → Show recommendations
```
- ❌ No Lytics audience data used
- ❌ No cross-device sync
- ❌ Just event tracking

### After:
```
Lytics Audiences → Map to genre → Filter books → Show recommendations
        ↓ (fallback)
    localStorage
```
- ✅ Real Lytics audience segmentation
- ✅ Cross-device personalization
- ✅ Actually using Lytics intelligence
- ✅ Graceful fallback

---

## Deployment Checklist

- [ ] Code deployed
- [ ] Lytics audiences created
- [ ] Audiences published (not draft)
- [ ] Tested in incognito mode
- [ ] Verified in Lytics dashboard
- [ ] Console logs confirm Lytics data
- [ ] UI shows "Powered by Lytics Audiences"
- [ ] Recommendations update based on audiences

**Once all checked, you're fully integrated with Lytics!** 🎉

---

## Support Files

- **Full Setup Guide**: `/LYTICS_PATHFORA_SETUP.md`
- **Usage Analysis**: `/LYTICS_USAGE_ANALYSIS.md`
- **Service Code**: `/lib/lytics-personalization-service.ts`
- **Component Code**: `/components/lytics-experience-widget.tsx`

**You're now using real Lytics personalization!** 🚀

