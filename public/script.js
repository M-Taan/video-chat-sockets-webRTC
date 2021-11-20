// Intialize
const gridLayout = document.getElementById("grid-layout");
const ownVideo = document.createElement("video");
ownVideo.muted = true;
const socket = io();
const connected_users = {};

// start an instance of peerjs server
var peer = new Peer({
  host: "peerjs-server.herokuapp.com",
  secure: true,
  port: 443,
});

// allow video and audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    // capture my own video
    startVideo(ownVideo, stream);

    // when new user is connected fire the function connectWithUser
    socket.on("new-connected-user", (userId) => {
      connectWithUser(userId, stream);
    });

    // event call to answer and listen
    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        startVideo(video, userVideoStream);
      });
    });
  });

// user disconnected
socket.on("user-disconnected", (userId) => {
  connected_users[userId].close();
});

// client socket connection
socket.on("connect", () => {
  console.log(socket.id);
});

// get a unique userID
peer.on("open", (id) => {
  socket.emit("join", Room_Id, id);
});

// connect with other users
function connectWithUser(userId, stream) {
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    startVideo(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  connected_users[userId] = call;
}

// play video
function startVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    console.log("playing");
  });
  gridLayout.append(video);
}
