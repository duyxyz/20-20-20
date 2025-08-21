const checkbox = document.getElementById("enableCheckbox");
const resetBtn = document.getElementById("resetBtn");
const countdownEl = document.getElementById("countdown");

// Cập nhật trạng thái checkbox
chrome.storage.sync.get("enabled", (data) => {
  checkbox.checked = data.enabled !== false;
  if (!checkbox.checked) {
    countdownEl.textContent = "Reminders disabled";
  }
});

// Hiển thị đếm ngược
function updateCountdown() {
  chrome.storage.local.get("nextAlarmTime", (data) => {
    if (!data.nextAlarmTime) {
      countdownEl.textContent = "No countdown available";
      return;
    }
    const now = Date.now();
    let diff = data.nextAlarmTime - now;

    if (diff <= 0) {
      countdownEl.textContent = "Time to rest your eyes!";
      return;
    }
    const progressBar = document.getElementById("progressBar");
const total = 20 * 60 * 1000; // 20 phút
let percent = Math.max(0, Math.min(100, (diff / total) * 100));
progressBar.style.width = percent + "%";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    countdownEl.textContent = `Next reminder in: ${minutes}m ${seconds}s`;
  });
}

// Cập nhật mỗi giây
let countdownInterval = setInterval(updateCountdown, 1000);
updateCountdown();

checkbox.addEventListener("change", () => {
  const enabled = checkbox.checked;
  chrome.storage.sync.set({ enabled });
  if (enabled) {
    chrome.alarms.clear("eyeCareAlarm", () => {
      chrome.runtime.sendMessage({ action: "setAlarm" });
      countdownEl.textContent = "Timer reset!";
      if (!countdownInterval) {
        countdownInterval = setInterval(updateCountdown, 1000);
      }
    });
  } else {
    chrome.alarms.clear("eyeCareAlarm");
    chrome.storage.local.remove("nextAlarmTime");
    countdownEl.textContent = "Reminders disabled";
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
});

resetBtn.addEventListener("click", () => {
  chrome.alarms.clear("eyeCareAlarm", () => {
    chrome.runtime.sendMessage({ action: "setAlarm" });
    countdownEl.textContent = "Timer reset!";
    if (!countdownInterval) {
      countdownInterval = setInterval(updateCountdown, 1000);
    }
  });
});
