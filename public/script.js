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
    startVideo(ownVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        startVideo(video, userVideoStream);
      });
    });

    socket.on("new-connected-user", (userId) => {
      connectWithUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  connected_users[userId].close();
});

socket.on("connect", () => {
  console.log(socket.id);
});
peer.on("open", (id) => {
  socket.emit("join", Room_Id, id);
});

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

function startVideo(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    console.log("playing");
  });
  gridLayout.append(video);
}
