import { Resend } from 'resend';

// Initialize Resend only if API key is provided
let resend = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✉️  Resend email service configured');
} else {
  console.log('ℹ️  Resend API key not configured, email features will be disabled');
}

/**
 * Send email using Resend
 */
export const sendEmailService = async ({ to, subject, html, text }) => {
  if (!resend) {
    console.log('📧 Email sending skipped (no API key configured):', { to, subject });
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const data = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@memtribe.com',
      to: Array.isArray(to) ? to : [to],
      subject,
      html: html || text,
      text: text || undefined
    });

    return data;
  } catch (error) {
    console.error('Email send error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send RSVP confirmation email
 */
export const sendRSVPConfirmation = async ({ guestEmail, guestName, eventTitle, eventDate, eventLocation }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d97706; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #d97706; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>RSVP Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${guestName},</h2>
            <p>Thank you for confirming your attendance at <strong>${eventTitle}</strong>!</p>
            <p><strong>Event Details:</strong></p>
            <ul>
              <li><strong>Event:</strong> ${eventTitle}</li>
              <li><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</li>
              <li><strong>Location:</strong> ${eventLocation}</li>
            </ul>
            <p>We look forward to seeing you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MemTribe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailService({
    to: guestEmail,
    subject: `RSVP Confirmed: ${eventTitle}`,
    html
  });
};

/**
 * Send event reminder email
 */
export const sendEventReminder = async ({ to, eventTitle, eventDate, eventLocation }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d97706; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Event Reminder</h1>
          </div>
          <div class="content">
            <h2>Don't forget!</h2>
            <p><strong>${eventTitle}</strong> is coming up soon!</p>
            <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> ${eventLocation}</p>
            <p>We're excited to see you there!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MemTribe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmailService({
    to,
    subject: `Reminder: ${eventTitle}`,
    html
  });
};

