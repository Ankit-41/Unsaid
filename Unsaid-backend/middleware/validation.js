import { z } from 'zod';

// User registration validation schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address').refine(
    (email) => {
      // Allow any email that ends with iitr.ac.in, including subdomains
      const emailLower = email.toLowerCase();
      return emailLower.endsWith('iitr.ac.in');
    },
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
  content: z.string().min(1, 'Post content is required').max(1000, 'Post content cannot exceed 1000 characters'),
  isAnonymous: z.union([
    z.boolean(),
    z.string().transform(val => val === 'true')
  ]).optional().default(false),
  spicyLevel: z.union([
    z.number().min(1).max(5),
    z.string().transform(val => parseInt(val) || 1)
  ]).optional().default(1)
});

// Comment creation schema
export const commentSchema = z.object({
  text: z.string().min(1, 'Comment text is required').max(500, 'Comment cannot exceed 500 characters')
});

// Comment reply schema - same validation rules as comments
export const commentReplySchema = z.object({
  text: z.string().min(1, 'Reply text is required').max(500, 'Reply cannot exceed 500 characters')
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
    console.log('Validation middleware received request:');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    // Check if this is a multipart/form-data request (file upload)
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');
    
    if (isMultipart && req.body) {
      // Convert string values to appropriate types for validation
      const convertedBody = { ...req.body };
      
      // Handle boolean values
      if ('isAnonymous' in convertedBody) {
        const val = convertedBody.isAnonymous;
        convertedBody.isAnonymous = val === 'true' || val === true;
      }
      
      // Handle numeric values
      if ('spicyLevel' in convertedBody) {
        convertedBody.spicyLevel = parseInt(convertedBody.spicyLevel) || 1;
      }
      
      // Ensure content is present
      if (!convertedBody.content) {
        return res.status(400).json({
          status: 'error',
          message: 'Post content is required',
          errors: [{ path: 'content', message: 'Post content is required' }]
        });
      }
      
      console.log('Validating converted body:', convertedBody);
      schema.parse(convertedBody);
    } else {
      // Standard validation for JSON requests
      console.log('Validating JSON body:', req.body);
      schema.parse(req.body);
    }
    
    next();
  } catch (error) {
    console.error('Validation error:', error);
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
