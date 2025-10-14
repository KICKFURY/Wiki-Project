class SocketService {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // Set user ID for this socket
      socket.on('set-user-id', (userId) => {
        socket.userId = userId;
        console.log(`User ${socket.id} set userId to ${userId}`);
      });

      // Join a resource editing room
      socket.on('join-resource', (resourceId) => {
        socket.join(`resource-${resourceId}`);
        console.log(`User ${socket.id} joined resource-${resourceId}`);

        // Send updated collaborators list
        this.sendCollaboratorsUpdate(resourceId);
      });

      // Leave a resource editing room
      socket.on('leave-resource', (resourceId) => {
        socket.leave(`resource-${resourceId}`);
        console.log(`User ${socket.id} left resource-${resourceId}`);

        // Send updated collaborators list
        this.sendCollaboratorsUpdate(resourceId);
      });

      // Handle content updates
      socket.on('update-content', (data) => {
        const { resourceId, content, userId } = data;
        // Broadcast to all other users in the room
        socket.to(`resource-${resourceId}`).emit('content-updated', { content, userId });
      });

      // Handle title updates
      socket.on('update-title', (data) => {
        const { resourceId, title, userId } = data;
        // Broadcast to all other users in the room
        socket.to(`resource-${resourceId}`).emit('title-updated', { title, userId });
      });

      // Transfer session from temporary to real resource
      socket.on('transfer-session', (data) => {
        const { oldSessionId, newResourceId } = data;
        this.transferSession(oldSessionId, newResourceId);
      });

      // Handle request for current session state
      socket.on('request-session-state', (data) => {
        const { resourceId } = data;
        this.sendSessionState(socket, resourceId);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });
  }

  sendCollaboratorsUpdate(resourceId) {
    const room = this.io.sockets.adapter.rooms.get(`resource-${resourceId}`);
    if (room) {
      const collaborators = Array.from(room).map(socketId => {
        const clientSocket = this.io.sockets.sockets.get(socketId);
        return clientSocket?.userId || socketId;
      });
      this.io.to(`resource-${resourceId}`).emit('collaborators-updated', collaborators);
    }
  }

  transferSession(oldSessionId, newResourceId) {
    // Get all sockets in the old session room
    const oldRoom = this.io.sockets.adapter.rooms.get(`resource-${oldSessionId}`);
    if (oldRoom) {
      // Move each socket to the new room
      for (const socketId of oldRoom) {
        const clientSocket = this.io.sockets.sockets.get(socketId);
        if (clientSocket) {
          clientSocket.leave(`resource-${oldSessionId}`);
          clientSocket.join(`resource-${newResourceId}`);
          console.log(`User ${socketId} transferred from session-${oldSessionId} to resource-${newResourceId}`);
        }
      }

      // Send updated collaborators list to the new room
      this.sendCollaboratorsUpdate(newResourceId);
    }
  }

  sendSessionState(socket, resourceId) {
    const room = this.io.sockets.adapter.rooms.get(`resource-${resourceId}`);
    if (room) {
      const collaborators = Array.from(room).map(socketId => {
        const clientSocket = this.io.sockets.sockets.get(socketId);
        return clientSocket?.userId || socketId;
      });
      this.io.to(socket.id).emit('session-state', {
        collaborators,
      });
    }
  }
}

module.exports = SocketService;
