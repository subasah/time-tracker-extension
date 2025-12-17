// Demo Data Generator Script

const sampleTasks = [
  {
    name: "Learn JavaScript",
    technique: "pomodoro",
    workDuration: 25,
    breakDuration: 5,
  },
  {
    name: "Practice Python",
    technique: "52-17",
    workDuration: 52,
    breakDuration: 17,
  },
  {
    name: "Study Algorithms",
    technique: "custom",
    workDuration: 30,
    breakDuration: 10,
  },
  {
    name: "Read Tech Books",
    technique: "stopwatch",
    workDuration: 0,
    breakDuration: 0,
  },
  {
    name: "Watch Tutorials",
    technique: "pomodoro",
    workDuration: 25,
    breakDuration: 5,
  },
  {
    name: "Build Projects",
    technique: "52-17",
    workDuration: 52,
    breakDuration: 17,
  },
  {
    name: "Code Challenges",
    technique: "pomodoro",
    workDuration: 25,
    breakDuration: 5,
  },
  {
    name: "Learn TypeScript",
    technique: "custom",
    workDuration: 40,
    breakDuration: 15,
  },
  {
    name: "Database Design",
    technique: "pomodoro",
    workDuration: 25,
    breakDuration: 5,
  },
  {
    name: "System Architecture",
    technique: "stopwatch",
    workDuration: 0,
    breakDuration: 0,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("generateBtn")
    .addEventListener("click", generateDemoData);
});

async function generateDemoData() {
  const taskCount = parseInt(document.getElementById("taskCount").value);
  const daysCount = parseInt(document.getElementById("daysCount").value);
  const statusDiv = document.getElementById("status");

  if (taskCount < 1 || taskCount > 10) {
    statusDiv.textContent = "❌ Please enter 1-10 tasks";
    statusDiv.style.color = "#ef4444";
    return;
  }

  if (daysCount < 1 || daysCount > 90) {
    statusDiv.textContent = "❌ Please enter 1-90 days";
    statusDiv.style.color = "#ef4444";
    return;
  }

  statusDiv.textContent = "⏳ Generating demo data...";
  statusDiv.style.color = "#667eea";

  // Get existing tasks
  const result = await chrome.storage.local.get(["tasks"]);
  const existingTasks = result.tasks || [];

  // Generate new tasks
  const newTasks = [];
  for (let i = 0; i < taskCount; i++) {
    const template = sampleTasks[i];
    const task = {
      id: Date.now().toString() + "_" + i,
      name: template.name,
      technique: template.technique,
      workDuration: template.workDuration,
      breakDuration: template.breakDuration,
      totalTime: 0,
      sessions: [],
      createdAt: new Date(
        Date.now() - daysCount * 24 * 60 * 60 * 1000
      ).toISOString(),
    };

    // Generate sessions for this task
    const sessionsToGenerate =
      Math.floor(Math.random() * (daysCount * 2)) + daysCount;

    for (let j = 0; j < sessionsToGenerate; j++) {
      const daysAgo = Math.floor(Math.random() * daysCount);
      const sessionDate = new Date();
      sessionDate.setDate(sessionDate.getDate() - daysAgo);

      // Random time of day (between 8 AM and 10 PM)
      const hour = 8 + Math.floor(Math.random() * 14);
      const minute = Math.floor(Math.random() * 60);
      sessionDate.setHours(hour, minute, 0, 0);

      // Session duration (15-90 minutes)
      const duration = (15 + Math.floor(Math.random() * 75)) * 60; // in seconds

      const session = {
        startTime: sessionDate.getTime(),
        endTime: sessionDate.getTime() + duration * 1000,
        duration: duration,
        date: sessionDate.toISOString().split("T")[0],
      };

      task.sessions.push(session);
      task.totalTime += duration;
    }

    // Sort sessions by date
    task.sessions.sort((a, b) => a.startTime - b.startTime);

    newTasks.push(task);
  }

  // Combine with existing tasks
  const allTasks = [...existingTasks, ...newTasks];

  // Save to storage
  await chrome.storage.local.set({ tasks: allTasks });

  const totalSessions = newTasks.reduce(
    (sum, task) => sum + task.sessions.length,
    0
  );
  const totalTime = newTasks.reduce((sum, task) => sum + task.totalTime, 0);
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  statusDiv.innerHTML = `
    ✅ Demo data generated successfully!<br>
    <strong>Added:</strong> ${taskCount} tasks, ${totalSessions} sessions<br>
    <strong>Total Time:</strong> ${hours}h ${minutes}m<br>
    <strong>Date Range:</strong> Last ${daysCount} days
  `;
  statusDiv.style.color = "#10b981";

  setTimeout(() => {
    statusDiv.innerHTML +=
      "<br><br>Close this tab and check the extension popup!";
  }, 1000);
}
