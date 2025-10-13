import Stack from "../contentstack-sdk";
import MultiEnvStack from "../contentstack-sdk/multi-environment";
import { addEditableTags } from "@contentstack/utils";

const liveEdit = process.env.CONTENTSTACK_LIVE_EDIT_TAGS === "true";

export const getHeaderRes = async () => {
    const response = await Stack.getEntry({
        contentTypeUid: "header",
        referenceFieldPath: ["navigation_menu.page_reference"],
        jsonRtePath: ["notification_bar.announcement_text"],
    });

    liveEdit && addEditableTags(response[0][0], "header", true);
    return response[0][0];
};

export const getFooterRes = async () => {
    const response = await Stack.getEntry({
        contentTypeUid: "footer",
        referenceFieldPath: undefined,
        jsonRtePath: ["copyright"],
    });
    liveEdit && addEditableTags(response[0][0], "footer", true);
    return response[0][0];
};

export const getAllEntries = async () => {
    const response = await Stack.getEntry({
        contentTypeUid: "page",
        referenceFieldPath: undefined,
        jsonRtePath: undefined,
    });
    liveEdit &&
        response[0].forEach((entry) => addEditableTags(entry, "page", true));
    return response[0];
};

export const getHomePageRes = async () => {
    const response = await getEntryByUrlGQL({
        contentTypeUid: "page",
        entryUrl: "/",
        jsonRtePath: [
            "page_components.from_blog.featured_blogs.body",
            "page_components.section_with_buckets.buckets.description",
            "page_components.section_with_html_code.description",
        ]
    })
    liveEdit && addEditableTags(response[0][0], "page", true);
    return response[0][0];
}

export const getPageRes = async (entryUrl) => {
    const response = await Stack.getEntryByUrl({
        contentTypeUid: "page",
        entryUrl,
        referenceFieldPath: ["page_components.from_blog.featured_blogs", "page_components.superheroes.character"],
        jsonRtePath: [
            "page_components.from_blog.featured_blogs.body",
            "page_components.section_with_buckets.buckets.description",
            "page_components.section_with_html_code.description",
        ],
    });
    liveEdit && addEditableTags(response[0], "page", true);
    return response[0];
};

export const getBlogListRes = async () => {
    // Blog functionality is not available in this books demo
    // Return empty array to prevent content type errors
    return [];
};

export const getBlogPostRes = async (entryUrl) => {
    // Blog functionality is not available in this books demo
    // Return null to indicate no blog post found
    return null;
};

export const getAllComposableHeros = async (entryUrl) => {
    const response = await Stack.getEntryByUrl({
        contentTypeUid: "superhero_gallery_page",
        entryUrl,
        referenceFieldPath: ["characters"],
        jsonRtePath: ["characters.description"],
    });

    liveEdit && addEditableTags(response, "superhero_gallery_page", true);
    return response[0];
};

export const getComposableHeroHomeWorld = async () => {
    const response = await Stack.getEntry({
        contentTypeUid: "character",
        // referenceFieldPath: ["home_world"],
        jsonRtePath: ["description"],
    });
    liveEdit &&
        response[0].forEach((entry) => addEditableTags(entry, "character", true));
    return response;
};

export const getComposableHeroSingleRes = async (entryUrl) => {
    const response = await Stack.getEntryByUrl({
        contentTypeUid: "header",
        entryUrl,
        referenceFieldPath: ["books"],
        jsonRtePath: ["description"],
    });

    liveEdit && addEditableTags(response[0], "character", true);
    return response[0];
};

export const getComposableHeroGallery = async (entryUrl) => {
    const response = await Stack.getEntryByUrl({
        contentTypeUid: "superhero_landing_page",
        entryUrl,
        referenceFieldPath: ["modular_blocks.super_heroes_gallery.heroes"],
        jsonRtePath: [
            "page_components.from_blog.featured_blogs.body",
            "page_components.section_with_buckets.buckets.description",
            "page_components.section_with_html_code.description",
        ],
    });

    liveEdit && addEditableTags(response[0], "page", true);
    return response[0];
};

export const getSuperheroGalleryRes = async () => {
    const response = await Stack.getEntry({
        contentTypeUid: "character",
        jsonRtePath: ["description"],
    });

    liveEdit &&
        response[0].forEach((entry) => addEditableTags(entry, "character", true));
    return response;
};

