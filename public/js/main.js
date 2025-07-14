let currentRoomLink = "";

function generateRoomLink() {
  const roomId = Math.random().toString(36).substr(2, 9);
  const link = `${window.location.origin}/room.html?room=${roomId}`;

  document.getElementById("linkInput").value = link;
  document.getElementById("linkModal").style.display = "flex";
}

// Copy the room link and redirect to the room
function copyLink() {
  const input = document.getElementById("linkInput");
  input.select();
  input.setSelectionRange(0, 99999); // for mobile

  navigator.clipboard
    .writeText(input.value)
    .then(() => {
      // Optional: use toast or better UI instead of alert
      alert("✅ Link copied to clipboard!");
      window.location.href = currentRoomLink;
    })
    .catch(() => {
      alert("⚠️ Failed to copy. Please copy manually.");
    });
}

// Close the modal popup
function closeModal() {
  document.getElementById("linkModal").style.display = "none";
}

// Send a message in the chat box
function sendMessage() {
  const input = document.getElementById("chatInput");
  if (!input || !input.value.trim()) return;

  const msg = input.value.trim();
  input.value = "";

  const sentDiv = document.createElement("div");
  sentDiv.classList.add("message", "sent");
  sentDiv.textContent = msg;
  document.getElementById("messagesBox").appendChild(sentDiv);

  // Simulated reply after 1 second
  setTimeout(() => {
    const reply = document.createElement("div");
    reply.classList.add("message", "received");
    reply.textContent = "Reply to: " + msg;
    document.getElementById("messagesBox").appendChild(reply);
  }, 1000);
}

// End the call and return to home
function endCall() {
  if (confirm("Are you sure you want to end the call?")) {
    window.location.href = "index.html";
  }
}
