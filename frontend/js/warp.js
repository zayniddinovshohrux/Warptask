// warp.js

// ==================== WARP MODE ====================
// Warp Now Button Event
document.addEventListener("DOMContentLoaded", function () {
  const warpBtn = document.getElementById("warpNowBtn");
  if (warpBtn) {
    warpBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log("Warp button clicked!"); // Debug uchun
      openWarpSelection();
    });
  } else {
    console.error("Warp button not found!");
  }
});

// Warp Mode Variables
let warpSession = {
  tasks: [],
  currentTaskIndex: 0,
  startTime: null,
  elapsedTime: 0,
  isPaused: false,
  timerInterval: null,
  completedTasks: 0, // Yangi: tugatilgan tasklar soni
};

// Mavjud tasks va categoryEmojis ni global o'zgaruvchila
// r sifatida aniqlash
// Agar mavjud bo'lmasa, shu yerda yaratamiz
if (typeof tasks === "undefined") {
  var tasks = [];
}

if (typeof categoryEmojis === "undefined") {
  var categoryEmojis = {
    work: "💼",
    personal: "🧩",
    sport: "🏋️‍♂️",
    bed: "🛏️",
    food: "🥪",
    salah: "📿",
    shopping: "🛍️",
    break: "🎮",
    wash: "🛁",
    housework: "🏠",
    health: "🫀",
    study: "📚",
    hobby: "🎨",
  };
}

