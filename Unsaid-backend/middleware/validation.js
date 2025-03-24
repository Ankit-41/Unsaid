import { z } from 'zod';

// User registration validation schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address').refine(
    (email) => email.toLowerCase().endsWith('iitr.ac.in'),
    { message: 'Email must be from IITR domain (iitr.ac.in)' }
  ),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// OTP verification schema
export const otpVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits')
});

// Post creation schema
export const postSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(1000, 'Post content cannot exceed 1000 characters')
});

// Comment creation schema
export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(500, 'Comment cannot exceed 500 characters')
});

// Post status update schema
export const postStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'disapproved', 'removed'], {
    errorMap: () => ({ message: 'Status must be one of: pending, approved, disapproved, removed' })
  })
});

// Middleware to validate request body against a schema
export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const errors = error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }));
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }
};
