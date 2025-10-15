// Lytics Analytics Utility Functions

interface BookViewEventData {
  book_id: string;
  book_title: string;
  book_author?: string;
  book_genre?: string;
  book_price?: number;
  book_pages?: number;
  book_tags?: string[];
  is_new_arrival?: boolean;
  page_type?: string;
  additional_data?: Record<string, any>;
}

interface AddToCartEventData {
  book_id: string;
  book_title: string;
  book_author?: string;
  book_genre?: string;
  book_price?: number;
  quantity?: number;
  cart_total?: number;
  additional_data?: Record<string, any>;
}

interface SearchEventData {
  search_query: string;
  search_results_count?: number;
  search_category?: string;
  additional_data?: Record<string, any>;
}

class LyticsAnalytics {
  /**
   * Check if Lytics jstag is available
   */
  static isAvailable(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.jstag !== 'undefined' && 
           typeof window.jstag.send === 'function';
  }

  /**
   * Send a generic event to Lytics
   */
  static sendEvent(eventName: string, eventData: Record<string, any>): void {
    try {
      if (!this.isAvailable()) {
        console.warn('⚠️ Lytics jstag not available');
        return;
      }

      const enrichedData = {
        event: eventName,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title,
        user_agent: navigator.userAgent,
        ...eventData
      };

      window.jstag.send(enrichedData);
      console.log(`📊 Lytics ${eventName} event sent:`, enrichedData);
    } catch (error) {
      console.error(`❌ Error sending Lytics ${eventName} event:`, error);
    }
  }

  /**
   * Track book view event
   */
  static trackBookView(data: BookViewEventData): void {
    this.sendEvent('book_viewed', {
      book_id: data.book_id,
      book_title: data.book_title,
      book_author: data.book_author,
      book_genre: data.book_genre,
      book_price: data.book_price,
      book_pages: data.book_pages,
      book_tags: data.book_tags || [],
      is_new_arrival: data.is_new_arrival || false,
      page_type: data.page_type || 'book_card',
      ...data.additional_data
    });
  }

  /**
   * Track add to cart event
   */
  static trackAddToCart(data: AddToCartEventData): void {
    this.sendEvent('add_to_cart', {
      book_id: data.book_id,
      book_title: data.book_title,
      book_author: data.book_author,
      book_genre: data.book_genre,
      book_price: data.book_price,
      quantity: data.quantity || 1,
      cart_total: data.cart_total,
      ...data.additional_data
    });
  }

  /**
   * Track search event
   */
  static trackSearch(data: SearchEventData): void {
    this.sendEvent('search', {
      search_query: data.search_query,
      search_results_count: data.search_results_count,
      search_category: data.search_category,
      ...data.additional_data
    });
  }

  /**
   * Track page view (enhanced version of the default pageView)
   */
  static trackPageView(additionalData?: Record<string, any>): void {
    this.sendEvent('page_view', {
      page_path: window.location.pathname,
      page_search: window.location.search,
      page_hash: window.location.hash,
      referrer: document.referrer,
      ...additionalData
    });
  }

  /**
   * Track user interaction events
   */
  static trackInteraction(interactionType: string, data?: Record<string, any>): void {
    this.sendEvent('user_interaction', {
      interaction_type: interactionType,
      ...data
    });
  }
}

export default LyticsAnalytics;
export type { BookViewEventData, AddToCartEventData, SearchEventData };
