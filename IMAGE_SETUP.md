# Image Setup Guide

## Required Images

You need to save two images to complete the website design:

### 1. Homepage Background - Library Image

**Location:** `/public/library-background.jpg`

**Description:** The beautiful wooden library interior with large arched windows and bookshelves

**Usage:** Homepage hero section background

**Result:** Once saved, the homepage will display with:
- The library image as the full background
- A dark overlay for text readability
- Large, bold white text
- Professional styling

---

### 2. Request Book Page Illustration

**Location:** `/public/request_book.png`

**Description:** The illustration showing a person reaching for a glowing book on a bookshelf

**Usage:** Request Book page hero section

**Result:** Once saved, the Request Book page will display with:
- Beautiful two-column layout
- Animated floating illustration
- Modern stats display
- Clean, professional form design

---

## How to Save the Images

1. Save the **library background image** as:
   ```
   /public/library-background.jpg
   ```

2. Save the **request book illustration** as:
   ```
   /public/request_book.png
   ```

## Alternative Images

If you want to use different images:

**For Homepage:**
- Update path in `/components/book-discovery-hero.tsx` line 9

**For Request Book Page:**
- Update path in `/app/request-book/page.tsx` line 147

Both components are fully configured and will display beautifully once the images are in place! 🎨📚

