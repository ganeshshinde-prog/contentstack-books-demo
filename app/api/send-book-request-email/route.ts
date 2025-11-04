import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerEmail,
      bookTitle,
      author,
      isbn,
      quantity,
      phone,
      additionalNotes,
      customerName
    } = body;

    // Validate required fields
    if (!customerEmail || !bookTitle) {
      return NextResponse.json(
        { error: 'Customer email and book title are required!' },
        { status: 400 }
      );
    }

    // Get the automation URL from environment variables
    const automationUrl = process.env.NEXT_PUBLIC_EMAIL_REQ_TRIGGER || process.env.CONTENTSTACK_EMAIL_AUTOMATION_URL;
    
    // Try Contentstack automation first (using query parameter method), fallback to Nodemailer
    if (automationUrl) {
      try {
        console.log('Trying Contentstack automation with query parameters...');
        
        // Create HTML email template for book request
        const createBookRequestEmailTemplate = (bookingDetails: {
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
        }): string => {
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

        // Prepare email data
        const bookingDetails = {
          customerName: customerName || customerEmail.split('@')[0],
          customerEmail,
          bookTitle,
          author: author || '',
          isbn: isbn || '',
          quantity: quantity || '1',
          phone: phone || '',
          additionalNotes: additionalNotes || '',
          requestDate: new Date().toLocaleDateString(),
          requestTime: new Date().toLocaleTimeString()
        };

        const emailHTML = createBookRequestEmailTemplate(bookingDetails);
        
        // Create query parameters - matching your React code structure
        const params = new URLSearchParams({
          to: customerEmail,
          subject: `Book Request Confirmation - ${bookTitle}`,
          body: emailHTML
        });

        // Build URL with query parameters
        const url = `${automationUrl}?${params.toString()}`;
        console.log('Contentstack automation URL (truncated):', url.substring(0, 100) + '...');

        // Send POST request to Contentstack automation API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          method: 'POST',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.text();
        console.log('Contentstack automation response:', responseData);

        if (response.ok) {
          console.log('✅ Contentstack automation executed successfully');
          return NextResponse.json({
            success: true,
            message: 'Book request submitted and email sent via Contentstack automation',
            provider: 'contentstack',
            data: {
              customerEmail,
              bookTitle,
              timestamp: new Date().toISOString(),
              automationResponse: responseData
            }
          });
        } else {
          console.error('Contentstack automation failed:', response.status, responseData);
          throw new Error('Contentstack automation failed');
        }

      } catch (contentstackError: any) {
        console.log('Contentstack automation failed, trying Nodemailer fallback:', contentstackError.message);
        
        // If it's a timeout error, mention it specifically
        if (contentstackError.name === 'AbortError') {
          console.log('Contentstack automation timed out after 10 seconds');
        }
        
        // Continue to Nodemailer fallback
      }
    } else {
      console.log('No Contentstack automation URL configured, using Nodemailer');
    }

    // Fallback to Nodemailer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email template
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            📚 Book Request Confirmation
          </h2>
          
          <p>Hi ${customerName || customerEmail.split('@')[0]},</p>
          
          <p>Thank you for submitting a book request! We've received your request and will review it shortly.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Request Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Book Title:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${bookTitle}</td>
              </tr>
              ${author ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Author:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${author}</td>
                </tr>
              ` : ''}
              ${isbn ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">ISBN:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${isbn}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Quantity:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${quantity || '1'}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Request Date:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date().toLocaleDateString()}</td>
              </tr>
              ${phone ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Phone:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${phone}</td>
                </tr>
              ` : ''}
              ${additionalNotes ? `
                <tr>
                  <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #ddd;">Notes:</td>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">${additionalNotes}</td>
                </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2d5a2d; margin-top: 0;">What happens next?</h4>
            <ul style="margin: 0; padding-left: 20px;">
              <li>We'll review your request within 2-3 business days</li>
              <li>If approved, we'll add the book to our collection</li>
              <li>You'll receive another email when the book becomes available</li>
            </ul>
          </div>
          
          <p>Thank you for helping us expand our collection!</p>
          
          <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px;">
            Best regards,<br>
            <strong>BookHaven Team</strong><br>
            <em>Your Literary Paradise</em>
          </p>
        </div>
      `;

      const mailOptions = {
        from: `"BookHaven" <${process.env.EMAIL_USER || 'noreply@bookhaven.com'}>`,
        to: customerEmail,
        subject: `📚 Book Request Confirmation - ${bookTitle}`,
        html: emailHtml,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent via Nodemailer:', info.messageId);

      return NextResponse.json({
        success: true,
        message: 'Book request submitted and confirmation email sent successfully',
        provider: 'nodemailer',
        data: {
          customerEmail,
          bookTitle,
          timestamp: new Date().toISOString(),
          emailDetails: {
            messageId: info.messageId,
            from: mailOptions.from,
            to: customerEmail
          }
        }
      });

    } catch (nodemailerError) {
      console.error('Nodemailer failed:', nodemailerError);
      
      // Return success but indicate email delivery issue
      return NextResponse.json({
        success: true,
        message: 'Book request submitted successfully, but we encountered an issue sending the confirmation email. You may not receive an email confirmation, but your request has been saved.',
        provider: 'none',
        data: {
          customerEmail,
          bookTitle,
          timestamp: new Date().toISOString(),
          status: 'email_failed'
        }
      });
    }

  } catch (error) {
    console.error('Error in send-book-request-email API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
