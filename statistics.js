// Statistics page script

let tasks = [];
let selectedPeriod = 30;

document.addEventListener("DOMContentLoaded", async () => {
  await loadData();
  setupEventListeners();
  renderStatistics();
});

function setupEventListeners() {
  document.getElementById("backBtn").addEventListener("click", () => {
    window.close();
  });

  document.querySelectorAll("[data-period]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document
        .querySelectorAll("[data-period]")
        .forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      selectedPeriod = e.target.dataset.period;
      renderStatistics();
    });
  });
}

async function loadData() {
  const result = await chrome.storage.local.get(["tasks"]);
  tasks = result.tasks || [];
}

function renderStatistics() {
  updateSummaryCards();
  renderTaskTimeChart();
  renderDailyActivityChart();
  renderTaskDetailsTable();
  renderWeeklyHeatmap();
}

function updateSummaryCards() {
  // Calculate total time
  const totalSeconds = tasks.reduce((sum, task) => sum + task.totalTime, 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMinutes = Math.floor((totalSeconds % 3600) / 60);
  document.getElementById(
    "totalTime"
  ).textContent = `${totalHours}h ${totalMinutes}m`;

  // Total tasks
  document.getElementById("totalTasks").textContent = tasks.length;

  // Today's time
  const today = new Date().toISOString().split("T")[0];
  const todaySeconds = tasks.reduce((sum, task) => {
    const todaySessions = task.sessions.filter((s) => s.date === today);
    return sum + todaySessions.reduce((s, session) => s + session.duration, 0);
  }, 0);
  const todayHours = Math.floor(todaySeconds / 3600);
  const todayMinutes = Math.floor((todaySeconds % 3600) / 60);
  document.getElementById(
    "todayTime"
  ).textContent = `${todayHours}h ${todayMinutes}m`;

  // Average session
  const totalSessions = tasks.reduce(
    (sum, task) => sum + task.sessions.length,
    0
  );
  const avgSeconds = totalSessions > 0 ? totalSeconds / totalSessions : 0;
  const avgMinutes = Math.floor(avgSeconds / 60);
  document.getElementById("avgSession").textContent = `${avgMinutes}m`;
}

function renderTaskTimeChart() {
  const ctx = document.getElementById("taskTimeChart");

  // Prepare data
  const taskData = tasks
    .map((task) => ({
      name: task.name,
      time: task.totalTime / 60, // Convert to minutes
    }))
    .sort((a, b) => b.time - a.time);

  const labels = taskData.map((t) => t.name);
  const data = taskData.map((t) => t.time);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Time (minutes)",
          data: data,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Minutes",
          },
        },
      },
    },
  });
}

function renderDailyActivityChart() {
  const ctx = document.getElementById("dailyActivityChart");

  // Get date range
  const days = selectedPeriod === "all" ? 365 : parseInt(selectedPeriod);
  const dates = getLastNDays(days);

  // Aggregate time by date
  const dailyData = {};
  dates.forEach((date) => (dailyData[date] = 0));

  tasks.forEach((task) => {
    task.sessions.forEach((session) => {
      if (dailyData.hasOwnProperty(session.date)) {
        dailyData[session.date] += session.duration / 60; // Convert to minutes
      }
    });
  });

  const labels = Object.keys(dailyData).map((date) => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
  const data = Object.values(dailyData);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Daily Time (minutes)",
          data: data,
          fill: true,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Minutes",
          },
        },
        x: {
          title: {
            display: true,
            text: "Date",
          },
        },
      },
    },
  });
}

function renderTaskDetailsTable() {
  const container = document.getElementById("taskDetailsTable");

  if (tasks.length === 0) {
    container.innerHTML = '<p class="empty-state">No task data available</p>';
    return;
  }

  const tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Task Name</th>
          <th>Total Time</th>
          <th>Sessions</th>
          <th>Avg Session</th>
          <th>Technique</th>
          <th>Last Session</th>
        </tr>
      </thead>
      <tbody>
        ${tasks
          .map((task) => {
            const hours = Math.floor(task.totalTime / 3600);
            const minutes = Math.floor((task.totalTime % 3600) / 60);
            const timeDisplay =
              hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            const avgSession =
              task.sessions.length > 0
                ? Math.floor(task.totalTime / task.sessions.length / 60)
                : 0;

            const lastSession =
              task.sessions.length > 0
                ? new Date(
                    task.sessions[task.sessions.length - 1].date
                  ).toLocaleDateString()
                : "N/A";

            return `
            <tr>
              <td><strong>${task.name}</strong></td>
              <td>${timeDisplay}</td>
              <td>${task.sessions.length}</td>
              <td>${avgSession}m</td>
              <td>${getTechniqueName(task.technique)}</td>
              <td>${lastSession}</td>
            </tr>
          `;
          })
          .join("")}
      </tbody>
    </table>
  `;

  container.innerHTML = tableHTML;
}

function renderWeeklyHeatmap() {
  const container = document.getElementById("weeklyHeatmap");

  // Get last 7 weeks
  const weeks = 7;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Prepare data structure
  const heatmapData = {};
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - weeks * 7);

  for (let i = 0; i < weeks * 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    heatmapData[dateStr] = 0;
  }

  // Populate with session data
  tasks.forEach((task) => {
    task.sessions.forEach((session) => {
      if (heatmapData.hasOwnProperty(session.date)) {
        heatmapData[session.date] += session.duration / 60; // minutes
      }
    });
  });

  // Find max value for scaling
  const maxValue = Math.max(...Object.values(heatmapData), 1);

  // Build heatmap HTML
  let heatmapHTML = '<div class="heatmap-grid">';
  heatmapHTML += '<div class="heatmap-labels">';
  days.forEach((day) => {
    heatmapHTML += `<div class="heatmap-label">${day}</div>`;
  });
  heatmapHTML += "</div>";
  heatmapHTML += '<div class="heatmap-cells">';

  const dates = Object.keys(heatmapData).sort();
  dates.forEach((date, index) => {
    const value = heatmapData[date];
    const intensity = Math.min(Math.floor((value / maxValue) * 4), 4);
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();

    heatmapHTML += `
      <div class="heatmap-cell intensity-${intensity}" 
           title="${date}: ${Math.floor(value)} minutes"
           style="grid-column: ${Math.floor(index / 7) + 1}; grid-row: ${
      dayOfWeek + 1
    };">
      </div>
    `;
  });

  heatmapHTML += "</div></div>";
  heatmapHTML += `
    <div class="heatmap-legend">
      <span>Less</span>
      <div class="legend-scale">
        <div class="legend-cell intensity-0"></div>
        <div class="legend-cell intensity-1"></div>
        <div class="legend-cell intensity-2"></div>
        <div class="legend-cell intensity-3"></div>
        <div class="legend-cell intensity-4"></div>
      </div>
      <span>More</span>
    </div>
  `;

  container.innerHTML = heatmapHTML;
}

function getLastNDays(n) {
  const dates = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
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
