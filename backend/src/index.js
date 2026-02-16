require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const setupRoutes = require('./routes/setupRoutes');
const authRoutes = require('./routes/authRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const roomRoutes = require('./routes/roomRoutes');
const userRoutes = require('./routes/userRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost',
    'https://aturuang.vercel.app',
    /\.vercel\.app$/  // Allow all vercel.app subdomains
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Create API router
const apiRouter = express.Router();

// Mount all routes to API router
apiRouter.use('/setup', setupRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/organizations', organizationRoutes);
apiRouter.use('/rooms', roomRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/bookings', bookingRoutes);
apiRouter.use('/settings', settingsRoutes);

// Mount API router to app
app.use('/api', apiRouter);
console.log('✅ All API routes mounted to /api');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Aturuang API - Meeting Room Management System',
    version: '0.5.0',
    description: 'Multi-tenant organization-based meeting room booking system',
    endpoints: {
      setup: '/api/setup',
      auth: '/api/auth',
      organizations: '/api/organizations',
      rooms: '/api/rooms',
      users: '/api/users',
      bookings: '/api/bookings',
      health: '/health',
    },
    features: [
      'Organization-based multi-tenancy',
      'Role-based access control (superadmin, org_admin, user)',
      'Room image uploads',
      'Public and private rooms',
      'Organization-based booking approval',
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🏢 Multi-tenant organization system enabled`);
});

module.exports = app;
