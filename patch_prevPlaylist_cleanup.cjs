const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const strToRemove = `  function prevPlaylist() {
    if (savedPlaylists.length === 0) return;
    currentPlaylistIndex = (currentPlaylistIndex - 1 + savedPlaylists.length) % savedPlaylists.length;
    document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;
    loadMedia();
    renderPlaylists();
    renderPlaylist();
  }`;

code = code.replace(strToRemove, '');
fs.writeFileSync('index.html', code);
