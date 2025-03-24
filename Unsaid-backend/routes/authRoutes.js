import express from 'express';
import { 
  register, 
  verifyEmail, 
  resendOTP, 
  login, 
  logout, 
  getMe 
} from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { 
  registerSchema, 
  loginSchema, 
  otpVerificationSchema 
} from '../middleware/validation.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/verify-email', validate(otpVerificationSchema), verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/login', validate(loginSchema), login);
router.get('/logout', logout);

// Protected routes
router.get('/me', protect, getMe);

export default router;
