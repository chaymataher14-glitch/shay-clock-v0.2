const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Fix the keydown listener
const oldKeys = `    } else if (e.key === 'j' || e.key === 'J') {
      autoNextMedia();
    } else if (e.key === 'k' || e.key === 'K') {
      autoPrevMedia();
    }`;
const newKeys = `    } else if (e.key === 'j' || e.key === 'J') {
      prevTrack();
    } else if (e.key === 'k' || e.key === 'K') {
      nextTrack();
    }`;
code = code.replace(oldKeys, newKeys);

// 2. Fix the HTML buttons
code = code.replace(
  'onclick="autoPrevMedia()" title="Previous Media (J)"',
  'onclick="prevTrack()" title="Previous Track (J)"'
);
code = code.replace(
  'onclick="autoNextMedia()" title="Next Media (K)"',
  'onclick="nextTrack()" title="Next Track (K)"'
);

// 3. Fix MediaSession handlers
const oldSessionKeys = `    navigator.mediaSession.setActionHandler('previoustrack', autoPrevMedia);
    navigator.mediaSession.setActionHandler('nexttrack', autoNextMedia);`;
const newSessionKeys = `    navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
    navigator.mediaSession.setActionHandler('nexttrack', nextTrack);`;
code = code.replace(oldSessionKeys, newSessionKeys);

// 4. Update the logic for nextTrack, prevTrack, nextPlaylist, prevPlaylist
const oldLogic = /function nextTrack\(\) \{ autoNextMedia\(\); \}\n  function prevTrack\(\) \{ autoPrevMedia\(\); \}\n  function nextPlaylist\(\) \{ autoNextMedia\(\); \}\n  function prevPlaylist\(\) \{ autoPrevMedia\(\); \}/;

const newLogic = `function nextTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex < mediaFiles.length - 1) {
        playLocalMedia(currentMediaIndex + 1);
      } else {
        autoNextMedia();
      }
    } else if (mediaFiles.length > 0) {
      playLocalMedia(0);
    }
  }

  function prevTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex > 0) {
        playLocalMedia(currentMediaIndex - 1);
      } else {
        autoPrevMedia();
      }
    } else if (mediaFiles.length > 0) {
      playLocalMedia(mediaFiles.length - 1);
    }
  }

  function nextPlaylist() {
    if (savedPlaylists.length === 0) return;
    currentPlaylistIndex = (currentPlaylistIndex + 1) % savedPlaylists.length;
    document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;
    loadMedia();
    renderPlaylists();
    renderPlaylist();
  }

  function prevPlaylist() {
    if (savedPlaylists.length === 0) return;
    currentPlaylistIndex = (currentPlaylistIndex - 1 + savedPlaylists.length) % savedPlaylists.length;
    document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;
    loadMedia();
    renderPlaylists();
    renderPlaylist();
  }`;

code = code.replace(oldLogic, newLogic);

fs.writeFileSync('index.html', code);
