/**
 * This script fixes posts with local image URLs by replacing them with a placeholder
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Import Post model
import Post from './models/Post.js';

// Placeholder image URL
const PLACEHOLDER_IMAGE = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg';

async function fixLegacyImages() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Find posts with local image URLs
    console.log('Finding posts with local image URLs...');
    const localImagePattern = /^(\/uploads\/|http:\/\/localhost)/;
    
    const posts = await Post.find({ 
      image: { $regex: localImagePattern } 
    });
    
    console.log(`Found ${posts.length} posts with local image URLs`);
    
    // Update each post
    let updatedCount = 0;
    for (const post of posts) {
      console.log(`Post ${post._id}: Replacing ${post.image} with placeholder`);
      post.image = PLACEHOLDER_IMAGE;
      await post.save();
      updatedCount++;
    }
    
    console.log(`Updated ${updatedCount} posts`);
    console.log('Done!');
  } catch (error) {
    console.error('Error fixing legacy images:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
fixLegacyImages(); 