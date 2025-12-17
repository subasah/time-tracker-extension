// Popup script for task management and timer control

let tasks = [];
let activeTimer = null;

// Initialize popup
document.addEventListener("DOMContentLoaded", async () => {
  await loadTasks();
  await loadActiveTimer();
  setupEventListeners();
  renderTasks();
  if (activeTimer) {
    updateTimerDisplay();
  }
});

// Event Listeners
function setupEventListeners() {
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document
    .getElementById("technique")
    .addEventListener("change", handleTechniqueChange);
  document.getElementById("statsBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: "statistics.html" });
  });

  document.getElementById("dataBtn").addEventListener("click", () => {
    chrome.tabs.create({ url: "data-manager.html" });
  });

  document.getElementById("startBtn").addEventListener("click", startTimer);
  document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
  document.getElementById("resumeBtn").addEventListener("click", resumeTimer);
  document.getElementById("stopBtn").addEventListener("click", stopTimer);

  // Listen for timer updates from background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TIMER_UPDATE") {
      loadActiveTimer().then(() => {
        if (activeTimer) {
          updateTimerDisplay();
        }
      });
    }
  });
}

function handleTechniqueChange() {
  const technique = document.getElementById("technique").value;
  const customInputs = document.getElementById("customTimeInputs");

  if (technique === "custom") {
    customInputs.classList.remove("hidden");
  } else {
    customInputs.classList.add("hidden");
  }
}

// Task Management
async function addTask() {
  const taskName = document.getElementById("taskName").value.trim();
  const technique = document.getElementById("technique").value;

  if (!taskName) {
    alert("Please enter a task name");
    return;
  }

  let workDuration = 25;
  let breakDuration = 5;

  switch (technique) {
    case "pomodoro":
      workDuration = 25;
      breakDuration = 5;
      break;
    case "52-17":
      workDuration = 52;
      breakDuration = 17;
      break;
    case "custom":
      workDuration =
        parseInt(document.getElementById("workDuration").value) || 25;
      breakDuration =
        parseInt(document.getElementById("breakDuration").value) || 5;
      break;
    case "stopwatch":
      workDuration = 0;
      breakDuration = 0;
      break;
  }

  const task = {
    id: Date.now().toString(),
    name: taskName,
    technique: technique,
    workDuration: workDuration,
    breakDuration: breakDuration,
    totalTime: 0,
    sessions: [],
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  await saveTasks();

  // Clear inputs
  document.getElementById("taskName").value = "";

  renderTasks();
}

async function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    tasks = tasks.filter((t) => t.id !== taskId);
    await saveTasks();
    renderTasks();
  }
}

async function selectTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;

  activeTimer = {
    taskId: task.id,
    taskName: task.name,
    technique: task.technique,
    workDuration: task.workDuration,
    breakDuration: task.breakDuration,
    timeRemaining: task.workDuration * 60,
    isRunning: false,
    isPaused: false,
    isBreak: false,
    sessionStartTime: null,
    totalSessionTime: 0,
  };

  await saveActiveTimer();
  showActiveTimer();
  updateTimerDisplay();
}

// Timer Controls
async function startTimer() {
  if (!activeTimer) {
    alert("Please select a task first!");
    return;
  }

  activeTimer.isRunning = true;
  activeTimer.isPaused = false;
  activeTimer.sessionStartTime = Date.now();

  await saveActiveTimer();

  // Send message to background script
  chrome.runtime.sendMessage(
    {
      type: "START_TIMER",
      timer: activeTimer,
    },
    (response) => {
      // Check for errors
      if (chrome.runtime.lastError) {
        console.error("Error starting timer:", chrome.runtime.lastError);
      }
    }
  );

  updateTimerDisplay();
  updateTimerControls();
}

async function pauseTimer() {
  if (!activeTimer) return;

  activeTimer.isPaused = true;

  await saveActiveTimer();

  chrome.runtime.sendMessage({
    type: "PAUSE_TIMER",
  });

  updateTimerControls();
}

async function resumeTimer() {
  if (!activeTimer) return;

  activeTimer.isPaused = false;

  await saveActiveTimer();

  chrome.runtime.sendMessage({
    type: "RESUME_TIMER",
  });

  updateTimerControls();
}

