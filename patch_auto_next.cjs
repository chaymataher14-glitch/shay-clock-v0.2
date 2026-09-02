const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Add autoNextMedia and autoPrevMedia
const autoFuncs = `
  function autoNextMedia() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      nextTrack();
    } else if (savedPlaylists.length > 0) {
      nextPlaylist();
    }
  }

  function autoPrevMedia() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      prevTrack();
    } else if (savedPlaylists.length > 0) {
      prevPlaylist();
    }
  }

  function nextTrack() {
`;
code = code.replace("  function nextTrack() {", autoFuncs);

// 2. Change keyboard shortcuts
code = code.replace(
  `} else if (e.key === 'j' || e.key === 'J') {
      prevTrack();
    } else if (e.key === 'k' || e.key === 'K') {
      nextTrack();
    }`,
  `} else if (e.key === 'j' || e.key === 'J') {
      autoNextMedia();
    } else if (e.key === 'k' || e.key === 'K') {
      autoPrevMedia();
    }`
);

// 3. Change YT ended event
const oldYtEvent = `        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
            isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
        }`;

const newYtEvent = `        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
            isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
            if (data.info.playerState === 0) {
                // Video ended
                autoNextMedia();
            }
        }`;
code = code.replace(oldYtEvent, newYtEvent);

// 4. Update localPlayer.onended
code = code.replace(
  "localPlayer.onended = nextTrack;",
  "localPlayer.onended = autoNextMedia;"
);

fs.writeFileSync('index.html', code);
