// Background service worker for timer management

let timerInterval = null;
let activeTimer = null;

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "START_TIMER":
      startTimer(message.timer);
      break;
    case "PAUSE_TIMER":
      pauseTimer();
      break;
    case "RESUME_TIMER":
      resumeTimer();
      break;
    case "STOP_TIMER":
      stopTimer();
      break;
  }
});

// Timer management
async function startTimer(timer) {
  activeTimer = timer;

  // Make sure timer is marked as running
  activeTimer.isRunning = true;
  activeTimer.isPaused = false;

  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  // Save initial state
  await saveTimer();
  notifyTimerUpdate();

  // Start countdown
  timerInterval = setInterval(async () => {
    if (!activeTimer || !activeTimer.isRunning || activeTimer.isPaused) {
      return;
    }

    // Increment total session time
    activeTimer.totalSessionTime++;

    // Handle stopwatch mode (no time limit)
    if (activeTimer.technique === "stopwatch") {
      await saveTimer();
      notifyTimerUpdate();
      return;
    }

    // Decrement time remaining
    if (activeTimer.timeRemaining > 0) {
      activeTimer.timeRemaining--;
      await saveTimer();
      notifyTimerUpdate();
    } else {
      // Timer completed
      await handleTimerComplete();
    }
  }, 1000);
}

function pauseTimer() {
  if (activeTimer) {
    activeTimer.isPaused = true;
  }
}

function resumeTimer() {
  if (activeTimer) {
    activeTimer.isPaused = false;
  }
}

async function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  activeTimer = null;
  await saveTimer();
}

async function handleTimerComplete() {
  // Stopwatch mode doesn't have completion
  if (activeTimer.technique === "stopwatch") {
    return;
  }

  if (!activeTimer.isBreak) {
    // Work session completed, start break
    if (activeTimer.breakDuration > 0) {
      activeTimer.isBreak = true;
      activeTimer.timeRemaining = activeTimer.breakDuration * 60;

      // Send notification
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "Work Session Complete! 🎉",
        message: `Great job! Time for a ${activeTimer.breakDuration} minute break.`,
        priority: 2,
      });

      await saveTimer();
      notifyTimerUpdate();
    } else {
      // No break, session complete
      await completeSession();
    }
  } else {
    // Break completed, start new work session
    activeTimer.isBreak = false;
    activeTimer.timeRemaining = activeTimer.workDuration * 60;

    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "Break Complete! 💪",
      message: `Ready to focus? Starting new work session.`,
      priority: 2,
    });

    await saveTimer();
    notifyTimerUpdate();
  }
}

async function completeSession() {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icons/icon128.png",
    title: "Session Complete! 🎊",
    message: `You've completed a full session of ${activeTimer.taskName}!`,
    priority: 2,
  });

  // Save the session
  await saveCompletedSession();

  // Reset timer
  await stopTimer();
  notifyTimerUpdate();
}

async function saveCompletedSession() {
  if (!activeTimer) return;

  const result = await chrome.storage.local.get(["tasks"]);
  const tasks = result.tasks || [];

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

  await chrome.storage.local.set({ tasks });
}

async function saveTimer() {
  await chrome.storage.local.set({ activeTimer });
}

function notifyTimerUpdate() {
  // Send message to popup if it's open
  chrome.runtime
    .sendMessage({
      type: "TIMER_UPDATE",
      timer: activeTimer,
    })
    .catch(() => {
      // Popup might be closed, ignore error
    });
}

// Initialize on startup
chrome.runtime.onStartup.addListener(async () => {
  const result = await chrome.storage.local.get(["activeTimer"]);
  if (result.activeTimer && result.activeTimer.isRunning) {
    // Resume timer if it was running
    activeTimer = result.activeTimer;
    if (!activeTimer.isPaused) {
      startTimer(activeTimer);
    }
  }
});

// Load active timer when service worker starts
(async () => {
  const result = await chrome.storage.local.get(["activeTimer"]);
  if (result.activeTimer) {
    activeTimer = result.activeTimer;
    if (activeTimer.isRunning && !activeTimer.isPaused) {
      // Resume the timer
      startTimer(activeTimer);
    }
  }
})();
