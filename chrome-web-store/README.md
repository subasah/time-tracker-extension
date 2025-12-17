# Chrome Web Store Submission Package

## Folder Contents

This folder contains everything needed for Chrome Web Store submission.

### Generated Files

1. **Promotional Images** (in `promotional-images/` folder)
   - Small tile: 440x280px (Required)
   - Large tile: 920x680px (Optional)
   - Marquee: 1400x560px (Optional)
   - Screenshot 1: 1280x800px (Required)
   - Screenshot 2: 1280x800px (Optional)

2. **Image Generator**
   - Open `promotional-images/create-images.html` in your browser
   - Click the download buttons to save all images

### Store Listing Information

**Extension Name:** Skill Time Tracker

**Short Description (132 chars max):**
Track time spent learning skills with Pomodoro, 52-17, and custom timers. Build better learning habits with detailed statistics.

**Detailed Description:**

Skill Time Tracker helps you master any skill through focused, timed practice sessions. Whether you're learning to code, practicing an instrument, studying languages, or developing any other skill, this extension keeps you accountable and motivated.

**Features:**

🍅 **Multiple Timer Techniques**
- Pomodoro (25min work, 5min break)
- 52-17 (52min work, 17min break)
- Custom timers (set your own duration)
- Stopwatch mode (no time limits)

⏱️ **Task Management**
- Create unlimited tasks for different skills
- Track time spent on each task
- View session history and statistics
- Never lose your progress

📊 **Detailed Statistics**
- See total time invested per skill
- Track number of completed sessions
- Monitor your learning consistency
- Visualize your progress over time

🔔 **Smart Notifications**
- Get notified when work sessions complete
- Automatic break reminders
- Celebrate your achievements

**Perfect for:**
- Students and lifelong learners
- Remote workers and freelancers
- Anyone building new skills
- People who want to track their practice time

**Privacy:**
All data is stored locally on your device. We never collect, share, or transmit your information.

**Category:** Productivity

**Language:** English

**Privacy Policy:** Not required (no data collection)

### Submission Checklist

- [ ] Icons verified (16x16, 48x48, 128x128) ✓
- [ ] Small promotional tile (440x280) created
- [ ] At least 1 screenshot (1280x800) created
- [ ] Store listing description written ✓
- [ ] Privacy policy reviewed (not needed for this extension)
- [ ] Extension tested in Chrome
- [ ] Manifest permissions justified
- [ ] Version number set to 1.0.0

### Next Steps

1. Generate images using `promotional-images/create-images.html`
2. Optional: Replace generated images with custom designs or real screenshots
3. Create ZIP file of the extension root folder (excluding chrome-web-store folder)
4. Upload to Chrome Web Store Developer Dashboard
5. Fill in the store listing with information from this README
6. Submit for review

### Packaging Command

Run this from the extension root directory (time-tracker-extension):

```powershell
# Create a ZIP excluding unnecessary files
$files = Get-ChildItem -Path . -Exclude chrome-web-store,.git,node_modules
Compress-Archive -Path $files -DestinationPath chrome-web-store\time-tracker-extension-v1.0.0.zip -Force
```

Or manually:
1. Go to parent folder (PProjects)
2. Select all extension files EXCEPT the `chrome-web-store` folder
3. Right-click → Send to → Compressed (zipped) folder
4. Name it: time-tracker-extension-v1.0.0.zip
5. Move the ZIP into the chrome-web-store folder
