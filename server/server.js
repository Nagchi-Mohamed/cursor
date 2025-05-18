require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');

// Custom middleware
const { errorHandler } = require('./middleware/errorHandler');
const { 
  apiLimiter, 
  authLimiter, 
  adminLimiter, 
  solverLimiter 
} = require('./middleware/rateLimiter');

// Route files
const solverRoutes = require('./routes/solverRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const lessonRoutes = require('./routes/lessons');
const practiceSetRoutes = require('./routes/practiceSets');
const forumRoutes = require('./routes/forumRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminLessonRoutes = require('./routes/adminLessonRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminFeedbackRoutes = require('./routes/adminFeedbackRoutes');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security Middleware
app.use(helmet()); // Set security HTTP headers with reasonable defaults

// Add Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "cdn.jsdelivr.net", "*.wolframalpha.com"],
      connectSrc: ["'self'", "api.wolframalpha.com"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  })
);

// Set appropriate security headers
app.use(helmet.noSniff()); // Prevents browsers from MIME-sniffing
app.use(helmet.frameguard({ action: 'deny' })); // Prevents clickjacking
app.use(helmet.xssFilter()); // Adds X-XSS-Protection header
app.use(helmet.ieNoOpen()); // Sets X-Download-Options for IE8+
app.use(helmet.referrerPolicy({ policy: 'same-origin' })); // Restricts origins of referrer info

// Data sanitization against NoSQL query injection
app.use(mongoSanitize({
  allowDots: true, // Allows MongoDB dot notation
  replaceWith: '_' // Replace $ and . with _
}));

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'page', 'limit', 'sort', 'fields', 'category', 'difficulty', 
    'status', 'role', 'search', 'sortBy', 'sortOrder'
  ]
}));

// Body parser, cookie parser, and compression
app.use(express.json({ limit: '10kb' })); // Limit request body size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser(process.env.COOKIE_SECRET)); // Parse cookies
app.use(compression()); // Compress all responses

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // How long preflight requests can be cached (24 hours)
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mathsphere', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Apply rate limiting to all routes
app.use('/api', apiLimiter);

// Routes with specific rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/solver', solverLimiter);
app.use('/api/v1/admin', adminLimiter);

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/practice-sets', practiceSetRoutes);
app.use('/api/solver', solverRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/v1/feedback', feedbackRoutes);

// Admin routes
app.use('/api/v1/admin/lessons', adminLessonRoutes);
app.use('/api/v1/admin/stats', adminStatsRoutes);
app.use('/api/v1/admin/users', adminUserRoutes);
app.use('/api/v1/admin/feedback', adminFeedbackRoutes);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle undefined routes
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  
  // Give server time to finish pending requests before exiting
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
}); 