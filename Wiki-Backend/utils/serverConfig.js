import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import SocketService from '../sockets/socketService.js';

class ServerConfig {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = null;
    this.socketService = null;
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupDatabase(mongoUri) {
    mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('MongoDB conectado'))
      .catch(err => {
        console.error('MongoDB error', err);
        process.exit(1);
      });
  }

  setupSocketIO() {
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.socketService = new SocketService(this.io);
  }

  setupRoutes(routes) {
    routes.forEach(route => {
      this.app.use(route.path, route.router);
//       this.app.use("/docs", apiReference({
        //   theme: "deepSpace", // puedes cambiar a "default", "saturn", etc.
        //   spec: {
        //     url: "/openapi.json", // tu archivo OpenAPI
        //   },
        // }));
          });

    // Health check
    this.app.get('/', (_, res) => res.send('API Wiki - Usuarios'));
  }

  start(port, host = '0.0.0.0') {
    this.server.listen(port, host, () => {
      console.log(`Server en puerto ${port}`);
    });
  }

  getApp() {
    return this.app;
  }

  getServer() {
    return this.server;
  }

  getIO() {
    return this.io;
  }
}

export default ServerConfig;
