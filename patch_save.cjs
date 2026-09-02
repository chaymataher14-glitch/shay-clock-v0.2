const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  '<button class="btn" onclick="loadMedia()" style="padding: 4px 12px; font-weight: bold;">Load Link</button>',
  '<button class="btn" onclick="loadMedia()" style="padding: 4px 12px; font-weight: bold;">Load Link</button>\n            <button class="btn" onclick="saveMainUrl()" style="padding: 4px 12px; font-weight: bold; background: var(--card); color: var(--text); border: 2px solid var(--accent);">Save Link</button>'
);

code = code.replace(
  'function openSavedMediaPopup() {',
  `function saveMainUrl() {
    let url = document.getElementById('m-url').value.trim();
    if (url && !savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
      renderPlaylist();
      showToast('URL saved to your Web Playlist!');
    } else if (url) {
      showToast('URL is already saved!');
    } else {
      showToast('Please enter a URL first');
    }
  }

  function openSavedMediaPopup() {`
);

// Fix addCurrentUrlToPlaylist to use .trim()
code = code.replace(
  "let url = document.getElementById('new-saved-url') ? document.getElementById('new-saved-url').value : document.getElementById('m-url').value;",
  "let urlInput = document.getElementById('new-saved-url');\n    let url = (urlInput && urlInput.value.trim()) ? urlInput.value.trim() : document.getElementById('m-url').value.trim();"
);

fs.writeFileSync('index.html', code);
