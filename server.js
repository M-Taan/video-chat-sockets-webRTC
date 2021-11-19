const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  console.log("User is connected");
  socket.on("join", (roomId, userId) => {
    console.log(`room id is ${roomId} and userId is ${userId}`);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit("new-connected-user", userId);
  });
});

httpServer.listen(5000, () => {
  console.log("Up and running");
});
