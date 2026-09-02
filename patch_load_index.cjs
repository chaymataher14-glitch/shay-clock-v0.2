const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldLoad = `    if (!savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    }`;

const newLoad = `    let existingIndex = savedPlaylists.findIndex(p => p.url === url);
    if (existingIndex === -1) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    } else {
      currentPlaylistIndex = existingIndex;
    }`;

if(code.includes(oldLoad)) {
    code = code.replace(oldLoad, newLoad);
    fs.writeFileSync('index.html', code);
    console.log("Patched loadMedia");
} else {
    console.log("Could not find oldLoad");
}
