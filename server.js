const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Room route
app.get("/room.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// Socket.IO logic
io.on("connection", (socket) => {
  // User joins a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    // Notify others in the room
    socket.to(roomId).emit("user-connected");

    // Relay message to room
    socket.on("message", (msg) => {
      socket.to(roomId).emit("message", msg);
    });

    // Handle user manually ending the call
    socket.on("end-call", (roomId) => {
      socket.to(roomId).emit("user-disconnected");
    });

    // Handle user closing browser/tab
    socket.on("disconnect", () => {
      const rooms = [...socket.rooms];
      rooms.forEach((room) => {
        socket.to(room).emit("user-disconnected");
      });
    });
  });
});

// Start server (Render will inject PORT)
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
