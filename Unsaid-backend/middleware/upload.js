import fileUpload from 'express-fileupload';
import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// Force reload environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure express-fileupload
const upload = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  abortOnLimit: true,
  createParentPath: true,
  debug: true,
  safeFileNames: true,
  preserveExtension: true,
  parseNested: true,
  uploadTimeout: 60000, // 60 seconds
});

export { upload }; 