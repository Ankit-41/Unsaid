import nodemailer from 'nodemailer';
import crypto from 'crypto';
import OTP from '../models/OTP.js';

// Configure nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate a 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Save OTP to database
export const saveOTP = async (email, otp) => {
  // Delete any existing OTPs for this email
  await OTP.deleteMany({ email });
  
  // Create new OTP record
  await OTP.create({
    email,
    otp
  });
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const otpRecord = await OTP.findOne({ email, otp });
  return !!otpRecord;
};

// Send OTP email
export const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"Unsaid Portal" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Email Verification OTP for Unsaid Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #4a4a4a;">Verify Your Email</h2>
        <p style="color: #666;">Hello,</p>
        <p style="color: #666;">Thank you for registering with the Unsaid Portal. Please use the following OTP to verify your email address:</p>
        <div style="background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This OTP is valid for 10 minutes only.</p>
        <p style="color: #666;">If you did not request this verification, please ignore this email.</p>
        <p style="color: #666; margin-top: 20px;">Regards,<br>Unsaid Portal Team</p>
      </div>
    `
  };
  
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
