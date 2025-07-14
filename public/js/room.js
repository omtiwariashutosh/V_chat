// room.js
const socket = io();
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
let localStream;
let peerConnection;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

// Get user media
navigator.mediaDevices
  .getUserMedia({ video: true, audio: true })
  .then((stream) => {
    localStream = stream;
    localVideo.srcObject = stream;

    socket.emit("join-room", roomId);
  })
  .catch((error) => {
    alert("Could not access camera/mic.");
    console.error(error);
  });

socket.on("user-connected", async () => {
  createPeer();

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  socket.emit("message", { type: "offer", offer, room: roomId });
});

socket.on("message", async (data) => {
  if (data.type === "offer") {
    createPeer();
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.offer)
    );

    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("message", { type: "answer", answer, room: roomId });
  }

  if (data.type === "answer") {
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(data.answer)
    );
  }

  if (data.type === "ice-candidate") {
    try {
      await peerConnection.addIceCandidate(data.candidate);
    } catch (e) {
      console.error("Error adding received ICE candidate", e);
    }
  }
});

function createPeer() {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("message", {
        type: "ice-candidate",
        candidate: event.candidate,
        room: roomId,
      });
    }
  };
}

// Chat Message Sending
function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;

  appendMessage("sent", msg);
  socket.emit("message", { type: "chat", text: msg, room: roomId });
  input.value = "";
}

socket.on("message", (data) => {
  if (data.type === "chat") {
    appendMessage("received", data.text);
  }
});

function appendMessage(type, text) {
  const box = document.getElementById("messagesBox");
  const div = document.createElement("div");
  div.classList.add("message", type);
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function endCall() {
  if (confirm("End the call and return to home page?")) {
    window.location.href = "/";
  }
}

document.getElementById("chatInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
