# Skill Time Tracker - Chrome Extension

A powerful Chrome extension to track time spent learning skills with support for multiple time management techniques like Pomodoro, 52-17, and custom timers.

## Features

### 📝 Task Management

- Create and manage learning tasks
- Track multiple skills simultaneously
- Delete tasks when complete

### ⏱️ Multiple Timer Techniques

- **Pomodoro Technique**: 25 minutes work, 5 minutes break
- **52-17 Technique**: 52 minutes work, 17 minutes break
- **Custom Timer**: Set your own work and break durations
- **Stopwatch Mode**: Simple time tracking without breaks

### 📊 Comprehensive Statistics

- **Summary Cards**: Total time, task count, today's time, average session
- **Time by Task Chart**: Visual breakdown of time spent per task (bar chart)
- **Daily Activity Chart**: Track your daily learning activity over time (line chart)
- **Task Details Table**: Complete overview of all tasks with sessions and averages
- **Weekly Heatmap**: Visual representation of your activity patterns

### 🔔 Notifications

- Session completion alerts
- Break reminders
- Automatic session tracking

### 💾 Data Persistence

- All data stored locally in Chrome storage
- Session history with dates
- Progress tracking over time

## Installation

### Method 1: Load Unpacked Extension (For Development/Testing)

1. **Download/Clone this repository** to your local machine

2. **Open Chrome** and navigate to:

   ```
   chrome://extensions/
   ```

3. **Enable Developer Mode**

   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**

   - Click "Load unpacked"
   - Navigate to the `time-tracker-extension` folder
   - Select the folder and click "Select Folder"

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome toolbar
   - Find "Skill Time Tracker" and click the pin icon

### Method 2: Create Icons (Required)

Since this extension needs icons, you'll need to create them or use placeholder images:

1. Create an `icons` folder inside `time-tracker-extension`
2. Add three icon files:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

You can use any image editing tool or online icon generator to create these. Recommended: Use a timer/clock icon design.

## Usage

### Creating a Task

1. Click the extension icon to open the popup
2. Enter a task name (e.g., "Learn JavaScript")
3. Select a time management technique
4. If using Custom, enter work and break durations
5. Click "Add Task"

### Starting a Timer

1. Find your task in the tasks list
2. Click the "Start" button
3. The timer will appear at the top
4. Click "Start" to begin the session
5. Use "Pause"/"Resume" to control the timer
6. Click "Stop" to end the session (data will be saved)

### Viewing Statistics

1. Click the 📊 icon in the top-right of the popup
2. View comprehensive statistics including:
   - Summary cards with key metrics
   - Time breakdown by task
   - Daily activity trends
   - Detailed task table
   - Weekly activity heatmap
3. Use the date filter buttons to view different time periods

## File Structure

```
time-tracker-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Main popup interface
├── popup.js              # Popup logic and task management
├── popup.css             # Styling for all pages
├── statistics.html       # Statistics dashboard
├── statistics.js         # Statistics and charts logic
├── background.js         # Service worker for timer management
└── icons/               # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technologies Used

- **HTML5/CSS3**: Modern UI design
- **Vanilla JavaScript**: No external dependencies for core functionality
- **Chart.js**: Beautiful charts and visualizations
- **Chrome Extension API**: Storage, notifications, and background services

## Features Breakdown

### Timer Techniques

**Pomodoro (25/5)**

- 25 minutes of focused work
- 5 minutes break
- Popular productivity technique

**52-17 Technique**

- 52 minutes of focused work
- 17 minutes break
- Based on DeskTime research

**Custom Timer**

- Set your own work duration
- Set your own break duration
- Fully flexible

**Stopwatch**

- Simple time tracking
- No automatic breaks
- Good for flexible learning

### Data Tracking

The extension tracks:

- Session start and end times
- Total duration per session
- Date of each session
- Cumulative time per task
- Session count per task

### Statistics Views

1. **Summary Cards**: Quick overview of key metrics
2. **Bar Chart**: Compare time across different tasks
3. **Line Chart**: Track daily learning patterns
4. **Details Table**: Comprehensive task information
5. **Heatmap**: Visual activity calendar

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Complete privacy and control over your learning data

## Tips for Best Use

1. **Break Down Skills**: Create separate tasks for different aspects of learning
2. **Consistent Practice**: Use daily to build learning habits
3. **Review Statistics**: Check weekly to identify patterns
4. **Try Different Techniques**: Experiment to find what works best for you
5. **Set Realistic Goals**: Use the data to set achievable learning targets

## Future Enhancements

Potential features for future versions:

- Export data to CSV/JSON
- Goal setting and achievement tracking
- Sound notifications
- Theme customization
- Sync across devices
- Weekly/monthly reports
- Productivity insights

## Troubleshooting

**Timer not working?**

- Make sure the extension has notification permissions
- Check if the extension is enabled in chrome://extensions/

**Data not saving?**

- Ensure Chrome has storage permissions
- Try reloading the extension

**Statistics not showing?**

- Complete at least one session first
- Refresh the statistics page

## License

This project is open source and available for personal and educational use.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

---

**Happy Learning! 📚⏱️**
