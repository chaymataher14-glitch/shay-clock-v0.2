const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldNextTrack = `  function nextTrack() {
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

const newNextTrack = `  function nextTrack() {
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
            // Edge detection fallback: if YouTube ignores nextVideo because it's at the end
            setTimeout(() => {
               if (window.ytPlaylistIndex === oldIndex) nextPlaylist();
            }, 400);
          }
        } else {
          nextPlaylist();
        }
      } else {
        nextPlaylist();
      }
    }
  }`;

const oldPrevTrack = `  function prevTrack() {
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

const newPrevTrack = `  function prevTrack() {
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
            // Edge detection fallback
            setTimeout(() => {
               if (window.ytPlaylistIndex === oldIndex) prevPlaylist();
            }, 400);
          }
        } else {
          prevPlaylist();
        }
      } else {
        prevPlaylist();
      }
    }
  }`;

if(code.includes(oldNextTrack)) {
    code = code.replace(oldNextTrack, newNextTrack);
}
if(code.includes(oldPrevTrack)) {
    code = code.replace(oldPrevTrack, newPrevTrack);
}
fs.writeFileSync('index.html', code);
