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

/**
 * Send guest welcome email when they RSVP
 */
export const sendGuestWelcomeEmail = async ({ 
  guestEmail, 
  guestName, 
  eventTitle, 
  eventDate, 
  eventLocation,
  uploadLink 
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #d97706; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          .info-box { background-color: #fff; border-left: 4px solid #d97706; padding: 15px; margin: 20px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${eventTitle}! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${guestName},</h2>
            <p>Thank you for registering! We're excited to have you join us.</p>
            
            <div class="info-box">
              <p><strong>Event Details:</strong></p>
              <ul style="list-style: none; padding-left: 0;">
                <li>📅 <strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li>📍 <strong>Location:</strong> ${eventLocation}</li>
              </ul>
            </div>

            <h3>What's Next?</h3>
            <p>You can now upload photos and share memories from the event!</p>
            <p style="text-align: center;">
              <a href="${uploadLink}" class="button">Upload Photos</a>
            </p>
            
            <p>We look forward to celebrating with you!</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MemTribe. All rights reserved.</p>
            <p style="color: #999; font-size: 11px;">You're receiving this email because you registered for ${eventTitle}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${guestName},

Thank you for registering for ${eventTitle}!

Event Details:
- Date: ${new Date(eventDate).toLocaleDateString()}
- Location: ${eventLocation}

You can upload photos at: ${uploadLink}

We look forward to celebrating with you!

© ${new Date().getFullYear()} MemTribe. All rights reserved.
  `;

  return sendEmailService({
    to: guestEmail,
    subject: `Welcome to ${eventTitle}! 🎉`,
    html,
    text
  });
};

/**
 * Send welcome email when user signs up
 */
export const sendUserWelcomeEmail = async ({ userEmail, userName }) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d97706; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background-color: #d97706; color: white; text-decoration: none; border-radius: 5px; }
          .feature-list { background-color: #fff; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .feature-list li { margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to MemTribe! 🎉</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName},</h2>
            <p>Thank you for signing up! Your account has been created successfully.</p>
            
            <div class="feature-list">
              <p><strong>With MemTribe, you can:</strong></p>
              <ul>
                <li>📅 Create and manage events</li>
                <li>📸 Collect photos from guests</li>
                <li>🗂️ Organize and share memories</li>
                <li>📖 Generate beautiful photobooks</li>
                <li>🎨 Use AI-powered features</li>
              </ul>
            </div>

            <p>Ready to get started?</p>
            <p style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} MemTribe. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Hello ${userName},

Thank you for signing up! Your MemTribe account has been created successfully.

With MemTribe, you can:
- Create and manage events
- Collect photos from guests
- Organize and share memories
- Generate beautiful photobooks
- Use AI-powered features

Visit your dashboard: ${process.env.CLIENT_URL}/dashboard

© ${new Date().getFullYear()} MemTribe. All rights reserved.
  `;

  return sendEmailService({
    to: userEmail,
    subject: 'Welcome to MemTribe! 🎉',
    html,
    text
  });
};

