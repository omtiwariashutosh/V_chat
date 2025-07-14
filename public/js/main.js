let currentRoomLink = "";

function generateRoomLink() {
  const roomId = Math.random().toString(36).substr(2, 9);
  const link = `${window.location.origin}/room.html?room=${roomId}`;
  currentRoomLink = link; // ✅ This was missing

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
      alert("✅ Link copied to clipboard!");
      window.location.href = currentRoomLink; // ✅ Now works
    })
    .catch(() => {
      alert("⚠️ Failed to copy. Please copy manually.");
    });
}
