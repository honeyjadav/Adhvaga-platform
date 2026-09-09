const nodemailer = require('nodemailer');

/**
 * Sends an email via SMTP if EMAIL_HOST/EMAIL_USER/EMAIL_PASS are set.
 * If they're not set (typical during local dev), it just logs the
 * message to the console instead of failing — so password reset can be
 * tested end-to-end without a real mail provider. Swap in a provider
 * like SendGrid/Mailgun/SES for production by setting the env vars.
 */
async function sendEmail({ to, subject, text, html }) {
  const hasSmtpConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!hasSmtpConfig) {
    console.log('\n--- DEV EMAIL FALLBACK (no SMTP configured in .env) ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(text);
    console.log('--- END EMAIL ---\n');
    return { devFallback: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: Number(process.env.EMAIL_PORT) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });

  return { devFallback: false };
}

module.exports = sendEmail;