import User from '../models/User.js';
import { generateOTP, saveOTP, verifyOTP, sendOTPEmail } from '../utils/email.js';
import { generateToken } from '../utils/jwt.js';

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log('Registration attempt:', { name, email });

    // Check if email is from IITR domain
    if (!email.toLowerCase().endsWith('iitr.ac.in')) {
      return res.status(400).json({
        status: 'error',
        message: 'Please use an IITR email address'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already in use'
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    console.log('User created successfully:', user._id);

    // Generate and send OTP
    const otp = generateOTP();
    await saveOTP(email, otp);
    console.log('OTP generated and saved:', otp);
    
    // For testing purposes, let's bypass email verification temporarily
    user.verified = true;
    await user.save();
    console.log('User marked as verified for testing');
    
    // Attempt to send email, but don't block registration if it fails
    try {
      const emailSent = await sendOTPEmail(email, otp);
      console.log('Email sending attempt result:', emailSent);
      
      if (!emailSent) {
        console.warn(`OTP email could not be sent to ${email}, but registration will proceed`);
      }
    } catch (emailError) {
      console.error('Error in email sending process:', emailError);
    }

    // Generate JWT token for direct login
    const token = generateToken(user._id);

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    };

    // Send token as cookie
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Auto-verified for testing purposes.',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Verify email with OTP
export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verify OTP
    const isValid = await verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired OTP'
      });
    }

    // Update user verification status
    const user = await User.findOneAndUpdate(
      { email },
      { verified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    // Send token as cookie
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is from IITR domain
    if (!email.toLowerCase().endsWith('iitr.ac.in')) {
      return res.status(400).json({
        status: 'error',
        message: 'Please use an IITR email address'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Generate and send OTP
    const otp = generateOTP();
    await saveOTP(email, otp);
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send verification email. Please try again.'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and password'
      });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };

    // Send token as cookie
    res.cookie('jwt', token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Logout user
export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Get current user
export const getMe = async (req, res) => {
  try {
    // Remove sensitive information
    const user = req.user.toObject();
    delete user.password;
    delete user.otp;
    delete user.otpExpires;

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user data'
    });
  }
};
