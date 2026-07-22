const nodemailer = require('nodemailer');
const { env } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (to, name, token) => {
  const verifyUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  
  if (process.env.NODE_ENV === 'test') {
    console.log(`[TEST MODE] Mock verification email: ${verifyUrl}`);
    return;
  }

  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: 'Verify Your CrustCraft Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #e0530e; text-align: center;">Welcome to CrustCraft, ${name}!</h2>
        <p>Thank you for signing up. To start customizing your pizza and ordering, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #e0530e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;"><a href="${verifyUrl}">${verifyUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 24 hours. If you did not create a CrustCraft account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Verification email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${to}:`, error);
    console.log(`👉 [DEV MODE VERIFICATION LINK]: ${verifyUrl}`);
  }
};

const sendPasswordResetEmail = async (to, name, token) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  if (process.env.NODE_ENV === 'test') {
    console.log(`[TEST MODE] Mock password reset email: ${resetUrl}`);
    return;
  }

  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: 'CrustCraft Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #e0530e; text-align: center;">Password Reset Request</h2>
        <p>Hello ${name},</p>
        <p>We received a request to reset the password for your CrustCraft account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e0530e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;"><a href="${resetUrl}">${resetUrl}</a></p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Password reset email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${to}:`, error);
    console.log(`👉 [DEV MODE RESET LINK]: ${resetUrl}`);
  }
};

const sendLowStockEmail = async (to, items) => {
  if (process.env.NODE_ENV === 'test') {
    console.log(`[TEST MODE] Mock low stock email alert to admin: ${to}`);
    return;
  }

  const itemsHtml = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px; font-weight: bold;">${item.name}</td>
      <td style="padding: 10px; color: #d9534f; font-weight: bold;">${item.quantity}</td>
      <td style="padding: 10px; color: #555;">${item.threshold}</td>
    </tr>
  `
    )
    .join('');

  const mailOptions = {
    from: env.EMAIL_FROM,
    to,
    subject: '⚠️ CrustCraft Admin Alert: Low Stock Warning',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #d9534f; text-align: center;">⚠️ Low Stock Ingredients Alert</h2>
        <p>The following ingredients have fallen below their configured stock threshold. Please restock them to avoid order disruption:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #ddd; text-align: left;">
              <th style="padding: 10px;">Ingredient</th>
              <th style="padding: 10px;">Current Stock</th>
              <th style="padding: 10px;">Threshold Alert</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${env.FRONTEND_URL}/admin/inventory" style="background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Manage Inventory</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated report sent by CrustCraft scheduler.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✉️ Low-stock email alert sent to admin: ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send low-stock email alert:`, error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendLowStockEmail,
};
