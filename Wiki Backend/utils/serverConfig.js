const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const SocketService = require('../sockets/socketService');

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
    this.io = socketIo(this.server, {
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

module.exports = ServerConfig;
