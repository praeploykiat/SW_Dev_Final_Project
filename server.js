const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

const companies = require('./routes/companies');
const auth = require('./routes/auth');
const bookings = require('./routes/bookings');
const aiRoutes = require('./routes/aiController');
const passwordReset = require('./routes/passwordReset');
const resume = require('./routes/resume.js');
const bookmark = require('./routes/bookmark');

// Load environment variables
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());         // Body parser
app.use(cookieParser());         // Cookie parser

// Mount routes
app.use('/api/v1/companies', companies);
app.use('/api/v1/auth', auth);
app.use('/api/v1/bookings', bookings);
app.use('/api/ai', aiRoutes);
app.use('/api/v1/auth', passwordReset);
app.use('/api/v1/auth', resume);
app.use('/api/v1/bookmarks', bookmark);

// Global error handler — this should be placed **AFTER** all routes
app.use((err, req, res, next) => {
    console.error(err.stack);
  
    if (err.name === 'MulterError') {
      // e.g. too many files, unexpected field
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
    }
  
    res.status(500).json({
      success: false,
      message: err.message || 'Server Error'
    });
  });
  
// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
