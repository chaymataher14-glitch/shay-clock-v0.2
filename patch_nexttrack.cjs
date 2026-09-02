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

if(code.includes(oldNext)) {
    code = code.replace(oldNext, newNext);
}

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
          if (window.ytPlaylistLength > 1 && window.ytPlaylistIndex <= 0) {
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

if(code.includes(oldPrev)) {
    code = code.replace(oldPrev, newPrev);
}

fs.writeFileSync('index.html', code);
