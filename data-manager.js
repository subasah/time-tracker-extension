// Data Manager Script

document.addEventListener("DOMContentLoaded", async () => {
  setupEventListeners();
  await updateDataSummary();
});

function setupEventListeners() {
  document.getElementById("backBtn").addEventListener("click", () => {
    window.close();
  });

  document.getElementById("exportBtn").addEventListener("click", exportData);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);
  document.getElementById("importBtn").addEventListener("click", importData);
  document.getElementById("clearBtn").addEventListener("click", clearAllData);
}

async function updateDataSummary() {
  const result = await chrome.storage.local.get(["tasks"]);
  const tasks = result.tasks || [];

  const totalTasks = tasks.length;
  const totalSessions = tasks.reduce(
    (sum, task) => sum + task.sessions.length,
    0
  );
  const totalTime = tasks.reduce((sum, task) => sum + task.totalTime, 0);
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  const oldestSession = tasks
    .flatMap((task) => task.sessions)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];

  const firstDate = oldestSession
    ? new Date(oldestSession.startTime).toLocaleDateString()
    : "N/A";

  const summaryHTML = `
    <div style="display: grid; gap: 10px;">
      <div><strong>Total Tasks:</strong> ${totalTasks}</div>
      <div><strong>Total Sessions:</strong> ${totalSessions}</div>
      <div><strong>Total Time Tracked:</strong> ${hours}h ${minutes}m</div>
      <div><strong>Tracking Since:</strong> ${firstDate}</div>
      <div><strong>Storage Used:</strong> ${
        JSON.stringify(tasks).length
      } bytes</div>
    </div>
  `;

  document.getElementById("dataSummary").innerHTML = summaryHTML;
}

async function exportData() {
  const result = await chrome.storage.local.get(["tasks", "activeTimer"]);
  const data = {
    exportDate: new Date().toISOString(),
    version: "1.0",
    tasks: result.tasks || [],
    activeTimer: result.activeTimer || null,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `skill-tracker-backup-${
    new Date().toISOString().split("T")[0]
  }.json`;
  a.click();
  URL.revokeObjectURL(url);

  alert("Data exported successfully! ✅");
}

async function exportCsv() {
  const result = await chrome.storage.local.get(["tasks"]);
  const tasks = result.tasks || [];

  // Create CSV header
  let csv =
    "Task Name,Session Date,Start Time,End Time,Duration (minutes),Technique\n";

  // Add rows
  tasks.forEach((task) => {
    task.sessions.forEach((session) => {
      const startTime = new Date(session.startTime).toLocaleString();
      const endTime = new Date(session.endTime).toLocaleString();
      const duration = Math.floor(session.duration / 60);

      csv += `"${task.name}","${session.date}","${startTime}","${endTime}",${duration},"${task.technique}"\n`;
    });
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `skill-tracker-sessions-${
    new Date().toISOString().split("T")[0]
  }.csv`;
  a.click();
  URL.revokeObjectURL(url);

  alert("Sessions exported to CSV successfully! ✅");
}

async function importData() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a file to import");
    return;
  }

  const confirmImport = confirm(
    "⚠️ Warning: Importing will replace all your current data. Continue?"
  );

  if (!confirmImport) {
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);

      // Validate data structure
      if (!data.tasks || !Array.isArray(data.tasks)) {
        throw new Error("Invalid data format");
      }

      // Import data
      await chrome.storage.local.set({
        tasks: data.tasks,
        activeTimer: data.activeTimer || null,
      });

      alert("Data imported successfully! ✅");
      await updateDataSummary();
      fileInput.value = "";
    } catch (error) {
      alert("Error importing data: " + error.message);
    }
  };

  reader.readAsText(file);
}

async function clearAllData() {
  const confirmClear = confirm(
    "⚠️ Are you absolutely sure? This will delete ALL your tasks and session history permanently!"
  );

  if (!confirmClear) {
    return;
  }

  const doubleConfirm = confirm(
    "⚠️ Last chance! This action cannot be undone. Delete everything?"
  );

  if (!doubleConfirm) {
    return;
  }

  await chrome.storage.local.clear();
  alert("All data cleared successfully");
  await updateDataSummary();
}
