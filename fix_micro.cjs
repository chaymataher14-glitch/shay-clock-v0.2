const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldNext = `  function nextTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex >= mediaFiles.length - 1) {
        nextPlaylist();
      } else {
        playLocalMedia(currentMediaIndex + 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistLength > 1 && window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
            nextPlaylist();
          } else {
            let oldIndex = window.ytPlaylistIndex;
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
            setTimeout(() => {
               if (window.ytPlaylistIndex === oldIndex || window.ytPlaylistIndex < oldIndex) {
                 nextPlaylist();
               }
            }, 600);
          }
        } else {
          nextPlaylist();
        }
      } else {
        nextPlaylist();
      }
    }
  }`;

const newNext = `  function nextTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex >= mediaFiles.length - 1) {
        nextPlaylist();
      } else {
        playLocalMedia(currentMediaIndex + 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistLength > 1 && window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
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
  }`;

const oldPrev = `  function prevTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex <= 0) {
        prevPlaylist();
      } else {
        playLocalMedia(currentMediaIndex - 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistIndex === 0) {
            prevPlaylist();
          } else {
            let oldIndex = window.ytPlaylistIndex;
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');
            setTimeout(() => {
               if (window.ytPlaylistIndex === oldIndex || window.ytPlaylistIndex > oldIndex) {
                 prevPlaylist();
               }
            }, 600);
          }
        } else {
          prevPlaylist();
        }
      } else {
        prevPlaylist();
      }
    }
  }`;

const newPrev = `  function prevTrack() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex <= 0) {
        prevPlaylist();
      } else {
        playLocalMedia(currentMediaIndex - 1);
      }
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistIndex === 0) {
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

code = code.replace(oldNext, newNext).replace(oldPrev, newPrev);
fs.writeFileSync('index.html', code);
console.log("Removed setTimeout hacks.");
