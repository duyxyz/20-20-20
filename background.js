let totalSeconds = 20 * 60;
let remainingSeconds = totalSeconds;
let isPaused = false;
let powerOn = true;

// Khởi tạo alarm tick mỗi giây
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("timerTick", { periodInMinutes: 1 / 60 }); // 1 giây
  chrome.storage.local.set({ remainingSeconds, isPaused, powerOn });
});

// Alarm handler
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "timerTick") {
    if (powerOn && !isPaused) {
      if (remainingSeconds > 0) {
        remainingSeconds--;
      } else {
        // HẾT GIỜ → gửi thông báo sang popup
        chrome.runtime.sendMessage({ action: "timeUp" });
        remainingSeconds = totalSeconds;
      }
    }
    chrome.storage.local.set({ remainingSeconds, isPaused, powerOn });
  }
});

// Nhận điều khiển từ popup
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "pause") {
    isPaused = req.value;
  }
  if (req.action === "reset") {
    remainingSeconds = totalSeconds;
    isPaused = false;
  }
  if (req.action === "power") {
    powerOn = req.value;
    if (!powerOn) {
      remainingSeconds = 0;
    } else {
      remainingSeconds = totalSeconds;
      isPaused = false;
    }
  }
  chrome.storage.local.set({ remainingSeconds, isPaused, powerOn });
  sendResponse({ ok: true });
});
