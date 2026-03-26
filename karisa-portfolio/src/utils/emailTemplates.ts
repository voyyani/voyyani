export const submissionEmailTemplate = (
  senderName: string,
  senderEmail: string,
  phone: string | undefined,
  subject: string,
  message: string,
  dashboardUrl: string,
  portfolioUrl: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Portfolio Inquiry</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    .sender-info {
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .info-row {
      margin: 8px 0;
      display: flex;
      align-items: flex-start;
    }
    .info-label {
      font-weight: 600;
      color: #667eea;
      min-width: 80px;
      margin-right: 12px;
    }
    .info-value {
      word-break: break-all;
      color: #333;
    }
    .message-box {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      border: 1px solid #e0e0e0;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 30px;
      flex-wrap: wrap;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
    }
    .button-primary {
      background: #667eea;
      color: #ffffff;
    }
    .button-primary:hover {
      background: #5568d3;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .button-secondary {
      background: #e0e0e0;
      color: #333;
    }
    .button-secondary:hover {
      background: #d0d0d0;
    }
    .footer {
      background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
    .timestamp {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📨 New Portfolio Inquiry</h1>
      <p>Someone is interested in connecting with you</p>
    </div>

    <div class="content">
      <div class="section">
        <h3 class="section-title">Sender Information</h3>
        <div class="sender-info">
          <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${senderName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Email:</span>
            <span class="info-value"><a href="mailto:${senderEmail}">${senderEmail}</a></span>
          </div>
          ${phone ? `
          <div class="info-row">
            <span class="info-label">Phone:</span>
            <span class="info-value"><a href="tel:${phone}">${phone}</a></span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="info-label">Subject:</span>
            <span class="info-value">${subject}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">Message</h3>
        <div class="message-box">${message}</div>
      </div>

      <div class="action-buttons">
        <a href="${dashboardUrl}" class="button button-primary">
          Reply in Dashboard
        </a>
        <a href="mailto:${senderEmail}?subject=Re: ${encodeURIComponent(subject)}" class="button button-secondary">
          Reply by Email
        </a>
      </div>

      <div class="timestamp">
        Submitted on ${new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })} UTC
      </div>
    </div>

    <div class="footer">
      <p>
        This is an automated message from your portfolio website.
        <br>
        <a href="${portfolioUrl}">Visit your portfolio</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

export const confirmationEmailTemplate = (
  senderName: string,
  subject: string,
  portfolioUrl: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .message-title {
      color: #667eea;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .subject-box {
      background: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 24px;
    }
    .subject-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .subject-text {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .footer {
      background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Message Received</h1>
      <p>Thank you for reaching out!</p>
    </div>

    <div class="content">
      <div class="message">
        <span class="message-title">Hi ${senderName},</span>
        <p>
          Thank you for your message! I've received your inquiry and will review it carefully.
          I aim to respond to all inquiries within 24-48 hours.
        </p>
      </div>

      <div class="subject-box">
        <div class="subject-label">Your Subject Line:</div>
        <div class="subject-text">${subject}</div>
      </div>

      <p>
        In the meantime, feel free to explore more of my work and projects. If you have any additional
        information to share or urgent matters to discuss, please reply directly to this email.
      </p>

      <p>
        Looking forward to connecting with you!
        <br>
        <strong>Warm regards</strong>
      </p>
    </div>

    <div class="footer">
      <p>
        <a href="${portfolioUrl}">Visit my portfolio</a> |
        This is an automated confirmation message
      </p>
    </div>
  </div>
</body>
</html>
`;

export const replyEmailTemplate = (
  recipientName: string,
  replyMessage: string,
  originalSubject: string,
  originalMessage: string,
  portfolioUrl: string
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re: ${originalSubject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: #f5f5f5;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 12px 0;
    }
    .reply-message {
      background: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      border: 1px solid #e0e0e0;
      margin-bottom: 24px;
    }
    .divider {
      border: 0;
      border-top: 2px solid #e0e0e0;
      margin: 30px 0;
    }
    .quoted-section {
      background: #f5f5f5;
      padding: 20px;
      border-left: 4px solid #ddd;
      border-radius: 4px;
    }
    .quoted-header {
      font-size: 12px;
      color: #999;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .quoted-message {
      white-space: pre-wrap;
      word-wrap: break-word;
      font-size: 14px;
      line-height: 1.5;
      color: #666;
    }
    .footer {
      background: #f9f9f9;
      border-top: 1px solid #e0e0e0;
      padding: 20px 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 Re: ${originalSubject}</h1>
      <p>Your message has been answered</p>
    </div>

    <div class="content">
      <div class="section">
        <p style="margin-top: 0;">Hi ${recipientName},</p>
        <div class="reply-message">${replyMessage}</div>
      </div>

      <hr class="divider">

      <div class="section">
        <h3 class="section-title">Original Message</h3>
        <div class="quoted-section">
          <div class="quoted-header">You wrote:</div>
          <div class="quoted-message">${originalMessage}</div>
        </div>
      </div>

      <p style="margin-top: 24px;">
        Looking forward to continuing our conversation!
      </p>
    </div>

    <div class="footer">
      <p>
        <a href="${portfolioUrl}">Visit my portfolio</a>
      </p>
    </div>
  </div>
</body>
</html>
`;
