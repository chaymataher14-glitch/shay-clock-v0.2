const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = `      // If it was running, subtract wall-clock time elapsed since last save.
      if (s.pIsRunning && s.savedAt) {
        const elapsed = Math.floor((Date.now() - s.savedAt) / 1000);
        pTimeLeft = Math.max(0, pTimeLeft - elapsed);
      }`;

const replacement = `      // If it was running, subtract wall-clock time elapsed since last save.
      if (s.pIsRunning && s.savedAt) {
        const elapsed = Math.floor((Date.now() - s.savedAt) / 1000);
        const actualStudied = Math.min(elapsed, pTimeLeft);
        pTimeLeft = Math.max(0, pTimeLeft - elapsed);
        if (pMode === 'work' && actualStudied > 0) {
            logStudyTime(actualStudied);
        }
      }`;

content = content.replace(target, replacement);
fs.writeFileSync('index.html', content);
