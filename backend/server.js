import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import urlRoutes from './routes/url.js';
import authRoutes from './routes/auth.js';

const app = express();
const port = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json()); // important for JSON parsing

// MongoDB connection
mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', urlRoutes);        
app.use('/api/auth', authRoutes);    

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
