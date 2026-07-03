import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send an email via Resend
 * @param {Object} options
 * @param {String} options.to - Recipient email address
 * @param {String} options.subject - Email subject
 * @param {String} options.html - Email HTML body
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "TelecomNet Ghana <info@kofibadu.com>",
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("sendEmail error:", error);
    return { success: false, error };
  }
};

export const otpEmailTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
    <h2 style="color: #0ea5e9;">Your TelecomNet Ghana Verification Code</h2>
    <p>Hi ${name},</p>
    <p>Use the one-time code below to verify your identity and complete your sign-in:</p>
    <div style="background: #f1f5f9; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
    </div>
    <p>This code expires in <strong>10 minutes</strong>. If you did not request it, you can safely ignore this email.</p>
    <p style="margin-top: 24px;">— The TelecomNet Ghana Team</p>
  </div>
`;

export const welcomeEmailTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
    <h2 style="color: #0ea5e9;">Welcome to TelecomNet Ghana, ${name}! 🎉</h2>
    <p>We're thrilled to have you join Ghana's premier networking platform for telecom professionals.</p>
    <p>Here's what you can do now:</p>
    <ul>
      <li>Build your professional profile</li>
      <li>Connect and engage in discussion forums</li>
      <li>Explore job opportunities posted by recruiters</li>
      <li>Access knowledge-sharing resources</li>
    </ul>
    <p>We're excited to see you grow your network and career with us.</p>
    <p style="margin-top: 24px;">— The TelecomNet Ghana Team</p>
  </div>
`;
