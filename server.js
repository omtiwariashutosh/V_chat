const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from "public"
app.use(express.static(path.join(__dirname, "public")));

// Main route for homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to serve room.html directly
app.get("/room.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// Socket.io real-time connection
io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected");

    socket.on("message", (msg) => {
      socket.to(roomId).emit("message", msg);
    });

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected");
    });
  });
});

// Use dynamic port (for Render)
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
