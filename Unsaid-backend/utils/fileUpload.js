import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Force reload environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Debug environment variables
console.log('Environment variables loaded:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || 'Not set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Set (hidden)' : 'Not set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : 'Not set');

// Configure cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file to cloudinary
 */
export const uploadFile = async (file, folder = 'unsaid_uploads') => {
  try {
    console.log('Starting Cloudinary upload...');
    
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Cloudinary credentials missing. Please check your .env file.');
      throw new Error('Cloudinary credentials missing');
    }
    
    // Log file details
    console.log('File details:', {
      name: file.name,
      size: file.size,
      mimetype: file.mimetype,
      tempFilePath: file.tempFilePath,
      hasData: !!file.data
    });
    
    // Use express-fileupload's built-in temp file if available
    if (file.tempFilePath && fs.existsSync(file.tempFilePath) && fs.statSync(file.tempFilePath).size > 0) {
      console.log('Using tempFilePath provided by express-fileupload:', file.tempFilePath);
      console.log('Temp file size:', fs.statSync(file.tempFilePath).size, 'bytes');
      
      // Upload directly from temp file path
      const result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
        folder,
        resource_type: 'auto',
      });
      
      console.log('Cloudinary upload successful, result:', {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type
      });
      
      return result.secure_url;
    }
    
    // Otherwise create our own temp file (this is a fallback, but should rarely be needed)
    if (file.data && file.data.length > 0) {
      const tempFilePath = path.join(process.cwd(), 'temp', Date.now() + '_' + (file.name || 'upload.jpg'));
      const dir = path.dirname(tempFilePath);
      
      console.log('Creating temporary file at:', tempFilePath);
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(dir)) {
        console.log('Creating directory:', dir);
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write file to temporary location
      console.log('Writing file data to temp location...');
      await fs.promises.writeFile(tempFilePath, file.data);
      console.log('File written successfully, size:', fs.statSync(tempFilePath).size, 'bytes');
      
      if (fs.statSync(tempFilePath).size === 0) {
        console.error('Temporary file is empty after writing');
        throw new Error('Failed to write file data');
      }
      
      // Upload to cloudinary
      console.log('Uploading to Cloudinary...');
      
      const result = await cloudinary.v2.uploader.upload(tempFilePath, {
        folder,
        resource_type: 'auto',
      });
      
      console.log('Cloudinary upload successful, result:', {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type
      });
      
      // Delete temporary file
      console.log('Cleaning up temporary file...');
      await fs.promises.unlink(tempFilePath);
      console.log('Temporary file deleted');
      
      return result.secure_url;
    }
    
    // If we get here, we don't have a valid file
    throw new Error('No valid file data found');
  } catch (error) {
    console.error('Error in Cloudinary upload:', error);
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

/**
 * Upload a buffer to cloudinary
 * @param {Buffer} buffer - The buffer to upload
 * @param {string} folder - The folder to upload to
 * @returns {Promise<string>} - The URL of the uploaded file
 */
export const uploadBuffer = async (buffer, folder = 'unsaid_uploads') => {
  try {
    // Create temporary file path
    const tempFilePath = path.join(process.cwd(), 'temp', `upload_${Date.now()}.jpg`);
    const dir = path.dirname(tempFilePath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Write buffer to temporary location
    await fs.promises.writeFile(tempFilePath, buffer);
    
    // Upload to cloudinary
    const result = await cloudinary.v2.uploader.upload(tempFilePath, {
      folder,
      resource_type: 'auto',
    });
    
    // Delete temporary file
    await fs.promises.unlink(tempFilePath);
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading buffer:', error);
    throw new Error('Error uploading buffer');
  }
}; 