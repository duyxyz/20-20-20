const countdownEl = document.getElementById("countdown");
const progressCircle = document.getElementById("progressCircle");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pauseBtn");
const settingBtn = document.getElementById("settingBtn");
const powerBtn = document.getElementById("powerBtn");

let totalSeconds = 20 * 60;

// ⚡ Fix: radius phải đúng với r trong <circle r="72">
const radius = 72;
const circumference = 2 * Math.PI * radius;
progressCircle.style.strokeDasharray = circumference;

// ================== Timer UI ==================
function render(remainingSeconds, isPaused, powerOn) {
  if (!powerOn) {
    countdownEl.textContent = "--:--";
    progressCircle.style.strokeDashoffset = circumference;
    progressCircle.classList.add("disabled");
    powerBtn.classList.add("off");
    return;
  }

  progressCircle.classList.remove("disabled");
  powerBtn.classList.remove("off");

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  countdownEl.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // ⚡ Fix offset
  const offset = circumference - (remainingSeconds / totalSeconds) * circumference;
  progressCircle.style.strokeDashoffset = offset;

  pauseBtn.textContent = isPaused ? "▶" : "⏸";
}

// ================== State init ==================
chrome.storage.local.get(["remainingSeconds", "isPaused", "powerOn", "darkMode"], data => {
  render(data.remainingSeconds ?? totalSeconds, data.isPaused ?? false, data.powerOn ?? true);

  if (data.darkMode) {
    document.body.classList.add("dark");
  }
  startEffect(); // ⭐ hoặc ☁ tuỳ mode
});

// Update khi background thay đổi
chrome.storage.onChanged.addListener(() => {
  chrome.storage.local.get(["remainingSeconds", "isPaused", "powerOn"], data => {
    render(data.remainingSeconds, data.isPaused, data.powerOn);
  });
});

// ================== Buttons ==================
pauseBtn.addEventListener("click", () => {
  chrome.storage.local.get(["isPaused"], data => {
    chrome.runtime.sendMessage({ action: "pause", value: !data.isPaused });
  });
});

resetBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "reset" });
});

powerBtn.addEventListener("click", () => {
  chrome.storage.local.get(["powerOn"], data => {
    chrome.runtime.sendMessage({ action: "power", value: !data.powerOn });
  });
});

settingBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  chrome.storage.local.set({ darkMode: document.body.classList.contains("dark") });
  startEffect();
});

// ================== Canvas Effects ==================
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");
let stars = [];

function initStars() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];

  if (document.body.classList.contains("dark")) {
    // ⭐ sao rơi
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2,
        speed: 0.3 + Math.random() * 0.7
      });
    }
  } else {
    // ☁ mây bay
    for (let i = 0; i < 10; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2),
        radius: 20 + Math.random() * 30,
        speed: 0.2 + Math.random() * 0.3
      });
    }
  }
}

// ⭐ Dark mode: sao rơi
function drawStars() {
  if (!document.body.classList.contains("dark")) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();

    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
  requestAnimationFrame(drawStars);
}

// 🌤 Light mode: mây bay + ánh sáng mặt trời
function drawLightClouds() {
  if (document.body.classList.contains("dark")) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ☀ ánh sáng mặt trời
  let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(255, 223, 100, 0.35)");
  gradient.addColorStop(1, "rgba(255, 223, 100, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // ☁ mây
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  stars.forEach(cloud => {
    ctx.beginPath();
    ctx.ellipse(cloud.x, cloud.y, cloud.radius * 2.5, cloud.radius * 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + 60) {
      cloud.x = -60;
      cloud.y = Math.random() * (canvas.height / 2);
    }
  });

  requestAnimationFrame(drawLightClouds);
}

// 🔀 chọn hiệu ứng tuỳ mode
function startEffect() {
  initStars();
  if (document.body.classList.contains("dark")) {
    drawStars();
  } else {
    drawLightClouds();
  }
}

window.addEventListener("resize", initStars);

// ================== Hết giờ → Hiện popup ==================
chrome.runtime.onMessage.addListener((req) => {
  if (req.action === "timeUp") {
    showTimeUpPopup();
  }
});

function showTimeUpPopup() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.background = "rgba(0,0,0,0.7)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const box = document.createElement("div");
  box.textContent = "⏰ Hết giờ rồi! Hãy nghỉ mắt 20 giây 👀";
  box.style.background = "#fff";
  box.style.padding = "20px 30px";
  box.style.borderRadius = "12px";
  box.style.fontSize = "20px";
  box.style.fontWeight = "bold";
  box.style.textAlign = "center";
  box.style.color = "#333";
  overlay.appendChild(box);

  document.body.appendChild(overlay);

  // Ẩn sau 5s hoặc click để tắt
  overlay.addEventListener("click", () => overlay.remove());
  setTimeout(() => overlay.remove(), 5000);
}