export const getBooksRes = async () => {
    try {
        console.log('📚 Fetching books from BookInfo content type');
        const response = await Stack.getEntry({
            contentTypeUid: "bookinfo", // Use BookInfo content type
            referenceFieldPath: undefined,
            jsonRtePath: ["book_description"],
        });
        
        // Validate and filter books to ensure they have required fields
        const books = response[0] || [];
        const validBooks = books.filter(book => {
            // Check for required fields
            const hasRequiredFields = book.title && 
                                    book.author && 
                                    book.book_description && 
                                    book.bookimage && 
                                    book.bookimage.url;
            
            if (!hasRequiredFields) {
                console.warn(`Book entry ${book.uid || 'unknown'} is missing required fields:`, book);
                return false;
            }
            
            // Ensure numeric fields are valid
            if (typeof book.price !== 'number' || book.price < 0) {
                console.warn(`Book ${book.title} has invalid price:`, book.price);
                book.price = 0; // Set default price
            }
            
            if (typeof book.number_of_pages !== 'number' || book.number_of_pages < 0) {
                console.warn(`Book ${book.title} has invalid page count:`, book.number_of_pages);
                book.number_of_pages = 0; // Set default page count
            }
            
            // Ensure tags is an array
            if (!Array.isArray(book.tags)) {
                book.tags = [];
            }
            
            // Ensure book_type exists
            if (!book.book_type) {
                book.book_type = 'Unknown';
            }
            
            return true;
        });
        
        liveEdit &&
            validBooks.forEach((entry) => addEditableTags(entry, "bookinfo", true));
        
        console.log(`✅ Successfully loaded ${validBooks.length} valid books from BookInfo content type out of ${books.length} total entries`);
        return validBooks;
    } catch (error) {
        console.error('❌ Error fetching books from BookInfo content type:', error);
        return []; // Return empty array on error to prevent site crash
    }
};

export const getNewArrivalsRes = async () => {
    try {
        console.log('🆕 Fetching new arrivals from NewBookInfo content type');
        const response = await Stack.getEntry({
            contentTypeUid: "newbookinfo", // Use NewBookInfo content type
            referenceFieldPath: undefined,
            jsonRtePath: ["book_description"],
        });
        
        console.log('📦 HELPER: Raw response from NewBookInfo content type:', response);
        
        // Use the same validation logic as getBooksRes
        const books = response[0] || [];
        const validBooks = books.filter(book => {
            // Check for required fields
            const hasRequiredFields = book.title && 
                                    book.author && 
                                    book.book_description && 
                                    book.bookimage && 
                                    book.bookimage.url;
            
            if (!hasRequiredFields) {
                console.warn(`NewBookInfo entry ${book.uid || 'unknown'} is missing required fields:`, book);
                return false;
            }
            
            // Ensure numeric fields are valid
            if (typeof book.price !== 'number' || book.price < 0) {
                console.warn(`NewBook ${book.title} has invalid price:`, book.price);
                book.price = 0;
            }
            
            if (typeof book.number_of_pages !== 'number' || book.number_of_pages < 0) {
                console.warn(`NewBook ${book.title} has invalid page count:`, book.number_of_pages);
                book.number_of_pages = 0;
            }
            
            // Ensure tags is an array
            if (!Array.isArray(book.tags)) {
                book.tags = [];
            }
            
            // Ensure book_type exists
            if (!book.book_type) {
                book.book_type = 'Unknown';
            }
            
            return true;
        });
        
        liveEdit &&
            validBooks.forEach((entry) => addEditableTags(entry, "newbookinfo", true));
        
        console.log(`✅ Successfully loaded ${validBooks.length} books for new arrivals from NewBookInfo content type`);
        return validBooks;
    } catch (error) {
        console.error('❌ Error fetching new arrivals from NewBookInfo content type:', error);
        console.error('❌ Error stack:', error.stack);
        return []; // Return empty array on error to prevent site crash
    }
};

