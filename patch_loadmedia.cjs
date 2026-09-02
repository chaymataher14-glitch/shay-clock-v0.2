const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  `    if (!savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
      renderPlaylist();
    }`,
  `    if (!savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    }
    // Always render playlist so active state updates
    renderPlaylist();`
);

fs.writeFileSync('index.html', code);
