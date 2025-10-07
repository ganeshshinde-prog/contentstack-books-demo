// Email service for sending book request confirmation emails via Contentstack automation
// Adapted from React code to work with Next.js

interface BookRequestDetails {
  customerName: string;
  customerEmail: string;
  bookTitle: string;
  author?: string;
  isbn?: string;
  quantity: string;
  phone?: string;
  additionalNotes?: string;
  requestDate: string;
  requestTime: string;
}

/**
 * Creates HTML email template for book request confirmation
 */
const createBookRequestEmailTemplate = (bookingDetails: BookRequestDetails): string => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; text-align: center; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
        📚 Book Request Confirmation
      </h2>
      
      <div style="background-color: #F9F9F9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #555; margin-top: 0;">Thank you for your book request!</h3>
        <p>Hi ${bookingDetails.customerName},</p>
        <p>We've received your request and will review it shortly.</p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        
        <h4 style="color: #555;">Request Details:</h4>
        <p><strong>Book Title:</strong> ${bookingDetails.bookTitle}</p>
        ${bookingDetails.author ? `<p><strong>Author:</strong> ${bookingDetails.author}</p>` : ''}
        ${bookingDetails.isbn ? `<p><strong>ISBN:</strong> ${bookingDetails.isbn}</p>` : ''}
        <p><strong>Quantity:</strong> ${bookingDetails.quantity}</p>
        <p><strong>Request Date:</strong> ${bookingDetails.requestDate}</p>
        <p><strong>Request Time:</strong> ${bookingDetails.requestTime}</p>
        
        <hr style="border: 1px solid #ddd; margin: 20px 0;">
        
        <h4 style="color: #555;">Customer Information:</h4>
        <p><strong>Name:</strong> ${bookingDetails.customerName}</p>
        <p><strong>Email:</strong> ${bookingDetails.customerEmail}</p>
        ${bookingDetails.phone ? `<p><strong>Phone:</strong> ${bookingDetails.phone}</p>` : ''}
        ${bookingDetails.additionalNotes ? `<p><strong>Additional Notes:</strong> ${bookingDetails.additionalNotes}</p>` : ''}
      </div>
      
      <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #2d5a2d; margin-top: 0;">What happens next?</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>We'll review your request within 2-3 business days</li>
          <li>If approved, we'll add the book to our collection</li>
          <li>You'll receive another email when the book becomes available</li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #666; font-size: 12px;">
        This is an automated confirmation email. Please keep this for your records.
      </p>
      
      <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; text-align: center;">
        Best regards,<br>
        <strong>BookHaven Team</strong><br>
        <em>Your Literary Paradise</em>
      </p>
    </div>
  `;
};

/**
 * Sends confirmation email via Contentstack automation API using query parameters
 * (Matches the React code pattern)
 */
export const sendBookRequestConfirmationEmail = async (bookRequestDetails: BookRequestDetails): Promise<{
  success: boolean;
  message: string;
  provider: string;
}> => {
  try {
    // Get automation URL from environment
    const contentstackAutomationUrl = process.env.NEXT_PUBLIC_EMAIL_REQ_TRIGGER;
    
    if (!contentstackAutomationUrl) {
      throw new Error('NEXT_PUBLIC_EMAIL_REQ_TRIGGER not configured');
    }

    const emailHTML = createBookRequestEmailTemplate(bookRequestDetails);
    
    // Create query parameters - matching your React code structure
    const params = new URLSearchParams({
      to: bookRequestDetails.customerEmail,
      subject: `Book Request Confirmation - ${bookRequestDetails.bookTitle}`,
      body: emailHTML
    });

    // Build URL with query parameters
    const url = `${contentstackAutomationUrl}?${params.toString()}`;
    console.log('Contentstack URL (truncated):', url.substring(0, 100) + '...');

    // Send POST request to Contentstack automation API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      console.log('✅ Contentstack email sent successfully');
      return {
        success: true,
        message: 'Email sent successfully via Contentstack automation',
        provider: 'contentstack'
      };
    } else {
      console.error('Contentstack automation failed:', response.status, await response.text());
      return {
        success: false,
        message: 'Failed to send email via Contentstack automation',
        provider: 'contentstack'
      };
    }
  } catch (error: any) {
    console.error('Email service error:', error.message);
    
    if (error.name === 'AbortError') {
      return {
        success: false,
        message: 'Email request timed out after 10 seconds',
        provider: 'contentstack'
      };
    }
    
    return {
      success: false,
      message: error.message || 'Unknown error occurred',
      provider: 'contentstack'
    };
  }
};

// Type export for use in other files
export type { BookRequestDetails };
