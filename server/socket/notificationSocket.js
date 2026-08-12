const jwt = require("jsonwebtoken");

// Maps userId -> socket.id for currently-connected users.
// This is in-memory, so it resets on server restart and only works
// with a single server instance (fine for this project's scope).
const onlineUsers = new Map();

/**
 * Emits a 'newNotification' event to a recipient if they're currently online.
 * Call this from controllers right after creating a Notification document.
 * If the user isn't online, the notification still exists in the DB and
 * will show up next time they call GET /api/notifications.
 */
const emitNotification = (io, recipientId, notification) => {
  const socketId = onlineUsers.get(recipientId.toString());
  if (socketId) {
    io.to(socketId).emit("newNotification", notification);
  }
};

module.exports = (io) => {
  // Authenticate each socket connection using the same JWT used for REST calls
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error: no token provided"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: invalid token"));
    }
  });

  io.on("connection", (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    console.log(`User ${socket.userId} connected (socket ${socket.id})`);

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};

module.exports.emitNotification = emitNotification;
