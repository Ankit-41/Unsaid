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

export default cloudinary; 