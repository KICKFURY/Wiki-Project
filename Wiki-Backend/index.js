import 'dotenv/config';
import ServerConfig from './utils/serverConfig.js';

// Rutas
import usersRoutes from './routes/users.js';
import recursoRoutes from './routes/recurso.js';
import revisionRoutes from './routes/revision.js';
import commentRoutes from './routes/comment.js';
import categoryRoutes from './routes/category.js';

import mongoose from 'mongoose'; 
mongoose.set('strictQuery', true);


// Swagger
import swaggerDocs from "./swagger.js";

// Crear configuración del servidor
const serverConfig = new ServerConfig();

// Middleware, DB, Socket
serverConfig.setupMiddleware();
serverConfig.setupDatabase(process.env.MONGO_URI);
serverConfig.setupSocketIO();

// Rutas
const routes = [
  { path: '/api/usuarios', router: usersRoutes },
  { path: '/api/recursos', router: recursoRoutes },
  { path: '/api/revisions', router: revisionRoutes },
  { path: '/api/comments', router: commentRoutes },
  { path: '/api/categories', router: categoryRoutes },
];
serverConfig.setupRoutes(routes);

// Swagger (después de las rutas)
swaggerDocs(serverConfig.app);

// Iniciar servidor
const PORT = process.env.PORT || 4000;
serverConfig.start(PORT);
