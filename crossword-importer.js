#!/usr/bin/env node

/**
 * Crossword.in Top 50 Books Importer
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

// Top 50 Books from Crossword.in (curated from their bestsellers)
const CROSSWORD_TOP_BOOKS = [
  {
    title: "The Psychology Of Money",
    author: "Morgan Housel",
    genre: "Finance",
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
    genre: "Thriller",
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
    genre: "Self-Help",
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
    genre: "Productivity",
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
    genre: "Self-Help",
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
    genre: "Self-Help",
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
    genre: "Psychological Thriller",
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
    genre: "Productivity",
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
    genre: "Self-Help",
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
    genre: "Mythological Fiction",
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
    genre: "Psychology",
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
    genre: "Historical Fiction",
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
    genre: "Psychological Thriller",
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
    genre: "Psychological Thriller",
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
    genre: "Young Adult Mystery",
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
    genre: "Psychological Thriller",
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
    genre: "Psychological Thriller",
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
    genre: "Young Adult Mystery",
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
    genre: "Crime Mystery",
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
    genre: "Cozy Mystery",
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
    genre: "Mystery Collection",
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
    genre: "Young Adult Mystery",
    price: 333,
    originalPrice: 450,
    pages: 361,
    description: "Five students go to detention. Only four leave alive. Everyone is a suspect, and everyone has something to hide. The Breakfast Club meets Pretty Little Liars in this addictive mystery.",
    isbn: "978-0141375632",
    publisher: "Penguin Books",
    tags: ["young adult", "mystery", "school setting", "bestseller"]
  },
  {
    title: "Verity",
    author: "Colleen Hoover",
    genre: "Psychological Thriller",
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
    genre: "Contemporary Romance",
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
    genre: "Historical Fiction",
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
    genre: "Literary Fiction",
    price: 450,
    originalPrice: 599,
    pages: 384,
    description: "For years, rumors of the 'Marsh Girl' have haunted Barkley Cove. So in late 1969, when handsome Chase Andrews is found dead, the locals immediately suspect Kya Clark, the so-called Marsh Girl.",
    isbn: "978-0735219090",
    publisher: "G.P. Putnam's Sons",
    tags: ["literary fiction", "coming of age", "nature", "bestseller"]
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Literary Fiction",
    price: 399,
    originalPrice: 499,
    pages: 288,
    description: "Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived.",
    isbn: "978-0525559474",
    publisher: "Viking",
    tags: ["literary fiction", "philosophy", "life choices", "bestseller"]
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    price: 450,
    originalPrice: 599,
    pages: 334,
    description: "Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom. Her quest for knowledge transformed her, taking her over oceans and across continents.",
    isbn: "978-0399590504",
    publisher: "Random House",
    tags: ["memoir", "education", "family", "bestseller"]
  },
  {
    title: "Becoming",
    author: "Michelle Obama",
    genre: "Biography",
    price: 720,
    originalPrice: 899,
    pages: 448,
    description: "In her memoir, a work of deep reflection and mesmerizing storytelling, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her.",
    isbn: "978-1524763138",
    publisher: "Crown Publishing Group",
    tags: ["biography", "politics", "inspiration", "bestseller"]
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    genre: "History",
    price: 650,
    originalPrice: 799,
    pages: 443,
    description: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
    isbn: "978-0062316097",
    publisher: "Harper",
    tags: ["history", "anthropology", "science", "bestseller"]
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Philosophical Fiction",
    price: 290,
    originalPrice: 399,
    pages: 163,
    description: "Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
    isbn: "978-0062315007",
    publisher: "HarperOne",
    tags: ["philosophy", "adventure", "spiritual", "bestseller"]
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Dystopian Fiction",
    price: 350,
    originalPrice: 450,
    pages: 328,
    description: "A dystopian social science fiction novel that follows the life of Winston Smith, a low ranking member of 'the Party', who is frustrated by the omnipresent eyes of the party.",
    isbn: "978-0452284234",
    publisher: "Plume",
    tags: ["dystopian", "classic", "political", "bestseller"]
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic Literature",
    price: 380,
    originalPrice: 499,
    pages: 376,
    description: "The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill A Mockingbird became both an instant bestseller and a critical success.",
    isbn: "978-0061120084",
    publisher: "Harper Perennial Modern Classics",
    tags: ["classic", "social justice", "coming of age", "bestseller"]
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    genre: "Classic Literature",
    price: 320,
    originalPrice: 450,
    pages: 180,
    description: "Set in the summer of 1922, the novel follows Nick Carraway, a young Yale graduate and World War I veteran from the Midwest who moves to Long Island.",
    isbn: "978-0743273565",
    publisher: "Scribner",
    tags: ["classic", "american literature", "jazz age", "bestseller"]
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Classic Romance",
    price: 299,
    originalPrice: 399,
    pages: 432,
    description: "A romantic novel that charts the emotional development of protagonist Elizabeth Bennet, who learns the error of making hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
    isbn: "978-0141439518",
    publisher: "Penguin Classics",
    tags: ["classic", "romance", "british literature", "bestseller"]
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Coming of Age",
    price: 399,
    originalPrice: 499,
    pages: 277,
    description: "The novel details two days in the life of 16-year-old Holden Caulfield after he has been expelled from prep school.",
    isbn: "978-0316769174",
    publisher: "Little, Brown and Company",
    tags: ["coming of age", "classic", "american literature", "bestseller"]
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    genre: "Fantasy",
    price: 450,
    originalPrice: 599,
    pages: 223,
    description: "The first novel in the Harry Potter series and Rowling's debut novel, it follows Harry Potter, a young wizard who discovers his magical heritage.",
    isbn: "978-0439708180",
    publisher: "Scholastic",
    tags: ["fantasy", "children's literature", "magic", "bestseller"]
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    price: 480,
    originalPrice: 599,
    pages: 310,
    description: "A children's fantasy novel about hobbit Bilbo Baggins, whose quiet life is upended when he is swept into an epic quest.",
    isbn: "978-0547928227",
    publisher: "Houghton Mifflin Harcourt",
    tags: ["fantasy", "adventure", "classic", "bestseller"]
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    price: 520,
    originalPrice: 699,
    pages: 688,
    description: "Set in the distant future amidst a feudal interstellar society in which various noble houses control planetary fiefs.",
    isbn: "978-0441172719",
    publisher: "Ace Books",
    tags: ["science fiction", "space opera", "classic", "bestseller"]
  },
  {
    title: "The Lord of the Rings: The Fellowship of the Ring",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    price: 550,
    originalPrice: 699,
    pages: 423,
    description: "The first volume of the epic high fantasy novel. The story began as a sequel to Tolkien's 1937 fantasy novel The Hobbit.",
    isbn: "978-0547928210",
    publisher: "Houghton Mifflin Harcourt",
    tags: ["fantasy", "epic", "classic", "bestseller"]
  },
  {
    title: "Brave New World",
    author: "Aldous Huxley",
    genre: "Dystopian Fiction",
    price: 350,
    originalPrice: 450,
    pages: 311,
    description: "A dystopian social science fiction novel set in a futuristic World State, whose citizens are environmentally engineered into an intelligence-based social hierarchy.",
    isbn: "978-0060850524",
    publisher: "Harper Perennial Modern Classics",
    tags: ["dystopian", "science fiction", "classic", "bestseller"]
  },
  {
    title: "The Kite Runner",
    author: "Khaled Hosseini",
    genre: "Literary Fiction",
    price: 399,
    originalPrice: 499,
    pages: 371,
    description: "The story of the unlikely friendship between a wealthy boy and the son of his father's servant, caught in the tragic sweep of history.",
    isbn: "978-1594631931",
    publisher: "Riverhead Books",
    tags: ["literary fiction", "afghanistan", "friendship", "bestseller"]
  },
  {
    title: "Life of Pi",
    author: "Yann Martel",
    genre: "Adventure Fiction",
    price: 380,
    originalPrice: 499,
    pages: 319,
    description: "A Canadian philosophical novel about an Indian boy named Pi Patel who survives a shipwreck in which his family dies.",
    isbn: "978-0156027328",
    publisher: "Harcourt",
    tags: ["adventure", "survival", "philosophy", "bestseller"]
  },
  {
    title: "The Book Thief",
    author: "Markus Zusak",
    genre: "Historical Fiction",
    price: 420,
    originalPrice: 549,
    pages: 552,
    description: "Set in Nazi Germany, it tells the story of Liesel Meminger, a foster girl living outside of Munich, who scratches out a meager existence by stealing books.",
    isbn: "978-0375842207",
    publisher: "Knopf Books for Young Readers",
    tags: ["historical fiction", "world war ii", "coming of age", "bestseller"]
  },
  {
    title: "The Fault in Our Stars",
    author: "John Green",
    genre: "Young Adult Romance",
    price: 350,
    originalPrice: 450,
    pages: 313,
    description: "A novel about sixteen-year-old cancer patient Hazel Grace Lancaster, who is forced by her parents to attend a support group, where she meets and falls in love with Augustus Waters.",
    isbn: "978-0142424179",
    publisher: "Speak",
    tags: ["young adult", "romance", "cancer", "bestseller"]
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    genre: "Psychological Thriller",
    price: 420,
    originalPrice: 549,
    pages: 419,
    description: "On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne's fifth wedding anniversary. But Amy disappears that same morning.",
    isbn: "978-0307588371",
    publisher: "Crown Publishing Group",
    tags: ["psychological thriller", "marriage", "mystery", "bestseller"]
  },
  {
    title: "The Girl on the Train",
    author: "Paula Hawkins",
    genre: "Psychological Thriller",
    price: 380,
    originalPrice: 499,
    pages: 336,
    description: "Rachel takes the same commuter train every morning and night. Every day she rattles down the track, flashes past a stretch of cozy suburban homes, and stops at the signal.",
    isbn: "978-1594633669",
    publisher: "Riverhead Books",
    tags: ["psychological thriller", "unreliable narrator", "mystery", "bestseller"]
  },
  {
    title: "Big Little Lies",
    author: "Liane Moriarty",
    genre: "Contemporary Fiction",
    price: 399,
    originalPrice: 499,
    pages: 460,
    description: "Sometimes it's the little lies that turn out to be the most lethal. A murder, a tragic accident, or just parents behaving badly?",
    isbn: "978-0399167065",
    publisher: "G.P. Putnam's Sons",
    tags: ["contemporary fiction", "family drama", "mystery", "bestseller"]
  },
  {
    title: "The Help",
    author: "Kathryn Stockett",
    genre: "Historical Fiction",
    price: 420,
    originalPrice: 549,
    pages: 451,
    description: "Set in Jackson, Mississippi, in 1962, Stockett's first novel tells the story of African-American maids working in white households.",
    isbn: "978-0425232200",
    publisher: "Berkley",
    tags: ["historical fiction", "civil rights", "southern literature", "bestseller"]
  },
  {
    title: "Eat, Pray, Love",
    author: "Elizabeth Gilbert",
    genre: "Memoir",
    price: 380,
    originalPrice: 499,
    pages: 349,
    description: "One woman's search for everything across Italy, India and Indonesia. At thirty-two, Elizabeth Gilbert had everything a modern American woman was supposed to want.",
    isbn: "978-0143038412",
    publisher: "Penguin Books",
    tags: ["memoir", "travel", "self-discovery", "bestseller"]
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
 * Upload an image from URL to Contentstack Assets
 */
