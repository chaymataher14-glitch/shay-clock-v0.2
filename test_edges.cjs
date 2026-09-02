const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const debugNextTrack = `  function nextTrack() {
    console.log("nextTrack called. localPlayer:", !!localPlayer, "display:", localPlayer ? localPlayer.style.display : 'none');
    console.log("currentMediaIndex:", currentMediaIndex, "mediaFiles.length:", mediaFiles.length);
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex >= mediaFiles.length - 1) {
        console.log("Local spill over -> nextPlaylist");
        nextPlaylist();
      } else {
        console.log("Local next track");
        playLocalMedia(currentMediaIndex + 1);
      }
    } else {
      const iframe = document.getElementById('player');
      console.log("iframe src:", iframe ? iframe.src : null);
      console.log("ytPlaylistLength:", window.ytPlaylistLength, "ytPlaylistIndex:", window.ytPlaylistIndex);
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        if (iframe.src.includes('list=') || window.ytPlaylistLength > 1) {
          if (window.ytPlaylistLength > 1 && window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
             console.log("YT spill over -> nextPlaylist");
            nextPlaylist();
          } else {
             console.log("YT nextVideo command");
            iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
          }
        } else {
          console.log("YT single video -> nextPlaylist");
          nextPlaylist();
        }
      } else {
        console.log("Non-YT iframe -> nextPlaylist");
        nextPlaylist();
      }
    }
  }`;

code = code.replace(/function nextTrack\(\) \{[\s\S]*?(?=function prevTrack\(\))/m, debugNextTrack + "\n\n  ");

fs.writeFileSync('index.html', code);
