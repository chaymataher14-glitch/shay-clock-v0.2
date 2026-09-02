const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. YT info Delivery patch
const oldYtListener = `        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
            isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
            if (data.info.playerState === 0) {
                // Video ended
                const url = document.getElementById('m-url') ? document.getElementById('m-url').value : '';
                if (!url.includes('list=')) {
                    autoNextMedia();
                }
            }
        }`;
const newYtListener = `        if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playlistIndex !== undefined) window.ytPlaylistIndex = data.info.playlistIndex;
            if (data.info.playlist !== undefined) window.ytPlaylistLength = data.info.playlist.length;
            
            if (data.info.playerState !== undefined) {
                isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
                if (data.info.muted !== undefined) isYtMuted = data.info.muted;
                if (data.info.playerState === 0) {
                    // Video ended
                    if (window.ytPlaylistLength > 1) {
                        if (window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
                            nextPlaylist(); // Reached end of YT playlist, spill over to next Macro item
                        }
                    } else {
                        nextPlaylist(); // Single video ended, spill over
                    }
                }
            }
        }`;
code = code.replace(oldYtListener, newYtListener);
if (!code.includes('window.ytPlaylistIndex = -1;')) {
    code = code.replace("let isYtPlaying = false;", "let isYtPlaying = false;\n  window.ytPlaylistIndex = -1;\n  window.ytPlaylistLength = 0;");
}


// 2. Replace the Queue logic
const queueRegex = /function getUnifiedQueue\(\) \{[\s\S]*?function playAllSaved\(\) \{[\s\S]*?showToast\("Playing selected media in sequence\.\.\."\);\n  \}/;

const newQueueLogic = `function getMacroQueue() {
    let q = [];
    if (mediaFiles && mediaFiles.length > 0) {
      q.push({ type: 'local', items: mediaFiles });
    }
    savedPlaylists.forEach((list, idx) => {
      if (list.autoplay !== false) {
        q.push({ type: 'web', index: idx, url: list.url, name: list.name });
      }
    });
    return q;
  }

  function playMacroItem(mIndex, q, direction = 1) {
    if (!q) q = getMacroQueue();
    if (q.length === 0) return;
    if (mIndex >= q.length) mIndex = 0;
    if (mIndex < 0) mIndex = q.length - 1;

    let item = q[mIndex];
    if (item.type === 'local') {
      let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
      playLocalMedia(trackIdx);
    } else {
      currentPlaylistIndex = item.index;
      document.getElementById('m-url').value = item.url;
      loadMedia();
      renderPlaylists();
      renderPlaylist();
    }
  }

  function getCurrentMacroIndex(q) {
    if (!q) q = getMacroQueue();
    if (localPlayer && localPlayer.style.display !== 'none') {
      let idx = q.findIndex(i => i.type === 'local');
      return idx !== -1 ? idx : 0;
    } else {
      let idx = q.findIndex(i => i.type === 'web' && i.index === currentPlaylistIndex);
      return idx !== -1 ? idx : 0;
    }
  }

  function playAllSaved() {
    let q = getMacroQueue();
    if (q.length === 0) {
      showToast("No items selected for playback.");
      return;
    }
    closeSavedMediaPopup();
    playMacroItem(0, q, 1);
    showToast("Playing media lists in sequence...");
  }`;

code = code.replace(queueRegex, newQueueLogic);


// 3. Replace the sequence keys logic
const sequenceRegex = /function autoNextMedia\(\) \{[\s\S]*?renderPlaylists\(\);\n    renderPlaylist\(\);\n  \}/;

const newSequenceLogic = `function autoNextMedia() { nextTrack(); }
  function autoPrevMedia() { prevTrack(); }

  function nextPlaylist() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    playMacroItem(getCurrentMacroIndex(q) + 1, q, 1);
  }

  function prevPlaylist() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    playMacroItem(getCurrentMacroIndex(q) - 1, q, -1);
  }

  function nextTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex >= mediaFiles.length - 1) {
        nextPlaylist();
      } else {
        playLocalMedia(currentMediaIndex + 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (window.ytPlaylistLength > 1) {
          if (window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
            nextPlaylist();
          } else {
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
          }
        } else {
          nextPlaylist();
        }
      } else {
        nextPlaylist();
      }
    }
  }

  function prevTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex <= 0) {
        prevPlaylist();
      } else {
        playLocalMedia(currentMediaIndex - 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (window.ytPlaylistLength > 1) {
          if (window.ytPlaylistIndex <= 0) {
            prevPlaylist();
          } else {
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');
          }
        } else {
          prevPlaylist();
        }
      } else {
        prevPlaylist();
      }
    }
  }`;

code = code.replace(sequenceRegex, newSequenceLogic);

// Ensure localPlayer auto play advances correctly
code = code.replace('localPlayer.onended = autoNextMedia;', 'localPlayer.onended = nextTrack;');


fs.writeFileSync('index.html', code);