async function stopTimer() {
  if (!activeTimer) return;

  if (confirm("Are you sure you want to stop this session?")) {
    // Save session data
    if (activeTimer.totalSessionTime > 0) {
      await saveSession();
    }

    chrome.runtime.sendMessage({
      type: "STOP_TIMER",
    });

    activeTimer = null;
    await saveActiveTimer();

    hideActiveTimer();
    await loadTasks();
    renderTasks();
  }
}

// UI Updates
function renderTasks() {
  const tasksList = document.getElementById("tasksList");

  if (tasks.length === 0) {
    tasksList.innerHTML =
      '<p class="empty-state">No tasks yet. Create one to get started!</p>';
    return;
  }

  tasksList.innerHTML = tasks
    .map((task) => {
      const hours = Math.floor(task.totalTime / 3600);
      const minutes = Math.floor((task.totalTime % 3600) / 60);
      const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      return `
      <div class="task-item">
        <div class="task-info">
          <div class="task-name">${task.name}</div>
          <div class="task-meta">
            <span class="technique-badge">${getTechniqueName(
              task.technique
            )}</span>
            <span class="time-spent">${timeDisplay} spent</span>
            <span class="sessions-count">${task.sessions.length} sessions</span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-small btn-success" data-task-id="${
            task.id
          }" data-action="start">
            Start
          </button>
          <button class="btn btn-small btn-danger" data-task-id="${
            task.id
          }" data-action="delete">
            Delete
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  // Add event listeners to all buttons
  document.querySelectorAll('[data-action="start"]').forEach((btn) => {
    btn.addEventListener("click", () => selectTask(btn.dataset.taskId));
  });

  document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener("click", () => deleteTask(btn.dataset.taskId));
  });
}

function showActiveTimer() {
  document.getElementById("activeTimerSection").classList.remove("hidden");
  document.getElementById("activeTaskName").textContent = activeTimer.taskName;
  document.getElementById("activeTechnique").textContent = getTechniqueName(
    activeTimer.technique
  );
}

function hideActiveTimer() {
  document.getElementById("activeTimerSection").classList.add("hidden");
}

function updateTimerDisplay() {
  if (!activeTimer) return;

  const minutes = Math.floor(activeTimer.timeRemaining / 60);
  const seconds = activeTimer.timeRemaining % 60;

  document.getElementById("timerClock").textContent = `${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const status = activeTimer.isBreak
    ? "☕ Break Time"
    : activeTimer.isPaused
    ? "⏸️ Paused"
    : activeTimer.isRunning
    ? "🔥 Working"
    : "Ready";

  document.getElementById("timerStatus").textContent = status;

  updateTimerControls();
}

function updateTimerControls() {
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resumeBtn = document.getElementById("resumeBtn");

  if (!activeTimer || !activeTimer.isRunning) {
    startBtn.classList.remove("hidden");
    pauseBtn.classList.add("hidden");
    resumeBtn.classList.add("hidden");
  } else if (activeTimer.isPaused) {
    startBtn.classList.add("hidden");
    pauseBtn.classList.add("hidden");
    resumeBtn.classList.remove("hidden");
  } else {
    startBtn.classList.add("hidden");
    pauseBtn.classList.remove("hidden");
    resumeBtn.classList.add("hidden");
  }
}

function getTechniqueName(technique) {
  const names = {
    pomodoro: "Pomodoro",
    "52-17": "52-17",
    custom: "Custom",
    stopwatch: "Stopwatch",
  };
  return names[technique] || technique;
}

// Data Persistence
async function loadTasks() {
  const result = await chrome.storage.local.get(["tasks"]);
  tasks = result.tasks || [];
}

async function saveTasks() {
  await chrome.storage.local.set({ tasks });
}

async function loadActiveTimer() {
  const result = await chrome.storage.local.get(["activeTimer"]);
  activeTimer = result.activeTimer || null;

  if (activeTimer) {
    showActiveTimer();
  }
}

async function saveActiveTimer() {
  await chrome.storage.local.set({ activeTimer });
}

async function saveSession() {
  const task = tasks.find((t) => t.id === activeTimer.taskId);
  if (!task) return;

  const session = {
    startTime: activeTimer.sessionStartTime,
    endTime: Date.now(),
    duration: activeTimer.totalSessionTime,
    date: new Date().toISOString().split("T")[0],
  };

  task.sessions.push(session);
  task.totalTime += activeTimer.totalSessionTime;

  await saveTasks();
}
