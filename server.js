const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const { v4: uuidV4 } = require("uuid");

// set view engine
app.set("view engine", "ejs");
// set static path
app.use(express.static("public"));

// intial view, redirect to room with id using uuid
app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

// enter room with generated id
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// start socket connection
io.on("connection", (socket) => {
  console.log("User is connected");
  // join room event, it takes back userID and roomID
  socket.on("join", (roomId, userId) => {
    // join the room
    console.log(`room id is ${roomId} and userId is ${userId}`);
    socket.join(roomId);
    // when new user enters start the event new-connected-user
    socket.broadcast.to(roomId).emit("new-connected-user", userId);
    // when new user exits start the event user-disconnected
    socket.on("disconnect", () => {
      socket.broadcast.to(roomId).emit("user-disconnected", userId);
    });
  });
});

httpServer.listen(5000, () => {
  console.log("Up and running");
});
