const INTERVAL_MINUTES = 20;

function createNotification() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Take an eye break!",
    message: "Look at something 20 feet away for at least 20 seconds to protect your eyes.",
    priority: 2,
  });
}

function setAlarm() {
  chrome.alarms.create("eyeCareAlarm", { periodInMinutes: INTERVAL_MINUTES });
  const nextTime = Date.now() + INTERVAL_MINUTES * 60 * 1000;
  chrome.storage.local.set({ nextAlarmTime: nextTime });
}

chrome.runtime.onInstalled.addListener(() => {
  setAlarm();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "eyeCareAlarm") {
    createNotification();
    setAlarm();
  }
});

chrome.storage.sync.get("enabled", (data) => {
  if (data.enabled === false) {
    chrome.alarms.clear("eyeCareAlarm");
    chrome.storage.local.remove("nextAlarmTime");
  } else {
    setAlarm();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setAlarm") {
    setAlarm();
  }
});
