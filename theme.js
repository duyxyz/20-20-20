// theme.js

// Load theme từ storage
chrome.storage.sync.get("theme", (data) => {
  if (data.theme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// Toggle theme
const settingsBtn = document.getElementById("settingsBtn");
if (settingsBtn) {
  settingsBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    chrome.storage.sync.set({ theme });
  });
}
