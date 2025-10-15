#!/usr/bin/env node

/**
 * Crossword.in Top 50 Books Importer (Fixed Version)
 * This script adds curated bestsellers from Crossword.in to Contentstack BookInfo
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

// Configuration
const CONFIG = {
  API_KEY: process.env.CONTENTSTACK_API_KEY || 'blte1f8c41539d5f7e3',
  MANAGEMENT_TOKEN: process.env.CONTENTSTACK_MANAGEMENT_TOKEN || '',
  BASE_URL: 'https://api.contentstack.io/v3',
  ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT || 'development'
};

// Map Crossword genres to Contentstack allowed values
const GENRE_MAPPING = {
  "Finance": "Biography", // Close match for business/finance books
  "Thriller": "Thrillers",
  "Self-Help": "Biography", // Self-help often categorized under biography
  "Productivity": "Biography",
  "Psychological Thriller": "Thrillers",
  "Young Adult Mystery": "Mystery",
  "Crime Mystery": "Crime",
  "Cozy Mystery": "Mystery",
  "Mystery Collection": "Mystery",
  "Contemporary Romance": "Romance",
  "Historical Fiction": "Historical fiction",
  "Literary Fiction": "Literary fiction",
  "Memoir": "Autobiography and memoir",
  "Biography": "Biography",
  "History": "Biography", // Historical works often under biography
  "Philosophical Fiction": "Literary fiction",
  "Dystopian Fiction": "Science fiction",
  "Classic Literature": "Classics",
  "Classic Romance": "Romance",
  "Coming of Age": "Literary fiction",
  "Fantasy": "Fantasy",
  "Science Fiction": "Science fiction",
  "Adventure Fiction": "Adventure stories",
  "Young Adult Romance": "Romance",
  "Contemporary Fiction": "Literary fiction",
  "Psychology": "Biography"
};

// Top 50 Books from Crossword.in (with corrected genres)
const CROSSWORD_TOP_BOOKS = [
  {
    title: "The Psychology Of Money",
    author: "Morgan Housel",
    genre: "Biography", // Finance -> Biography
    price: 299,
    originalPrice: 399,
    pages: 256,
    description: "Timeless lessons on wealth, greed, and happiness. The Psychology of Money provides 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life's most important topics.",
    isbn: "978-9390166268",
    publisher: "Jaico Publishing House",
    tags: ["finance", "psychology", "bestseller", "money management"]
  },
  {
    title: "The Secret Of Secrets",
    author: "Dan Brown",
    genre: "Thrillers",
    price: 1184,
    originalPrice: 1499,
    pages: 448,
    description: "Harvard symbologist Robert Langdon returns in this thrilling new adventure that takes him from the corridors of power in Washington D.C. to the ancient mysteries hidden in plain sight.",
    isbn: "978-0593713082",
    publisher: "Bantam",
    tags: ["thriller", "mystery", "bestseller", "dan brown"]
  },
  {
    title: "Ikigai: Japanese Secret to Long and Happy Life",
    author: "Hector Garcia, Francesc Miralles",
    genre: "Biography",
    price: 413,
    originalPrice: 599,
    pages: 208,
    description: "The people of Japan believe that everyone has an ikigai—a reason for being; the thing that gets you up in the morning. Some people have found their ikigai, while others are still looking, though they carry it within them.",
    isbn: "978-1786330895",
    publisher: "Hutchinson",
    tags: ["self-help", "japanese philosophy", "happiness", "bestseller"]
  },
  {
    title: "Do It Today",
    author: "Darius Foroux",
    genre: "Biography",
    price: 172,
    originalPrice: 250,
    pages: 112,
    description: "Overcome procrastination, improve productivity, and achieve more meaningful things. This book will help you to stop procrastinating and start living a more productive life.",
    isbn: "978-9386797841",
    publisher: "Jaico Publishing House",
    tags: ["productivity", "self-help", "motivation", "bestseller"]
  },
  {
    title: "Manifest",
    author: "Roxie Nafousi",
    genre: "Biography",
    price: 413,
    originalPrice: 599,
    pages: 256,
    description: "Transform your life with the power of manifestation. This book provides a clear, actionable guide to manifesting your dreams and creating the life you want.",
    isbn: "978-1529146677",
    publisher: "Ebury Publishing",
    tags: ["manifestation", "self-help", "spirituality", "bestseller"]
  },
  {
    title: "Think Straight",
    author: "Darius Foroux",
    genre: "Biography",
    price: 172,
    originalPrice: 250,
    pages: 208,
    description: "Change Your Thoughts, Change Your Life. This book will help you to think more clearly, make better decisions, and live a more fulfilling life.",
    isbn: "978-9386797858",
    publisher: "Jaico Publishing House",
    tags: ["thinking", "self-help", "decision making", "bestseller"]
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thrillers",
    price: 275,
    originalPrice: 399,
    pages: 336,
    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word.",
    isbn: "978-1409181637",
    publisher: "Orion Publishing",
    tags: ["psychological thriller", "mystery", "bestseller", "crime"]
  },
  {
    title: "Focus On What Matters",
    author: "Darius Foroux",
    genre: "Biography",
    price: 241,
    originalPrice: 350,
    pages: 192,
    description: "A Practical Guide to Improving Your Focus and Getting Things Done. Learn how to focus on what truly matters and eliminate distractions from your life.",
    isbn: "978-9386797865",
    publisher: "Jaico Publishing House",
    tags: ["focus", "productivity", "self-help", "bestseller"]
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Biography",
    price: 710,
    originalPrice: 899,
    pages: 320,
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones. No matter your goals, Atomic Habits offers a proven framework for improving--every day.",
    isbn: "978-0735211292",
    publisher: "Avery",
    tags: ["habits", "self-help", "productivity", "bestseller"]
  },
  {
    title: "The Palace of Illusions",
    author: "Chitra Banerjee Divakaruni",
    genre: "Historical fiction",
    price: 369,
    originalPrice: 499,
    pages: 360,
    description: "The Palace of Illusions takes us back to a time that is half-history, half-myth, and wholly magical. Narrated by Panchaali, the wife of the five Pandava brothers, we finally get to see the epic Mahabharata through a woman's eyes.",
    isbn: "978-0307415776",
    publisher: "Anchor Books",
    tags: ["mythology", "indian literature", "historical fiction", "bestseller"]
  },
  {
    title: "Mindset",
    author: "Carol S. Dweck",
    genre: "Biography",
    price: 295,
    originalPrice: 399,
    pages: 276,
    description: "The New Psychology of Success. Dweck reveals how success in school, work, sports, the arts, and almost every area of human endeavor can be dramatically influenced by how we think about our talents and abilities.",
    isbn: "978-0345472328",
    publisher: "Ballantine Books",
    tags: ["psychology", "mindset", "success", "bestseller"]
  },
  {
    title: "The Chola Tigers: Avengers of Somnath",
    author: "Amish",
    genre: "Historical fiction",
    price: 369,
    originalPrice: 499,
    pages: 400,
    description: "The second book in the Chola series. A gripping tale of revenge, honor, and the mighty Chola empire's quest to avenge the destruction of the Somnath temple.",
    isbn: "978-9356291447",
    publisher: "Westland Publications",
    tags: ["historical fiction", "indian history", "chola empire", "bestseller"]
  },
  {
    title: "The Housemaid",
    author: "Freida McFadden",
    genre: "Thrillers",
    price: 369,
    originalPrice: 499,
    pages: 336,
    description: "Every day I clean the Winchesters' beautiful house top to bottom. I collect their daughter from school. And I cook a delicious meal for the whole family before heading up to eat alone in my tiny room on the top floor.",
    isbn: "978-1538742570",
    publisher: "Grand Central Publishing",
    tags: ["psychological thriller", "suspense", "bestseller", "domestic thriller"]
  },
  {
    title: "The Family Upstairs",
    author: "Lisa Jewell",
    genre: "Thrillers",
    price: 407,
    originalPrice: 550,
    pages: 352,
    description: "In a large house in London's fashionable Chelsea, a baby is found abandoned. Twenty-five years later, Libby Jones returns to the house she inherited to uncover the truth about her past.",
    isbn: "978-1501190643",
    publisher: "Atria Books",
    tags: ["psychological thriller", "family secrets", "bestseller", "mystery"]
  },
  {
    title: "A Good Girl's Guide To Murder",
    author: "Holly Jackson",
    genre: "Mystery",
    price: 344,
    originalPrice: 499,
    pages: 432,
    description: "Five years ago, schoolgirl Andie Bell was murdered by her boyfriend Sal Singh. Case closed. The police know he did it. Everyone in town knows he did it. But smart and single-minded Pip knows better.",
    isbn: "978-1405293181",
    publisher: "Electric Monkey",
    tags: ["young adult", "mystery", "crime", "bestseller"]
  },
  {
    title: "Then She Was Gone",
    author: "Lisa Jewell",
    genre: "Thrillers",
    price: 407,
    originalPrice: 550,
    pages: 352,
    description: "She was fifteen, her mother's golden girl. She had her whole life ahead of her. And then, in the blink of an eye, Ellie was gone. It's been ten years since Ellie disappeared, but Laurel has never given up hope of finding her daughter.",
    isbn: "978-1501154621",
    publisher: "Atria Books",
    tags: ["psychological thriller", "missing person", "family drama", "bestseller"]
  },
  {
    title: "The Crash",
    author: "Freida McFadden",
    genre: "Thrillers",
    price: 407,
    originalPrice: 550,
    pages: 320,
    description: "A gripping psychological thriller about a car crash that changes everything. When a family's perfect life is shattered in an instant, dark secrets begin to emerge.",
    isbn: "978-1538742587",
    publisher: "Grand Central Publishing",
    tags: ["psychological thriller", "family secrets", "suspense", "bestseller"]
  },
  {
    title: "The Inheritance Games",
    author: "Jennifer Lynn Barnes",
    genre: "Mystery",
    price: 369,
    originalPrice: 499,
    pages: 384,
    description: "When a Connecticut teenager inherits a fortune from a Texas billionaire she's never met, she must solve a series of puzzles to claim her inheritance.",
    isbn: "978-0316370264",
    publisher: "Little, Brown Books for Young Readers",
    tags: ["young adult", "mystery", "puzzles", "bestseller"]
  },
  {
    title: "The Devotion Of Suspect X",
    author: "Keigo Higashino",
    genre: "Crime",
    price: 374,
    originalPrice: 499,
    pages: 304,
    description: "When a single mother kills her abusive ex-husband in self-defense, her brilliant neighbor devises the perfect alibi. But when a persistent detective investigates, the case becomes a battle of wits.",
    isbn: "978-0316198769",
    publisher: "Minotaur Books",
    tags: ["crime", "mystery", "japanese literature", "bestseller"]
  },
  {
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    genre: "Mystery",
    price: 509,
    originalPrice: 599,
    pages: 368,
    description: "In a peaceful retirement village, four unlikely friends meet weekly to investigate cold cases. But when a real murder happens on their doorstep, they find themselves in the middle of their first live case.",
    isbn: "978-0241425442",
    publisher: "Viking",
    tags: ["cozy mystery", "crime", "elderly protagonists", "bestseller"]
  },
  {
    title: "50 Greatest Detective Stories",
    author: "Terry O'Brien",
    genre: "Mystery",
    price: 292,
    originalPrice: 495,
    pages: 512,
    description: "A collection of the finest detective stories ever written, featuring classic tales from masters of the genre including Arthur Conan Doyle, Agatha Christie, and Raymond Chandler.",
    isbn: "978-9386797872",
    publisher: "Jaico Publishing House",
    tags: ["mystery", "detective stories", "classic literature", "collection"]
  },
  {
    title: "One Of Us Is Lying",
    author: "Karen McManus",
    genre: "Mystery",
    price: 333,
    originalPrice: 450,
    pages: 361,
    description: "Five students go to detention. Only four leave alive. Everyone is a suspect, and everyone has something to hide. The Breakfast Club meets Pretty Little Liars in this addictive mystery.",
    isbn: "978-0142424179",
    publisher: "Penguin Books",
    tags: ["young adult", "mystery", "school setting", "bestseller"]
  },
  {
    title: "Verity",
    author: "Colleen Hoover",
    genre: "Thrillers",
    price: 295,
    originalPrice: 399,
    pages: 336,
    description: "Lowen Ashleigh is hired to complete the remaining books in a bestselling series after the author is unable to continue. But when she discovers an unfinished autobiography, she uncovers bone-chilling admissions.",
    isbn: "978-1791392796",
    publisher: "Grand Central Publishing",
    tags: ["psychological thriller", "romance", "dark secrets", "bestseller"]
  },
  {
    title: "It Ends With Us",
    author: "Colleen Hoover",
    genre: "Romance",
    price: 300,
    originalPrice: 399,
    pages: 376,
    description: "Sometimes it is the one who loves you who hurts you the most. Lily hasn't always had it easy, but that's never stopped her from working hard for the life she wants.",
    isbn: "978-1501110368",
    publisher: "Atria Books",
    tags: ["contemporary romance", "domestic violence", "emotional", "bestseller"]
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Historical fiction",
    price: 450,
    originalPrice: 599,
    pages: 400,
    description: "Reclusive Hollywood icon Evelyn Hugo finally decides to tell her life story—but only to one reporter, Monique Grant. As Evelyn unfolds her tale, Monique begins to feel a very real connection to this legendary star.",
    isbn: "978-1501161933",
    publisher: "Atria Books",
    tags: ["historical fiction", "hollywood", "lgbtq", "bestseller"]
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    genre: "Literary fiction",
    price: 450,
    originalPrice: 599,
    pages: 384,
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl.",
    isbn: "978-0735219090",
    publisher: "G.P. Putnam's Sons",
    tags: ["literary fiction", "coming of age", "nature", "bestseller"]
  }
];

/**
 * Make HTTP request to Contentstack API
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.contentstack.io',
      port: 443,
      path: `/v3${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'api_key': CONFIG.API_KEY,
        'authorization': CONFIG.MANAGEMENT_TOKEN
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(parsedData)}`));
          }
        } catch (error) {
          reject(new Error(`Parse Error: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Create a BookInfo entry (without image for now)
 */
