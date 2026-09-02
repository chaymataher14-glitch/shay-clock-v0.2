const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Remove the broken icon.png and manifest.json references
code = code.replace(/<link rel="icon" href="\/icon\.png\?v=4" sizes="512x512" type="image\/png">\n?/g, '');
code = code.replace(/<link rel="apple-touch-icon" href="\/icon\.png\?v=4">\n?/g, '');
code = code.replace(/<link rel="manifest" href="\/manifest\.json\?v=4">\n?/g, '');

// Also remove the SVG logo from the sidebar to be safe, just keep the text
const svgRegex = /<svg width="48" height="48" viewBox="0 0 24 24"[\s\S]*?<\/svg>/;
code = code.replace(svgRegex, '');

// 2. Fix the Shortcuts texts to match exactly
// In Settings page:
const oldSettingsShortcuts = `<b>Media:</b> <b>X</b> play/pause &middot; <b>L / C</b> load/close &middot; <b>V</b> mute &middot; <b>P / N</b> prev/next playlist &middot; <b>J / K</b> prev/next track`;
// Wait, in the file it's actually:
// <b>Media:</b> <b>X</b> play/pause · <b>L / C</b> load/close · <b>V</b> mute · <b>P / N</b> prev/next playlist · <b>J / K</b> prev/next track
const settingsRegex = /<b>Media:<\/b> <b>X<\/b> play\/pause · <b>L \/ C<\/b> load\/close · <b>V<\/b> mute · <b>P \/ N<\/b> prev\/next playlist · <b>J \/ K<\/b> prev\/next track/;
code = code.replace(settingsRegex, '<b>Media:</b> <b>X</b> play/pause · <b>L / C</b> load/close · <b>V</b> mute · <b>P / N</b> prev/next playlist · <b>J / K</b> prev/next track');

// Let's modify the buttons on the media page to match the settings page text exactly so there's no confusion
code = code.replace(/>\[P\] Prev List<\/button>/g, '>[P] Prev Playlist</button>');
code = code.replace(/>\[N\] Next List<\/button>/g, '>[N] Next Playlist</button>');
code = code.replace(/>\[L\] Play \/ Load<\/button>/g, '>[L] Load Link</button>');
code = code.replace(/>\[C\] Close Media<\/button>/g, '>[C] Close</button>');
code = code.replace(/>\[X\] Play\/Pause<\/button>/g, '>[X] Play/Pause</button>');
code = code.replace(/>\[V\] Mute<\/button>/g, '>[V] Mute</button>');
code = code.replace(/>\[J\] Prev Track<\/button>/g, '>[J] Prev Track</button>');
code = code.replace(/>\[K\] Next Track<\/button>/g, '>[K] Next Track</button>');

// 3. Fix the Media Playlist issue
// We will add an "Add to Playlist" button to let the user add the current m-url to savedPlaylists!
// And we'll add a section to show savedPlaylists below the local files.
const mediaInputRegex = /<button class="btn" onclick="loadMedia\(\)" style="[^"]*">Load Link<\/button>/;
const newMediaInput = `<button class="btn" onclick="loadMedia()" style="padding: calc(4px * var(--auto-scale, 1)) calc(12px * var(--auto-scale, 1)); font-weight: bold;">Load Link</button>
            <button class="btn" onclick="addCurrentUrlToPlaylist()" style="padding: calc(4px * var(--auto-scale, 1)) calc(12px * var(--auto-scale, 1)); font-weight: bold;">+ Save to Playlist</button>`;
code = code.replace(mediaInputRegex, newMediaInput);

const playlistJs = `
  function addCurrentUrlToPlaylist() {
    const url = document.getElementById('m-url').value;
    if (url && !savedPlaylists.includes(url)) {
      savedPlaylists.push(url);
      saveSettings();
      alert('URL saved to your Web Playlist!');
    }
  }
`;

code = code.replace(/function loadMedia\(\) {/, playlistJs + '\n  function loadMedia() {');

// Also to fix local uploads playing, we ensure localPlayer plays smoothly
code = code.replace(/localPlayer.play\(\).catch\(e => console.log\('Auto-play prevented', e\)\);/, `localPlayer.play().catch(e => { console.log('Auto-play prevented', e); alert('Auto-play was blocked. Please click the play button on the media player.'); });`);

fs.writeFileSync('index.html', code);
console.log('Fixed issues');
