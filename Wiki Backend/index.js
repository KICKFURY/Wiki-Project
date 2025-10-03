// index.js
require('dotenv').config();
const ServerConfig = require('./utils/serverConfig');

// Import routes
const usersRoutes = require('./routes/users');
const recursoRoutes = require('./routes/recurso');
const revisionRoutes = require('./routes/revision');
const commentRoutes = require('./routes/comment');
const categoryRoutes = require('./routes/category');

// Create server configuration
const serverConfig = new ServerConfig();

// Setup middleware
serverConfig.setupMiddleware();

// Setup database
serverConfig.setupDatabase(process.env.MONGO_URI);

// Setup Socket.IO
serverConfig.setupSocketIO();

// Setup routes
const routes = [
  { path: '/api/usuarios', router: usersRoutes },
  { path: '/api/recursos', router: recursoRoutes },
  { path: '/api/revisions', router: revisionRoutes },
  { path: '/api/comments', router: commentRoutes },
  { path: '/api/categories', router: categoryRoutes },
];
serverConfig.setupRoutes(routes);

// Start server
const PORT = process.env.PORT || 4000;
serverConfig.start(PORT);
