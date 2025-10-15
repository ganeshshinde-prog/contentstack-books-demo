#!/usr/bin/env node

/**
 * Contentstack Entry Creation Script
 * This script creates entries in Contentstack using the Management API
 */

const https = require('https');
const fs = require('fs');

// Configuration
const CONFIG = {
  API_KEY: process.env.CONTENTSTACK_API_KEY || 'blte1f8c41539d5f7e3',
  MANAGEMENT_TOKEN: process.env.CONTENTSTACK_MANAGEMENT_TOKEN || '', // You need to provide this
  BASE_URL: 'https://api.contentstack.io/v3',
  ENVIRONMENT: process.env.CONTENTSTACK_ENVIRONMENT || 'development'
};

// Validate required configuration
if (!CONFIG.MANAGEMENT_TOKEN) {
  console.error('❌ CONTENTSTACK_MANAGEMENT_TOKEN is required!');
  console.log('');
  console.log('🔧 To get your Management Token:');
  console.log('1. Go to https://app.contentstack.com/');
  console.log('2. Navigate to Settings → Tokens');
  console.log('3. Create a new Management Token');
  console.log('4. Add it to your .env.local file:');
  console.log('   CONTENTSTACK_MANAGEMENT_TOKEN=your_token_here');
  console.log('');
  process.exit(1);
}

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
 * Create a BookInfo entry
 */
async function createBookInfoEntry(bookData) {
  console.log(`📚 Creating BookInfo entry: "${bookData.title}"`);
  
  const entryData = {
    entry: {
      title: bookData.title,
      author: bookData.author,
      book_type: bookData.genre,
      price: bookData.price,
      number_of_pages: bookData.pages,
      book_description: bookData.description,
      tags: bookData.tags || [],
      // Note: bookimage would need to be uploaded separately as an asset
    }
  };

  try {
    const result = await makeRequest('POST', '/content_types/bookinfo/entries', entryData);
    console.log(`✅ Created BookInfo entry: ${result.entry.uid}`);
    return result.entry;
  } catch (error) {
    console.error(`❌ Failed to create BookInfo entry: ${error.message}`);
    throw error;
  }
}

/**
 * Create a NewBookInfo entry
 */
async function createNewBookInfoEntry(bookData) {
  console.log(`🆕 Creating NewBookInfo entry: "${bookData.title}"`);
  
  const entryData = {
    entry: {
      title: bookData.title,
      author: bookData.author,
      book_type: bookData.genre,
      price: bookData.price,
      number_of_pages: bookData.pages,
      book_description: bookData.description,
      tags: bookData.tags || [],
      // Note: bookimage would need to be uploaded separately as an asset
    }
  };

  try {
    const result = await makeRequest('POST', '/content_types/newbookinfo/entries', entryData);
    console.log(`✅ Created NewBookInfo entry: ${result.entry.uid}`);
    return result.entry;
  } catch (error) {
    console.error(`❌ Failed to create NewBookInfo entry: ${error.message}`);
    throw error;
  }
}

/**
 * Publish an entry
 */
async function publishEntry(contentType, entryUid) {
  console.log(`📤 Publishing ${contentType} entry: ${entryUid}`);
  
  const publishData = {
    entry: {
      environments: [CONFIG.ENVIRONMENT],
      locales: ['en-us']
    }
  };

  try {
    const result = await makeRequest('POST', `/content_types/${contentType}/entries/${entryUid}/publish`, publishData);
    console.log(`✅ Published entry: ${entryUid}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to publish entry: ${error.message}`);
    throw error;
  }
}

/**
 * Upload ZincSearch data to Contentstack
 */
async function uploadZincSearchData() {
  try {
    // Read our ZincSearch dummy data
    const zincsearchData = JSON.parse(fs.readFileSync('./zincsearch_dummy_data.json', 'utf8'));
    
    console.log(`🚀 Starting upload of ${zincsearchData.length} books to Contentstack...`);
    console.log('');

    for (let i = 0; i < Math.min(3, zincsearchData.length); i++) { // Limit to 3 for demo
      const book = zincsearchData[i];
      
      try {
        // Create BookInfo entry
        const bookInfoEntry = await createBookInfoEntry(book);
        
        // Publish the entry
        await publishEntry('bookinfo', bookInfoEntry.uid);
        
        console.log('');
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Failed to process book "${book.title}": ${error.message}`);
      }
    }
    
    console.log('✅ Upload completed!');
    
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
  }
}

/**
 * Create a single book entry from command line
 */
async function createSingleBook() {
  const bookData = {
    title: 'Test Book from API',
    author: 'API Author',
    genre: 'Technology',
    price: 599,
    pages: 250,
    description: 'A test book created via Contentstack Management API to demonstrate programmatic entry creation.',
    tags: ['api', 'test', 'technology']
  };

  try {
    console.log('🚀 Creating a test book entry...');
    const entry = await createBookInfoEntry(bookData);
    await publishEntry('bookinfo', entry.uid);
    console.log('✅ Test book created and published successfully!');
  } catch (error) {
    console.error('❌ Failed to create test book:', error.message);
  }
}

/**
 * List existing entries
 */
async function listEntries(contentType = 'bookinfo') {
  console.log(`📋 Listing ${contentType} entries...`);
  
  try {
    const result = await makeRequest('GET', `/content_types/${contentType}/entries`);
    console.log(`Found ${result.entries.length} entries:`);
    
    result.entries.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.title} by ${entry.author} (${entry.uid})`);
    });
    
    return result.entries;
  } catch (error) {
    console.error(`❌ Failed to list entries: ${error.message}`);
    throw error;
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'upload-zincsearch':
    uploadZincSearchData();
    break;
  case 'create-test':
    createSingleBook();
    break;
  case 'list':
    const contentType = process.argv[3] || 'bookinfo';
    listEntries(contentType);
    break;
  case 'help':
  default:
    console.log('📚 Contentstack Entry Creation Script');
    console.log('');
    console.log('Usage:');
    console.log('  node create-contentstack-entries.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  upload-zincsearch  - Upload ZincSearch dummy data to Contentstack');
    console.log('  create-test        - Create a single test book entry');
    console.log('  list [content-type] - List existing entries (default: bookinfo)');
    console.log('  help               - Show this help message');
    console.log('');
    console.log('Environment Variables Required:');
    console.log('  CONTENTSTACK_MANAGEMENT_TOKEN - Your Contentstack Management Token');
    console.log('  CONTENTSTACK_API_KEY         - Your Stack API Key (already set)');
    console.log('');
    break;
}
