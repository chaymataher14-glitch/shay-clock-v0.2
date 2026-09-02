const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Replace playAllSaved
const playAllRegex = /function playAllSaved\(\) \{[\s\S]*?showToast\("Continuous play requires all YouTube links\."\);\n    \}\n  \}/;

const newPlayAllSaved = `function getUnifiedQueue() {
    let q = [];
    mediaFiles.forEach((file, idx) => {
      q.push({ type: 'local', index: idx, url: file.url, name: file.name });
    });
    savedPlaylists.forEach((list, idx) => {
      if (list.autoplay !== false) {
        q.push({ type: 'web', index: idx, url: list.url, name: list.name });
      }
    });
    return q;
  }

  function playQueueItem(qIndex, q) {
    if (!q) q = getUnifiedQueue();
    if (q.length === 0) return;
    if (qIndex >= q.length) qIndex = 0;
    if (qIndex < 0) qIndex = q.length - 1;

    let item = q[qIndex];
    if (item.type === 'local') {
      playLocalMedia(item.index);
    } else {
      currentPlaylistIndex = item.index;
      document.getElementById('m-url').value = item.url;
      loadMedia();
      renderPlaylists();
      renderPlaylist();
    }
  }

  function getCurrentQueueIndex(q) {
    if (!q) q = getUnifiedQueue();
    if (localPlayer && localPlayer.style.display !== 'none') {
      let idx = q.findIndex(i => i.type === 'local' && i.index === currentMediaIndex);
      return idx !== -1 ? idx : 0;
    } else {
      let idx = q.findIndex(i => i.type === 'web' && i.index === currentPlaylistIndex);
      return idx !== -1 ? idx : 0;
    }
  }

  function playAllSaved() {
    let q = getUnifiedQueue();
    if (q.length === 0) {
      showToast("No items selected for playback.");
      return;
    }
    closeSavedMediaPopup();
    playQueueItem(0, q);
    showToast("Playing selected media in sequence...");
  }`;

code = code.replace(playAllRegex, newPlayAllSaved);

// 2. Replace the rest of the sequence functions
const sequenceFunctionsRegex = /function autoNextMedia\(\) \{[\s\S]*?renderPlaylist\(\);\n  \}/;

const newSequenceFunctions = `function autoNextMedia() {
    let q = getUnifiedQueue();
    if (q.length === 0) return;
    playQueueItem(getCurrentQueueIndex(q) + 1, q);
  }

  function autoPrevMedia() {
    let q = getUnifiedQueue();
    if (q.length === 0) return;
    playQueueItem(getCurrentQueueIndex(q) - 1, q);
  }

  function nextTrack() { autoNextMedia(); }
  function prevTrack() { autoPrevMedia(); }
  function nextPlaylist() { autoNextMedia(); }
  function prevPlaylist() { autoPrevMedia(); }`;

code = code.replace(sequenceFunctionsRegex, newSequenceFunctions);

fs.writeFileSync('index.html', code);
