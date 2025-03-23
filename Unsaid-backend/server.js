import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const connectDB = () => {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch((error) => console.log(error.message));
      
};

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
