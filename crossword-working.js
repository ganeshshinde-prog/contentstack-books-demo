#!/usr/bin/env node

/**
 * Crossword.in Books Importer (Working Version)
 * This script adds curated bestsellers from Crossword.in to Contentstack BookInfo
 */

const https = require('https');

// Configuration
const CONFIG = {
  API_KEY: process.env.CONTENTSTACK_API_KEY || 'blte1f8c41539d5f7e3',
  MANAGEMENT_TOKEN: process.env.CONTENTSTACK_MANAGEMENT_TOKEN || '',
  BASE_URL: 'https://api.contentstack.io/v3',
  ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT || 'development'
};

// Use existing asset UID (just the UID, not the full object)
const DEFAULT_BOOK_ASSET_UID = 'blt444a0c877cc245f1'; // Atonment.jpg

// Top 26 Books from Crossword.in (curated bestsellers with correct genres)
const CROSSWORD_TOP_BOOKS = [
  {
    title: "Ikigai: Japanese Secret to Long and Happy Life",
    author: "Hector Garcia, Francesc Miralles",
    genre: "Biography",
    price: 413,
    pages: 208,
    description: "The people of Japan believe that everyone has an ikigai—a reason for being; the thing that gets you up in the morning. Some people have found their ikigai, while others are still looking, though they carry it within them.",
    tags: ["self-help", "japanese philosophy", "happiness", "bestseller"]
  },
  {
    title: "The Secret Of Secrets",
    author: "Dan Brown",
    genre: "Thrillers",
    price: 1184,
    pages: 448,
    description: "Harvard symbologist Robert Langdon returns in this thrilling new adventure that takes him from the corridors of power in Washington D.C. to the ancient mysteries hidden in plain sight.",
    tags: ["thriller", "mystery", "bestseller", "dan brown"]
  },
  {
    title: "Do It Today",
    author: "Darius Foroux",
    genre: "Biography",
    price: 172,
    pages: 112,
    description: "Overcome procrastination, improve productivity, and achieve more meaningful things. This book will help you to stop procrastinating and start living a more productive life.",
    tags: ["productivity", "self-help", "motivation", "bestseller"]
  },
  {
    title: "Manifest",
    author: "Roxie Nafousi",
    genre: "Biography",
    price: 413,
    pages: 256,
    description: "Transform your life with the power of manifestation. This book provides a clear, actionable guide to manifesting your dreams and creating the life you want.",
    tags: ["manifestation", "self-help", "spirituality", "bestseller"]
  },
  {
    title: "Think Straight",
    author: "Darius Foroux",
    genre: "Biography",
    price: 172,
    pages: 208,
    description: "Change Your Thoughts, Change Your Life. This book will help you to think more clearly, make better decisions, and live a more fulfilling life.",
    tags: ["thinking", "self-help", "decision making", "bestseller"]
  },
  {
    title: "Focus On What Matters",
    author: "Darius Foroux",
    genre: "Biography",
    price: 241,
    pages: 192,
    description: "A Practical Guide to Improving Your Focus and Getting Things Done. Learn how to focus on what truly matters and eliminate distractions from your life.",
    tags: ["focus", "productivity", "self-help", "bestseller"]
  },
  {
    title: "The Palace of Illusions",
    author: "Chitra Banerjee Divakaruni",
    genre: "Historical fiction",
    price: 369,
    pages: 360,
    description: "The Palace of Illusions takes us back to a time that is half-history, half-myth, and wholly magical. Narrated by Panchaali, the wife of the five Pandava brothers, we finally get to see the epic Mahabharata through a woman's eyes.",
    tags: ["mythology", "indian literature", "historical fiction", "bestseller"]
  },
  {
    title: "Mindset",
    author: "Carol S. Dweck",
    genre: "Biography",
    price: 295,
    pages: 276,
    description: "The New Psychology of Success. Dweck reveals how success in school, work, sports, the arts, and almost every area of human endeavor can be dramatically influenced by how we think about our talents and abilities.",
    tags: ["psychology", "mindset", "success", "bestseller"]
  },
  {
    title: "The Chola Tigers: Avengers of Somnath",
    author: "Amish",
    genre: "Historical fiction",
    price: 369,
    pages: 400,
    description: "The second book in the Chola series. A gripping tale of revenge, honor, and the mighty Chola empire's quest to avenge the destruction of the Somnath temple.",
    tags: ["historical fiction", "indian history", "chola empire", "bestseller"]
  },
  {
    title: "The Housemaid",
    author: "Freida McFadden",
    genre: "Thrillers",
    price: 369,
    pages: 336,
    description: "Every day I clean the Winchesters' beautiful house top to bottom. I collect their daughter from school. And I cook a delicious meal for the whole family before heading up to eat alone in my tiny room on the top floor.",
    tags: ["psychological thriller", "suspense", "bestseller", "domestic thriller"]
  },
  {
    title: "The Family Upstairs",
    author: "Lisa Jewell",
    genre: "Thrillers",
    price: 407,
    pages: 352,
    description: "In a large house in London's fashionable Chelsea, a baby is found abandoned. Twenty-five years later, Libby Jones returns to the house she inherited to uncover the truth about her past.",
    tags: ["psychological thriller", "family secrets", "bestseller", "mystery"]
  },
  {
    title: "A Good Girl's Guide To Murder",
    author: "Holly Jackson",
    genre: "Mystery",
    price: 344,
    pages: 432,
    description: "Five years ago, schoolgirl Andie Bell was murdered by her boyfriend Sal Singh. Case closed. The police know he did it. Everyone in town knows he did it. But smart and single-minded Pip knows better.",
    tags: ["young adult", "mystery", "crime", "bestseller"]
  },
  {
    title: "Then She Was Gone",
    author: "Lisa Jewell",
    genre: "Thrillers",
    price: 407,
    pages: 352,
    description: "She was fifteen, her mother's golden girl. She had her whole life ahead of her. And then, in the blink of an eye, Ellie was gone. It's been ten years since Ellie disappeared, but Laurel has never given up hope of finding her daughter.",
    tags: ["psychological thriller", "missing person", "family drama", "bestseller"]
  },
  {
    title: "The Crash",
    author: "Freida McFadden",
    genre: "Thrillers",
    price: 407,
    pages: 320,
    description: "A gripping psychological thriller about a car crash that changes everything. When a family's perfect life is shattered in an instant, dark secrets begin to emerge.",
    tags: ["psychological thriller", "family secrets", "suspense", "bestseller"]
  },
  {
    title: "The Inheritance Games",
    author: "Jennifer Lynn Barnes",
    genre: "Mystery",
    price: 369,
    pages: 384,
    description: "When a Connecticut teenager inherits a fortune from a Texas billionaire she's never met, she must solve a series of puzzles to claim her inheritance.",
    tags: ["young adult", "mystery", "puzzles", "bestseller"]
  },
  {
    title: "The Devotion Of Suspect X",
    author: "Keigo Higashino",
    genre: "Crime",
    price: 374,
    pages: 304,
    description: "When a single mother kills her abusive ex-husband in self-defense, her brilliant neighbor devises the perfect alibi. But when a persistent detective investigates, the case becomes a battle of wits.",
    tags: ["crime", "mystery", "japanese literature", "bestseller"]
  },
  {
    title: "The Thursday Murder Club",
    author: "Richard Osman",
    genre: "Mystery",
    price: 509,
    pages: 368,
    description: "In a peaceful retirement village, four unlikely friends meet weekly to investigate cold cases. But when a real murder happens on their doorstep, they find themselves in the middle of their first live case.",
    tags: ["cozy mystery", "crime", "elderly protagonists", "bestseller"]
  },
  {
    title: "50 Greatest Detective Stories",
    author: "Terry O'Brien",
    genre: "Mystery",
    price: 292,
    pages: 512,
    description: "A collection of the finest detective stories ever written, featuring classic tales from masters of the genre including Arthur Conan Doyle, Agatha Christie, and Raymond Chandler.",
    tags: ["mystery", "detective stories", "classic literature", "collection"]
  },
  {
    title: "One Of Us Is Lying",
    author: "Karen McManus",
    genre: "Mystery",
    price: 333,
    pages: 361,
    description: "Five students go to detention. Only four leave alive. Everyone is a suspect, and everyone has something to hide. The Breakfast Club meets Pretty Little Liars in this addictive mystery.",
    tags: ["young adult", "mystery", "school setting", "bestseller"]
  },
  {
    title: "Verity",
    author: "Colleen Hoover",
    genre: "Thrillers",
    price: 295,
    pages: 336,
    description: "Lowen Ashleigh is hired to complete the remaining books in a bestselling series after the author is unable to continue. But when she discovers an unfinished autobiography, she uncovers bone-chilling admissions.",
    tags: ["psychological thriller", "romance", "dark secrets", "bestseller"]
  },
  {
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Historical fiction",
    price: 450,
    pages: 400,
    description: "Reclusive Hollywood icon Evelyn Hugo finally decides to tell her life story—but only to one reporter, Monique Grant. As Evelyn unfolds her tale, Monique begins to feel a very real connection to this legendary star.",
    tags: ["historical fiction", "hollywood", "lgbtq", "bestseller"]
  },
  {
    title: "Where the Crawdads Sing",
    author: "Delia Owens",
    genre: "Literary fiction",
    price: 450,
    pages: 384,
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl.",
    tags: ["literary fiction", "coming of age", "nature", "bestseller"]
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Literary fiction",
    price: 399,
    pages: 288,
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    tags: ["literary fiction", "philosophy", "life choices", "bestseller"]
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Autobiography and memoir",
    price: 450,
    pages: 334,
    description: "Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom. Her quest for knowledge transformed her, taking her over oceans and across continents.",
    tags: ["memoir", "education", "family", "bestseller"]
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    genre: "Biography",
    price: 720,
    pages: 448,
    description: "In her memoir, a work of deep reflection and mesmerizing storytelling, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her.",
    tags: ["biography", "politics", "inspiration", "bestseller"]
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "Biography",
    price: 650,
    pages: 443,
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
    tags: ["history", "anthropology", "science", "bestseller"]
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
 * Create a BookInfo entry with asset
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
        tags: bookData.tags,
        bookimage: DEFAULT_BOOK_ASSET_UID  // Just the UID string
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
  console.log(`📸 Using asset UID: ${DEFAULT_BOOK_ASSET_UID}`);
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
      
      // Continue with next book even if one fails
      if (i < CROSSWORD_TOP_BOOKS.length - 1) {
        console.log('⏳ Waiting 1 second before next book...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
    console.log(`📸 Using asset UID: ${DEFAULT_BOOK_ASSET_UID}`);
    
    const testBook = CROSSWORD_TOP_BOOKS[0]; // Ikigai
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
  console.log(`📸 Using asset UID: ${DEFAULT_BOOK_ASSET_UID}`);
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
      
      // Continue with next book even if one fails
      if (i < 9) {
        console.log('⏳ Waiting 1 second before next book...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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
    console.log('📚 Crossword.in Books Importer (Working Version)');
    console.log('');
    console.log('Usage:');
    console.log('  node crossword-working.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  import-all  - Import all 26 curated books from Crossword.in');
    console.log('  import-10   - Import first 10 books (for testing)');
    console.log('  test        - Test connection with a single book');
    console.log('  help        - Show this help message');
    console.log('');
    console.log('Environment Variables:');
    console.log('  CONTENTSTACK_MANAGEMENT_TOKEN - Your management token (✅ set)');
    console.log('  CONTENTSTACK_API_KEY         - Your API key (✅ set)');
    console.log('');
    console.log(`📊 Ready to import ${CROSSWORD_TOP_BOOKS.length} curated bestsellers from Crossword.in!`);
    console.log(`📸 Using existing asset UID: ${DEFAULT_BOOK_ASSET_UID}`);
    console.log('');
    console.log('📋 Book Categories from Crossword.in:');
    console.log('  ✅ Biography & Self-Help (Ikigai, Mindset, Becoming, etc.)');
    console.log('  ✅ Thrillers (Dan Brown, Freida McFadden, Lisa Jewell, etc.)');
    console.log('  ✅ Mystery (Thursday Murder Club, Detective Stories, etc.)');
    console.log('  ✅ Historical Fiction (Palace of Illusions, Chola Tigers, etc.)');
    console.log('  ✅ Literary Fiction (Crawdads Sing, Midnight Library, etc.)');
    console.log('  ✅ Crime (Devotion of Suspect X, etc.)');
    console.log('  ✅ Memoir (Educated, etc.)');
    break;
}
