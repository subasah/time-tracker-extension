# 🏗️ Extension Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INTERACTION                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     POPUP INTERFACE                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  popup.html (UI)                                     │  │
│  │  • Task creation form                                │  │
│  │  • Task list display                                 │  │
│  │  • Timer controls                                    │  │
│  │  • Navigation buttons                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  popup.js (Logic)                                    │  │
│  │  • Task CRUD operations                              │  │
│  │  • Timer state management                            │  │
│  │  • UI updates                                        │  │
│  │  • Event handlers                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────┐
    │  Storage    │  │  Background  │  │  Pages   │
    │   Layer     │  │   Service    │  │  Layer   │
    └─────────────┘  └──────────────┘  └──────────┘
              │               │               │
              │               │               │
              ▼               ▼               ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────┐
│ Chrome Storage   │ │  background.js  │ │  Statistics      │
│                  │ │                 │ │  (statistics.*)  │
│ • tasks[]        │ │ • Timer loop    │ │                  │
│ • activeTimer{}  │ │ • Countdown     │ │ • Charts         │
│ • sessions[]     │ │ • Notifications │ │ • Analytics      │
│                  │ │ • State sync    │ │ • Visualizations │
└──────────────────┘ └─────────────────┘ └──────────────────┘
                                              │
                                              ▼
                                    ┌──────────────────┐
                                    │  Data Manager    │
                                    │  (data-mgr.*)    │
                                    │                  │
                                    │ • Export JSON    │
                                    │ • Export CSV     │
                                    │ • Import data    │
                                    │ • Clear all      │
                                    └──────────────────┘
```

## Data Flow

```
User Creates Task
       │
       ▼
popup.js validates input
       │
       ▼
Create task object
       │
       ▼
Save to Chrome Storage
       │
       ▼
Update UI (render tasks)


User Starts Timer
       │
       ▼
popup.js creates timer state
       │
       ▼
Send message to background.js
       │
       ▼
background.js starts interval
       │
       ├──> Every second:
       │    • Decrement time
       │    • Save to storage
       │    • Send update to popup
       │
       ├──> On completion:
       │    • Show notification
       │    • Save session data
       │    • Start break/complete
       │
       ▼
Update storage with session
       │
       ▼
Available in statistics
```

## Component Interactions

```
┌────────────┐
│   Popup    │◄─────────────┐
└────────────┘              │
      │                     │
      │ messages            │ messages
      ▼                     │
┌────────────┐              │
│ Background │──────────────┘
└────────────┘
      │
      │ storage API
      ▼
┌────────────┐
│  Storage   │◄────────┐
└────────────┘         │
      │                │
      │ reads          │ reads/writes
      ▼                │
┌────────────┐         │
│ Statistics │─────────┘
└────────────┘

┌────────────┐
│    Data    │◄────────┐
│  Manager   │         │
└────────────┘         │
      │                │
      │ reads/writes   │
      ▼                │
┌────────────┐         │
│  Storage   │─────────┘
└────────────┘
```

## File Dependencies

```
manifest.json
    │
    ├──> popup.html
    │     └──> popup.js
    │     └──> popup.css
    │
    ├──> background.js
    │
    └──> icons/
          ├──> icon16.png
          ├──> icon48.png
          └──> icon128.png


External Pages (opened in tabs):

statistics.html
    └──> statistics.js
    └──> popup.css
    └──> Chart.js (CDN)

data-manager.html
    └──> data-manager.js
    └──> popup.css

demo-data.html
    └──> demo-data.js
    └──> popup.css

Utilities (standalone):

icon-generator.html (no dependencies)
```

## State Management

```
Application State
│
├──> Persistent State (Chrome Storage)
│    │
│    ├──> tasks: Array<Task>
│    │    └──> Task {
│    │         id, name, technique,
│    │         workDuration, breakDuration,
│    │         totalTime, sessions[], createdAt
│    │         }
│    │
│    └──> activeTimer: Timer | null
│         └──> Timer {
│              taskId, taskName, technique,
│              timeRemaining, isRunning, isPaused,
│              isBreak, sessionStartTime, totalSessionTime
│              }
│
└──> Transient State (UI)
     │
     ├──> DOM elements
     ├──> Event listeners
     ├──> Chart instances
     └──> Interval timers
```

## Event Flow

```
User Action
    │
    ▼
Event Listener (popup.js)
    │
    ▼
Handler Function
    │
    ├──> Update State
    │    └──> Chrome Storage
    │
    ├──> Send Message
    │    └──> background.js
    │
    └──> Update UI
         └──> DOM manipulation
```

## Timer Lifecycle

```
[Created] ──select task──> [Selected]
                                │
                                │ start
                                ▼
                            [Running]
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                  pause       time=0      stop
                    │           │           │
                    ▼           ▼           ▼
                [Paused]    [Complete]  [Stopped]
                    │           │           │
                  resume     save session  save data
                    │           │           │
                    └──────> [Running]      └──> [Clear]
                                │
                                └──> [Break] ──> [Running]
```

## Notification Flow

```
Timer Event
    │
    ├──> Work Complete
    │    └──> chrome.notifications.create()
    │         └──> "Work Session Complete! 🎉"
    │
    ├──> Break Complete
    │    └──> chrome.notifications.create()
    │         └──> "Break Complete! 💪"
    │
    └──> Session Complete
         └──> chrome.notifications.create()
              └──> "Session Complete! 🎊"
```

## Statistics Generation

```
Load Tasks from Storage
    │
    ▼
Aggregate Data
    │
    ├──> Total time calculation
    ├──> Session counting
    ├──> Date grouping
    └──> Task grouping
    │
    ▼
Generate Visualizations
    │
    ├──> Summary Cards
    ├──> Bar Chart (Task Time)
    ├──> Line Chart (Daily Activity)
    ├──> Table (Task Details)
    └──> Heatmap (Weekly Pattern)
    │
    ▼
Render to DOM
```

## Security Model

```
Extension Permissions (manifest.json)
    │
    ├──> storage: Local data only
    ├──> alarms: Timer scheduling
    └──> notifications: User alerts

Data Privacy
    │
    ├──> No external requests
    ├──> No analytics
    ├──> No tracking
    └──> User controls all data

User Controls
    │
    ├──> Export data (backup)
    ├──> Import data (restore)
    └──> Clear data (delete)
```

## Technology Stack

```
Frontend Layer
    │
    ├──> HTML5 (Structure)
    ├──> CSS3 (Styling)
    │    ├──> Flexbox
    │    ├──> Grid
    │    └──> Gradients
    │
    └──> JavaScript ES6+ (Logic)
         ├──> Async/Await
         ├──> Arrow Functions
         ├──> Template Literals
         └──> Destructuring

Chrome APIs
    │
    ├──> chrome.storage.local
    ├──> chrome.runtime
    ├──> chrome.notifications
    ├──> chrome.alarms
    └──> chrome.tabs

External Libraries
    │
    └──> Chart.js (v4.4.0)
         └──> CDN from jsdelivr
```

---

This architecture supports:
✅ Scalability (easy to add features)
✅ Maintainability (clear separation)
✅ Reliability (persistent storage)
✅ Performance (efficient updates)
✅ Privacy (local-first design)