// Helper functions
function loadTasksFromStorage() {
  try {
    const stored = localStorage.getItem("wzTasks");
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveTasksToStorage() {
  try {
    localStorage.setItem("wzTasks", JSON.stringify(tasks));
  } catch (e) {
    console.error("Error saving tasks:", e);
  }
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showNotification(message, type = "info") {
  // Simple notification
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === "error" ? "#ff3b30" : "#34c759"};
        color: white;
        padding: 12px 20px;
        border-radius: 15px;
        z-index: 10000;
        font-weight: 600;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    `;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}

// =========== YANGI: WARP YAKUNLANGANDA NOTIFICATION ===========
function showWarpCompletionNotification(totalTime, completedCount, totalTasks) {
  console.log('🔔 Showing warp completion notification');
  
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const efficiency = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  
  // Notification element yaratish
  const notification = document.createElement('div');
  notification.className = 'warp-end-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: rgba(28, 28, 30, 0.75);
  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  border-radius: 32px;
    color: white;
    padding: 18px 22px;
    z-index: 10002;
    box-shadow:0 6px 18px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(255, 0, 0, 0.04),
    inset 0 0.2px 0 rgba(255, 255, 255, 0.325);
    animation: warpNotificationIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    max-width: 350px;
    width: 90%;

  `;
  
  // Emoji efficiency bo'yicha
  let emoji = "⚡";
  if (efficiency >= 80) emoji = "🏆";
  else if (efficiency >= 50) emoji = "✨";
  else emoji = "✅";
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
      <div style="
        width: 50px;
        height: 50px;

        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26px;
      ">${emoji}</div>
      <div>
        <div style="font-size: 20px; font-weight: 800; margin-bottom: 3px;">Warp Complete</div>
        <div style="font-size: 13px; color: white; font-weight: 600;">${currentTime} • ${totalTime}</div>
      </div>
    </div>
    
    <div style="
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 15px 0;
      text-align: center;
    ">
      <div>
        <div style="font-size: 26px; font-weight: 700; color: var(--ios-green);">${completedCount}</div>
        <div style="font-size: 12px; color: #8e8e93;">Completed</div>
      </div>
      <div>
        <div style="font-size: 26px; font-weight: 700; color: var(--ios-blue);">${totalTime}</div>
        <div style="font-size: 12px; color: #8e8e93;">Total Time</div>
      </div>
      <div>
        <div style="font-size: 26px; font-weight: 700; color: white;">${efficiency}%</div>
        <div style="font-size: 12px; color: #8e8e93;">Efficiency</div>
      </div>
    </div>
    
    <div style="
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      padding: 12px;
      margin: 12px 0;
      text-align: center;
      font-size: 14px;
      color: #8e8e93;
      font-weight: 600;
    ">${getMotivationalMessage()}</div>
    
    <button onclick="this.parentNode.remove()" style="
      background: #0071e3;
      color: white;
      border: none;
      padding: 12px;
      border-radius: 14px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      font-size: 15px;
      margin-top: 10px;
      transition: all 0.3s ease;
      <i class="fas fa-check-circle" style="margin-right: 8px;"></i>Continue
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Animatsiya CSS qo'shish
  if (!document.querySelector('#warpNotificationAnim')) {
    const style = document.createElement('style');
    style.id = 'warpNotificationAnim';
    style.textContent = `
      @keyframes warpNotificationIn {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-100px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
      }
      @keyframes warpNotificationOut {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-50px) scale(0.9);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'warpNotificationOut 0.4s ease forwards';
    setTimeout(() => notification.remove(), 400);
  }, 5000);
}

// =========== YANGI: TASK TUGATILGANDA EFEKT ===========
function showTaskCompleteEffect(task) {
  const effect = document.createElement('div');
  effect.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 80px;
    z-index: 100000;
    pointer-events: none;
    animation: taskCompleteEffect 0.8s ease forwards;
    filter: drop-shadow(0 0 20px rgba(52,199,89,0.5));
  `;
  
  effect.textContent = categoryEmojis[task.category] || "✅";
  document.body.appendChild(effect);
  
  // CSS qo'shish
  if (!document.querySelector('#taskEffectAnim')) {
    const style = document.createElement('style');
    style.id = 'taskEffectAnim';
    style.textContent = `
      @keyframes taskCompleteEffect {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
  
  setTimeout(() => effect.remove(), 800);
}

// =========== YANGI: FOCUS MODE YAKUNLANGANDA ===========
function showFocusEndNotification(wasCompleted, overtimeMinutes) {
  console.log('🎯 Showing focus end notification');
  
  const now = new Date();
  const currentTime = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  
  const notification = document.createElement('div');
  notification.className = 'focus-end-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    color: white;
    padding: 16px 22px;
    border-radius: 18px;
    z-index: 10001;
    box-shadow: var(--shadow);
    animation: focusNotificationIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    max-width: 320px;
    width: 90%;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 0.5px solid rgba(255,255,255,0.2);
  `;
  
  const emoji = wasCompleted ? '🎯' : '⏹️';
  const title = wasCompleted ? 'Focus Complete!' : 'Focus Ended';
  const message = wasCompleted 
    ? `Task completed${overtimeMinutes > 0 ? ` (+${overtimeMinutes}m)` : ''}`
    : 'Focus session completed';
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px;">
      <span style="font-size: 32px;">${emoji}</span>
      <div style="flex: 1;">
        <div style="font-weight: 800; font-size: 18px; margin-bottom: 3px;">${title}</div>
        <div style="font-size: 14px; opacity: 0.9;">${message}</div>
        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">${currentTime} • Focus Mode</div>
      </div>
      <button onclick="this.parentNode.parentNode.remove()" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // CSS qo'shish
  if (!document.querySelector('#focusNotificationAnim')) {
    const style = document.createElement('style');
    style.id = 'focusNotificationAnim';
    style.textContent = `
      @keyframes focusNotificationIn {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(-100px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
      }
      @keyframes focusNotificationOut {
        from {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateX(-50%) translateY(-50px) scale(0.9);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Auto remove
  setTimeout(() => {
    notification.style.animation = 'focusNotificationOut 0.4s ease forwards';
    setTimeout(() => notification.remove(), 400);
  }, 4000);
}

// Main Warp Functions
function openWarpSelection() {
  console.log("Opening warp selection...");

  // Remove existing modal if any
  const existingModal = document.querySelector(".warp-selection-modal");
  if (existingModal) existingModal.remove();

  // Create modal HTML
  const modalHTML = `
        <div class="warp-selection-modal" style="display: flex;">
            <div class="selection-content">
                <div class="modal-header">
                    <h3>⚡ Select Tasks for Warp Mode</h3>
                 
                </div>
                
                <div class="task-checklist" id="warpTaskChecklist"></div>
                
                <div class="selection-actions">
                    <button class="btn secondary" id="cancelWarpSelect">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn primary" id="startWarpBtn">
                        <i class="fas fa-play"></i> Start Warp
                    </button>
                </div>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
  loadWarpTasks();
  setupWarpSelectionListeners();
}

function loadWarpTasks() {
  const checklist = document.getElementById("warpTaskChecklist");
  if (!checklist) return;

  // Load tasks from storage if not already loaded
  if (tasks.length === 0) {
    tasks = loadTasksFromStorage();
  }

  const pendingTasks = tasks.filter((task) => !task.completed);

  if (pendingTasks.length === 0) {
    checklist.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--ios-gray);">
                <i class="fas fa-check-circle" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></i>
                <h4 style="margin-bottom: 10px;">No pending tasks!</h4>
                <p>Add some tasks first to use Warp Mode</p>
            </div>
        `;
    return;
  }

  checklist.innerHTML = pendingTasks
    .map(
      (task, index) => `
        <div class="warp-task-item" data-task-id="${task.id}">
            <div class="warp-task-checkbox">
                <i class="fas fa-check"></i>
            </div>
            <div class="task-info">
                <div class="task-title">
                    <span class="task-emoji">${categoryEmojis[task.category] || "📝"}</span>
                    ${task.text}
                </div>
               
            </div>
            <div class="task-number">${index + 1}</div>
        </div>
    `,
    )
    .join("");

  // Add click handlers
  document.querySelectorAll(".warp-task-item").forEach((item) => {
    item.addEventListener("click", function () {
      this.classList.toggle("selected");
      const checkbox = this.querySelector(".warp-task-checkbox");
      const icon = this.querySelector(".warp-task-checkbox i");

      if (this.classList.contains("selected")) {
        checkbox.style.background = "var(--ios-blue)";
        checkbox.style.borderColor = "var(--ios-blue)";
        icon.style.opacity = "1";
      } else {
        checkbox.style.background = "";
        checkbox.style.borderColor = "var(--ios-gray)";
        icon.style.opacity = "0";
      }
    });
  });
}

function setupWarpSelectionListeners() {
  // Cancel button
  document
    .getElementById("cancelWarpSelect")
    .addEventListener("click", function () {
      document.querySelector(".warp-selection-modal").remove();
    });

  // Start Warp button
  document
    .getElementById("startWarpBtn")
    .addEventListener("click", function () {
      console.log("Start Warp clicked");
      startWarpSession();
    });

  // ESC to close
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const modal = document.querySelector(".warp-selection-modal");
      if (modal) modal.remove();
    }
  });

  // Click outside to close
  document
    .querySelector(".warp-selection-modal")
    .addEventListener("click", function (e) {
      if (e.target === this) {
        this.remove();
      }
    });
}

function startWarpSession() {
  const selectedItems = document.querySelectorAll(".warp-task-item.selected");
  if (selectedItems.length === 0) {
    showNotification("Please select at least one task!", "error");
    return;
  }

  // Get selected tasks
  warpSession.tasks = Array.from(selectedItems).map((item) => {
    const taskId = parseInt(item.dataset.taskId);
    return tasks.find((t) => t.id === taskId);
  });

  // Close modal
  document.querySelector(".warp-selection-modal").remove();

  // Start session
  warpSession.startTime = new Date();
  warpSession.currentTaskIndex = 0;
  warpSession.elapsedTime = 0;
  warpSession.isPaused = false;
  warpSession.completedTasks = 0; // Yangi: boshlang'ich qiymat

  // Create warp interface
  createWarpOverlay();
}

function createWarpOverlay() {
  // Remove existing overlay if any
  const existingOverlay = document.getElementById("warpOverlay");
  if (existingOverlay) existingOverlay.remove();

  const warpHTML = `
        <div class="warp-overlay" id="warpOverlay" style="display: flex;">
            <div class="warp-content">
                <div class="warp-header">
                  
                    <div class="warp-timer" id="warpTimer">00:00:00</div>
                </div>
                
                <div class="warp-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="warpProgressFill"></div>
                    </div>
                    <div class="progress-text" id="warpProgressText">0/${warpSession.tasks.length} tasks</div>
                </div>
                
                <div class="current-task" id="currentWarpTask">
                    <div class="task-emoji-large" id="currentTaskEmoji">📝</div>
                    <div class="task-content">
                        <div class="task-text-large" id="currentTaskText"></div>
                        <div class="task-subtasks" id="warpSubtasks"></div>
                    </div>
                </div>
                
                <div class="warp-controls">
                    <button class="warp-btn pause-btn" id="warpPauseBtn">
                        <i class="fas fa-pause"></i> 
                    </button>
                    <button class="warp-btn complete-btn" id="warpCompleteBtn">
                        <i class="fas fa-check"></i> Complete
                    </button>
                </div>
                
                <button class="close-warp" id="closeWarpBtn">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        </div>
    `;

  document.body.insertAdjacentHTML("beforeend", warpHTML);

  // Load first task
  loadCurrentWarpTask();

  // Start timer
  startWarpTimer();

  // Setup event listeners
  setupWarpOverlayListeners();
}

function setupWarpOverlayListeners() {
  // Pause button
  const pauseBtn = document.getElementById("warpPauseBtn");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", function () {
      warpSession.isPaused = !warpSession.isPaused;
      this.innerHTML = warpSession.isPaused
        ? '<i class="fas fa-play"></i> '
        : '<i class="fas fa-pause"></i> ';
    });
  }

  // Complete button
  const completeBtn = document.getElementById("warpCompleteBtn");
  if (completeBtn) {
    completeBtn.addEventListener("click", completeCurrentWarpTask);
  }

  // Close button
  const closeBtn = document.getElementById("closeWarpBtn");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      if (confirm("End warp session?")) {
        endWarpSession();
      }
    });
  }

  // ESC to end
  document.addEventListener("keydown", function warpKeyHandler(e) {
    if (e.key === "Escape") {
      if (confirm("End warp session?")) {
        endWarpSession();
        document.removeEventListener("keydown", warpKeyHandler);
      }
    }
  });
}

function startWarpTimer() {
  // Clear existing timer
  if (warpSession.timerInterval) {
    clearInterval(warpSession.timerInterval);
  }

  warpSession.timerInterval = setInterval(() => {
    if (!warpSession.isPaused) {
      warpSession.elapsedTime += 1000;
      updateWarpTimerDisplay();
    }
  }, 1000);
}

function updateWarpTimerDisplay() {
  const timerDisplay = document.getElementById("warpTimer");
  if (!timerDisplay) return;

  const totalSeconds = Math.floor(warpSession.elapsedTime / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  timerDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function loadCurrentWarpTask() {
  const task = warpSession.tasks[warpSession.currentTaskIndex];
  if (!task) {
    endWarpSession();
    return;
  }

  // Update UI elements
  const emojiEl = document.getElementById("currentTaskEmoji");
  const textEl = document.getElementById("currentTaskText");
  const progressFill = document.getElementById("warpProgressFill");
  const progressText = document.getElementById("warpProgressText");

  if (emojiEl) emojiEl.textContent = categoryEmojis[task.category] || "📝";
  if (textEl) textEl.textContent = task.text;

  // Update progress
  const progress =
    (warpSession.currentTaskIndex / warpSession.tasks.length) * 100;
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
    progressFill.style.transition = "width 0.5s ease";
  }
  if (progressText) {
    progressText.textContent = `${warpSession.currentTaskIndex}/${warpSession.tasks.length} tasks`;
  }

  // Load subtasks
  const subtaskContainer = document.getElementById("warpSubtasks");
  if (subtaskContainer) {
    if (task.subtasks && task.subtasks.length > 0) {
      subtaskContainer.innerHTML = `
                <div class="subtask-header">Subtasks:</div>
                ${task.subtasks
                  .map(
                    (st, idx) => `
                    <div class="subtask-item" onclick="window.toggleWarpSubtask(${idx})">
                        <div class="subtask-checkbox ${st.completed ? "checked" : ""}">
                            ${st.completed ? '<i class="fas fa-check"></i>' : ""}
                        </div>
                        <span class="subtask-text ${st.completed ? "completed" : ""}">${st.text}</span>
                    </div>
                `,
                  )
                  .join("")}
            `;
    } else {
      subtaskContainer.innerHTML = '<div class="no-subtasks">No subtasks</div>';
    }
  }
}

// Global function for subtask toggling
window.toggleWarpSubtask = function (subtaskIndex) {
  const task = warpSession.tasks[warpSession.currentTaskIndex];
  if (!task || !task.subtasks) return;

  task.subtasks[subtaskIndex].completed =
    !task.subtasks[subtaskIndex].completed;
  loadCurrentWarpTask();
};

function completeCurrentWarpTask() {
  const currentTask = warpSession.tasks[warpSession.currentTaskIndex];
  if (!currentTask) return;

  // Mark task as completed in main tasks array
  const taskIndex = tasks.findIndex((t) => t.id === currentTask.id);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = true;
    tasks[taskIndex].completedAt = new Date().toISOString();
    saveTasksToStorage();
  }

  // Show reward animation - YANGI: taskCompleteEffect
  showTaskCompleteEffect(currentTask);

  // Update completed tasks count
  warpSession.completedTasks++;

  // Move to next task
  warpSession.currentTaskIndex++;

  if (warpSession.currentTaskIndex < warpSession.tasks.length) {
    setTimeout(() => loadCurrentWarpTask(), 500); // Biroz kutib keyin keyingi task
  } else {
    setTimeout(() => endWarpSession(), 800); // Biroz kutib keyin warp tugatish
  }
}

function endWarpSession() {
  // Clear timer
  if (warpSession.timerInterval) {
    clearInterval(warpSession.timerInterval);
    warpSession.timerInterval = null;
  }

  const totalTime = formatWarpTime(warpSession.elapsedTime);
  const completedCount = warpSession.completedTasks;
  const totalTasks = warpSession.tasks.length;

  // Remove overlay
  const warpOverlay = document.getElementById("warpOverlay");
  if (warpOverlay) {
    warpOverlay.style.animation = "fadeOut 0.5s forwards";
    setTimeout(() => warpOverlay.remove(), 500);
  }

  // ===== ESKI MODAL O'RNIGA YANGI NOTIFICATION =====
  setTimeout(() => {
    showWarpCompletionNotification(totalTime, completedCount, totalTasks);
  }, 600);

  // Reset session
  warpSession = {
    tasks: [],
    currentTaskIndex: 0,
    startTime: null,
    elapsedTime: 0,
    isPaused: false,
    timerInterval: null,
    completedTasks: 0,
  };
}

function formatWarpTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function getMotivationalMessage() {
  const messages = [
    "Great focus! You're unstoppable.",
    "Productivity level: MAXIMUM.",
    "Another warp, another victory!",
    "Tasks don't stand a chance against you.",
    "Warp speed achieved! Well done.",
    "You just warped through your tasks!",
    "Focus level: Expert.",
    "That's how productivity is done!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Add animation styles
const styleEl = document.createElement("style");
styleEl.textContent = `
    @keyframes rewardPop {
        0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(styleEl);

console.log("Warp.js loaded successfully!");

// =========== YANGI: FOCUS MODE UCHUN END FUNCTIONS ===========
window.endFocusSession = function(wasCompleted, overtimeSeconds = 0) {
    // Bu function focus.js dan chaqiriladi
    console.log('🎯 Focus session ended, showing notification');
    const overtimeMinutes = Math.floor(overtimeSeconds / 60);
    
    setTimeout(() => {
        showFocusEndNotification(wasCompleted, overtimeMinutes);
    }, 300);
};

// TEST: Brauzer console'dan test qilish uchun
window.testWarpNotification = function() {
    showWarpCompletionNotification("5m 30s", 4, 5);
};

window.testFocusNotification = function() {
    showFocusEndNotification(true, 3);
};

window.testTaskEffect = function() {
    showTaskCompleteEffect({category: "work", text: "Test Task"});
};