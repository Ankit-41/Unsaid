/**
 * This script helps set up the .env file with proper Cloudinary credentials
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env file exists
const envExists = fs.existsSync(envPath);

console.log('\n=== Unsaid Backend Environment Setup ===\n');

if (envExists) {
  console.log('An existing .env file was found.');
  rl.question('Do you want to update it? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      updateEnvFile();
    } else {
      console.log('Setup canceled. Your existing .env file was not modified.');
      rl.close();
    }
  });
} else {
  console.log('No .env file found. Creating a new one...');
  updateEnvFile();
}

function updateEnvFile() {
  // Read existing .env if it exists, otherwise use example
  let envContent = '';
  
  if (envExists) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    const examplePath = path.join(__dirname, '.env.example');
    if (fs.existsSync(examplePath)) {
      envContent = fs.readFileSync(examplePath, 'utf8');
    } else {
      // Create basic template if no example exists
      envContent = `
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://your_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
FRONTEND_URL=http://localhost:5173
EMAIL_USERNAME=your_email
EMAIL_PASSWORD=your_app_password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
      `.trim();
    }
  }

  console.log('\nPlease enter your Cloudinary credentials:');
  console.log('(You can find these in your Cloudinary dashboard)\n');
  
  rl.question('Cloudinary Cloud Name: ', (cloudName) => {
    rl.question('Cloudinary API Key: ', (apiKey) => {
      rl.question('Cloudinary API Secret: ', (apiSecret) => {
        // Update env content with new values
        envContent = envContent
          .replace(/CLOUDINARY_CLOUD_NAME=.*$/m, `CLOUDINARY_CLOUD_NAME=${cloudName}`)
          .replace(/CLOUDINARY_API_KEY=.*$/m, `CLOUDINARY_API_KEY=${apiKey}`)
          .replace(/CLOUDINARY_API_SECRET=.*$/m, `CLOUDINARY_API_SECRET=${apiSecret}`);
        
        // Write updated content to .env file
        fs.writeFileSync(envPath, envContent);
        
        console.log('\nYour .env file has been updated with Cloudinary credentials.');
        console.log('Restart your server for changes to take effect.');
        rl.close();
      });
    });
  });
} 