export const getBookExtendedRes = async (bookUid) => {
    try {
        const response = await Stack.getEntry({
            contentTypeUid: "bookinfoextended",
            referenceFieldPath: undefined,
            jsonRtePath: ["book_summary"],
        });
        
        // Find the specific book by UID
        const books = response[0] || [];
        const book = books.find(b => b.uid === bookUid);
        
        if (!book) {
            console.warn(`Extended book info not found for UID: ${bookUid}`);
            return null;
        }
        
        // Validate extended book data
        if (!book.title) {
            console.warn(`Extended book ${bookUid} is missing title field`);
            return null;
        }
        
        // Set defaults for missing fields
        if (!book.author) {
            book.author = 'Unknown Author';
        }
        
        if (!book.book_type) {
            book.book_type = 'Unknown';
        }
        
        if (!book.publication_year) {
            book.publication_year = 'Unknown';
        }
        
        if (!book.isbn) {
            book.isbn = 'Not available';
        }
        
        // Ensure numeric fields are valid
        if (typeof book.price !== 'number' || book.price < 0) {
            book.price = 0;
        }
        
        if (typeof book.number_of_pages !== 'number' || book.number_of_pages < 0) {
            book.number_of_pages = 0;
        }
        
        // Ensure arrays exist
        if (!Array.isArray(book.tags)) {
            book.tags = [];
        }
        
        if (!Array.isArray(book.key_features)) {
            book.key_features = [];
        }
        
        // Ensure image object exists
        if (!book.bookimage) {
            book.bookimage = {
                url: '',
                title: book.title || 'Book Image'
            };
        }
        
        liveEdit && addEditableTags(book, "bookinfoextended", true);
        
        console.log(`✅ Successfully loaded extended info for book: ${book.title}`);
        return book;
    } catch (error) {
        console.error('❌ Error fetching extended book info:', error);
        return null;
    }
};

export const getNewBookExtendedRes = async (bookUid) => {
    try {
        console.log(`🆕 Fetching extended info for new book UID: ${bookUid} from NewBookInfoExtended`);
        const response = await Stack.getEntry({
            contentTypeUid: "newbookinfoextended", // Use NewBookInfoExtended content type
            referenceFieldPath: undefined,
            jsonRtePath: ["book_summary"],
        });
        
        console.log('📦 HELPER: Raw response from NewBookInfoExtended:', response);
        
        // Find the specific book by UID
        const books = response[0] || [];
        const book = books.find(b => b.uid === bookUid);
        
        if (!book) {
            console.warn(`Extended new book info not found for UID: ${bookUid}`);
            return null;
        }
        
        // Validate extended book data
        if (!book.title) {
            console.warn(`Extended new book ${bookUid} is missing title field`);
            return null;
        }
        
        // Set defaults for missing fields
        if (!book.author) {
            book.author = 'Unknown Author';
        }
        
        if (!book.book_type) {
            book.book_type = 'Unknown';
        }
        
        if (!book.publication_year) {
            book.publication_year = 'Unknown';
        }
        
        if (!book.isbn) {
            book.isbn = 'Not available';
        }
        
        // Ensure numeric fields are valid
        if (typeof book.price !== 'number' || book.price < 0) {
            book.price = 0;
        }
        
        if (typeof book.number_of_pages !== 'number' || book.number_of_pages < 0) {
            book.number_of_pages = 0;
        }
        
        // Ensure arrays exist
        if (!Array.isArray(book.tags)) {
            book.tags = [];
        }
        
        if (!Array.isArray(book.key_features)) {
            book.key_features = [];
        }
        
        // Ensure image object exists
        if (!book.bookimage) {
            book.bookimage = {
                url: '',
                title: book.title || 'New Book Image'
            };
        }
        
        liveEdit && addEditableTags(book, "newbookinfoextended", true);
        
        console.log(`✅ Successfully loaded extended info for new book: ${book.title}`);
        return book;
    } catch (error) {
        console.error('❌ Error fetching extended new book info:', error);
        console.error('❌ Error stack:', error.stack);
        return null;
    }
};

export const metaData = (seo) => {
    const metaArr = [];
    for (const key in seo) {
        if (seo.enable_search_indexing) {
            metaArr.push(
                <meta
                    name={
                        key.includes('meta_')
                            ? key.split('meta_')[1].toString()
                            : key.toString()
                    }
                    content={seo[key].toString()}
                    key={key}
                />
            );
        }
    }
    return metaArr;
};