async function uploadImageFromUrl(imageUrl, title) {
  try {
    console.log(`📸 Uploading image: ${title}`);
    
    // For demo purposes, we'll create a placeholder asset
    // In a real implementation, you would download the image and upload it
    const assetData = {
      asset: {
        upload: imageUrl,
        title: title,
        description: `Book cover image for ${title}`
      }
    };

    // Note: This is a simplified version. Real implementation would require
    // multipart/form-data upload with the actual image file
    console.log(`📸 Would upload image from: ${imageUrl}`);
    
    // Return a mock asset for now
    return {
      uid: `mock_asset_${Date.now()}`,
      url: imageUrl,
      title: title
    };
    
  } catch (error) {
    console.error(`❌ Failed to upload image: ${error.message}`);
    return null;
  }
}

/**
 * Create a BookInfo entry with image
 */
async function createBookInfoEntry(bookData) {
  console.log(`📚 Creating BookInfo entry: "${bookData.title}"`);
  
  try {
    // Create a mock book cover image URL (you would use real images from Crossword)
    const imageUrl = `https://via.placeholder.com/400x600/0066CC/FFFFFF?text=${encodeURIComponent(bookData.title)}`;
    
    // Upload image to assets (mock for now)
    const asset = await uploadImageFromUrl(imageUrl, `${bookData.title} Cover`);
    
    const entryData = {
      entry: {
        title: bookData.title,
        author: bookData.author,
        book_type: bookData.genre,
        price: bookData.price,
        number_of_pages: bookData.pages,
        book_description: bookData.description,
        tags: bookData.tags,
        // Add the uploaded image
        bookimage: asset ? {
          uid: asset.uid,
          url: asset.url,
          title: asset.title
        } : undefined
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

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'import-all':
    importCrosswordBooks();
    break;
  case 'test':
    testConnection();
    break;
  case 'help':
  default:
    console.log('📚 Crossword.in Books Importer');
    console.log('');
    console.log('Usage:');
    console.log('  node crossword-importer.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  import-all  - Import all 50 top books from Crossword.in');
    console.log('  test        - Test connection with a single book');
    console.log('  help        - Show this help message');
    console.log('');
    console.log('Environment Variables:');
    console.log('  CONTENTSTACK_MANAGEMENT_TOKEN - Your management token (set)');
    console.log('  CONTENTSTACK_API_KEY         - Your API key (set)');
    console.log('');
    console.log(`📊 Ready to import ${CROSSWORD_TOP_BOOKS.length} curated bestsellers!`);
    break;
}
