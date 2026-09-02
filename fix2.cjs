const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const replacement = `  function nextTrack() {
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

let match = code.match(/function nextTrack\(\) \{[\s\S]*?(?=function loadMedia\(\)|function addFiles|function togglePlay|function formatTime|<\/script>)/m);
if (match) {
   let idx = code.indexOf(match[0]);
   code = code.substring(0, idx) + replacement + "\n\n  " + code.substring(idx + match[0].length);
   fs.writeFileSync('index.html', code);
   console.log("Patched correctly");
} else {
   console.log("Could not find match");
}
