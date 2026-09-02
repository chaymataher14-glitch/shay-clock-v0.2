const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldAutoFuncs = `  function autoNextMedia() {
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
  }`;

const newAutoFuncs = `  function autoNextMedia() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex >= mediaFiles.length - 1 && savedPlaylists.length > 0) {
         currentPlaylistIndex = 0;
         document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;
         loadMedia();
         renderPlaylists();
         renderPlaylist();
      } else {
         nextTrack();
      }
    } else if (savedPlaylists.length > 0) {
      if (currentPlaylistIndex >= savedPlaylists.length - 1 && mediaFiles.length > 0) {
         playLocalMedia(0);
      } else {
         nextPlaylist();
      }
    } else if (mediaFiles.length > 0) {
       playLocalMedia(0);
    }
  }

  function autoPrevMedia() {
    if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
      if (currentMediaIndex <= 0 && savedPlaylists.length > 0) {
         currentPlaylistIndex = savedPlaylists.length - 1;
         document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;
         loadMedia();
         renderPlaylists();
         renderPlaylist();
      } else {
         prevTrack();
      }
    } else if (savedPlaylists.length > 0) {
      if (currentPlaylistIndex <= 0 && mediaFiles.length > 0) {
         playLocalMedia(mediaFiles.length - 1);
      } else {
         prevPlaylist();
      }
    } else if (mediaFiles.length > 0) {
       playLocalMedia(mediaFiles.length - 1);
    }
  }`;

code = code.replace(oldAutoFuncs, newAutoFuncs);

// We need to also check if we didn't miss something. I'll replace it carefully.
if (code.includes('function autoNextMedia() {')) {
  code = code.substring(0, code.indexOf('  function autoNextMedia() {')) + newAutoFuncs + code.substring(code.indexOf('  function nextTrack() {'));
}

fs.writeFileSync('index.html', code);
