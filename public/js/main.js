let currentRoomLink = "";

function generateRoomLink() {
  const roomId = Math.random().toString(36).substr(2, 9);
  const link = `${window.location.origin}/room.html?room=${roomId}`;
  currentRoomLink = link;

  document.getElementById("linkInput").value = link;
  document.getElementById("linkModal").style.display = "flex";
}

function copyLink() {
  const input = document.getElementById("linkInput");
  input.select();
  input.setSelectionRange(0, 99999);

  navigator.clipboard
    .writeText(input.value)
    .then(() => {
      document.getElementById("linkModal").style.display = "none";
      window.location.href = currentRoomLink;
    })
    .catch(() => {
      alert("⚠️ Failed to copy. Please copy manually.");
    });
}

function closeModal() {
  document.getElementById("linkModal").style.display = "none";
}

// For Room Page Only
const urlParams = new URLSearchParams(window.location.search);
const roomId = urlParams.get("room");

if (roomId && window.location.pathname.includes("room.html")) {
  const socket = io();

  socket.emit("join-room", roomId);

  // Handle sending messages
  window.sendMessage = function () {
    const input = document.getElementById("chatInput");
    if (!input || !input.value.trim()) return;

    const msg = input.value.trim();
    input.value = "";

    const sentDiv = document.createElement("div");
    sentDiv.classList.add("message", "sent");
    sentDiv.textContent = msg;
    document.getElementById("messagesBox").appendChild(sentDiv);

    socket.emit("message", msg);
  };

  // Handle receiving messages
  socket.on("message", (msg) => {
    const reply = document.createElement("div");
    reply.classList.add("message", "received");
    reply.textContent = msg;
    document.getElementById("messagesBox").appendChild(reply);
  });

  // Handle end call from the other user
  socket.on("user-disconnected", () => {
    alert("The other user has ended the call.");
    window.close(); // Closes the tab
  });

  // End call from this user
  window.endCall = function () {
    if (confirm("Are you sure you want to end the call?")) {
      socket.emit("end-call", roomId);
      window.close(); // Closes your own tab too
    }
  };

  // Optional: Support Enter key for chat
  document
    .getElementById("chatInput")
    .addEventListener("keydown", function (e) {
      if (e.key === "Enter") sendMessage();
    });
}
