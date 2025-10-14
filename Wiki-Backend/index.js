// index.js
import 'dotenv/config';

import { apiReference } from "@scalar/express-api-reference";

import ServerConfig from './utils/serverConfig.js';

// Import routes
import usersRoutes from './routes/users.js';
import recursoRoutes from './routes/recurso.js';
import revisionRoutes from './routes/revision.js';
import commentRoutes from './routes/comment.js';
import categoryRoutes from './routes/category.js';

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
