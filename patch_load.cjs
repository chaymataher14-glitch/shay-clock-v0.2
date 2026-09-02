const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /function loadMedia\(\) \{([\s\S]*?)const url = document\.getElementById\('m-url'\)\.value;([\s\S]*?)if \(\!url\) return;/,
  `function loadMedia() {
$1const url = document.getElementById('m-url').value.trim();
$2if (!url) return;

    if (!savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
      renderPlaylist();
    }
`
);

fs.writeFileSync('index.html', code);