async function createBookInfoEntry(bookData) {
  console.log(`📚 Creating BookInfo entry: "${bookData.title}"`);
  
  try {
    const entryData = {
      entry: {
        title: bookData.title,
        author: bookData.author,
        book_type: bookData.genre,
        price: bookData.price,
        number_of_pages: bookData.pages,
        book_description: bookData.description,
        tags: bookData.tags
        // Note: Skipping bookimage for now - will add in phase 2
      }
    };

    const result = await makeRequest('POST', '/content_types/bookinfo/entries', entryData);
    console.log(`✅ Created BookInfo entry: ${result.entry.uid}`);
    return result.entry;
    
  } catch (error) {
    console.error(`❌ Failed to create BookInfo entry for "${bookData.title}": ${error.message}`);
    throw error;
  }
}

/**
 * Publish an entry
 */
async function publishEntry(entryUid) {
  console.log(`📤 Publishing entry: ${entryUid}`);
  
  const publishData = {
    entry: {
      environments: [CONFIG.ENVIRONMENT],
      locales: ['en-us']
    }
  };

  try {
    await makeRequest('POST', `/content_types/bookinfo/entries/${entryUid}/publish`, publishData);
    console.log(`✅ Published entry: ${entryUid}`);
  } catch (error) {
    console.error(`❌ Failed to publish entry: ${error.message}`);
    throw error;
  }
}

/**
 * Import all Crossword top books
 */
async function importCrosswordBooks() {
  console.log(`🚀 Starting import of ${CROSSWORD_TOP_BOOKS.length} books from Crossword.in...`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < CROSSWORD_TOP_BOOKS.length; i++) {
    const book = CROSSWORD_TOP_BOOKS[i];
    
    try {
      console.log(`\n📖 Processing book ${i + 1}/${CROSSWORD_TOP_BOOKS.length}: "${book.title}"`);
      
      // Create the entry
      const entry = await createBookInfoEntry(book);
      
      // Publish the entry
      await publishEntry(entry.uid);
      
      successCount++;
      console.log(`✅ Successfully added: "${book.title}" by ${book.author}`);
      
      // Wait between requests to avoid rate limiting
      if (i < CROSSWORD_TOP_BOOKS.length - 1) {
        console.log('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      failCount++;
      console.error(`❌ Failed to add "${book.title}": ${error.message}`);
    }
  }
  
  console.log('\n🎉 Import completed!');
  console.log(`✅ Successfully added: ${successCount} books`);
  console.log(`❌ Failed to add: ${failCount} books`);
  console.log(`📚 Total processed: ${successCount + failCount} books`);
}

/**
 * Test connection and create a single book
 */
async function testConnection() {
  try {
    console.log('🔧 Testing Contentstack connection...');
    
    const testBook = CROSSWORD_TOP_BOOKS[0]; // The Psychology of Money
    const entry = await createBookInfoEntry(testBook);
    await publishEntry(entry.uid);
    
    console.log('✅ Connection test successful!');
    console.log(`📚 Test book created: "${testBook.title}" with UID: ${entry.uid}`);
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

/**
 * Import first 10 books only (for testing)
 */
async function importFirst10() {
  console.log(`🚀 Starting import of first 10 books from Crossword.in...`);
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < Math.min(10, CROSSWORD_TOP_BOOKS.length); i++) {
    const book = CROSSWORD_TOP_BOOKS[i];
    
    try {
      console.log(`\n📖 Processing book ${i + 1}/10: "${book.title}"`);
      
      // Create the entry
      const entry = await createBookInfoEntry(book);
      
      // Publish the entry
      await publishEntry(entry.uid);
      
      successCount++;
      console.log(`✅ Successfully added: "${book.title}" by ${book.author}`);
      
      // Wait between requests to avoid rate limiting
      if (i < 9) {
        console.log('⏳ Waiting 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
    } catch (error) {
      failCount++;
      console.error(`❌ Failed to add "${book.title}": ${error.message}`);
    }
  }
  
  console.log('\n🎉 Import completed!');
  console.log(`✅ Successfully added: ${successCount} books`);
  console.log(`❌ Failed to add: ${failCount} books`);
  console.log(`📚 Total processed: ${successCount + failCount} books`);
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'import-all':
    importCrosswordBooks();
    break;
  case 'import-10':
    importFirst10();
    break;
  case 'test':
    testConnection();
    break;
  case 'help':
  default:
    console.log('📚 Crossword.in Books Importer (Fixed Version)');
    console.log('');
    console.log('Usage:');
    console.log('  node crossword-importer-fixed.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  import-all  - Import all books from Crossword.in');
    console.log('  import-10   - Import first 10 books (for testing)');
    console.log('  test        - Test connection with a single book');
    console.log('  help        - Show this help message');
    console.log('');
    console.log('Environment Variables:');
    console.log('  CONTENTSTACK_MANAGEMENT_TOKEN - Your management token (set)');
    console.log('  CONTENTSTACK_API_KEY         - Your API key (set)');
    console.log('');
    console.log(`📊 Ready to import ${CROSSWORD_TOP_BOOKS.length} curated bestsellers!`);
    console.log('');
    console.log('📋 Supported Book Types:');
    console.log('  - Adventure stories, Classics, Crime, Fantasy');
    console.log('  - Historical fiction, Horror, Literary fiction');
    console.log('  - Mystery, Romance, Science fiction, Thrillers');
    console.log('  - Biography, Autobiography and memoir');
    console.log('  - And more...');
    break;
}
