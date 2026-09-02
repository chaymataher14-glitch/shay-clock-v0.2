const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Update loadMedia to include enablejsapi=1
code = code.replace(
  "iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;",
  "iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;"
);

// 2. Add message listener and variables for YT iframe
code = code.replace(
  "  let currentPlaylistIndex = 0;",
  `  let currentPlaylistIndex = 0;
  let isYtPlaying = false;
  let isYtMuted = false;
  
  window.addEventListener('message', (event) => {
    if (event.origin !== 'https://www.youtube.com') return;
    try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
            isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
        }
        if (data.event === 'initialDelivery') {
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
        }
    } catch (e) {}
  });
`
);

// 3. Update togglePlayMedia to handle YT iframe
code = code.replace(
  /function togglePlayMedia\(\) \{[\s\S]*?if \(localPlayer && localPlayer\.style\.display !== 'none'\) \{[\s\S]*?if \(localPlayer\.paused\) localPlayer\.play\(\);[\s\S]*?else localPlayer\.pause\(\);[\s\S]*?\}[\s\S]*?\}/,
  `function togglePlayMedia() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      if (localPlayer.paused) localPlayer.play();
      else localPlayer.pause();
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        isYtPlaying = !isYtPlaying;
        const cmd = isYtPlaying ? 'playVideo' : 'pauseVideo';
        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: cmd, args: []}), '*');
      }
    }
  }`
);

// 4. Update toggleMuteMedia to handle YT iframe
code = code.replace(
  /function toggleMuteMedia\(\) \{[\s\S]*?if \(localPlayer\) \{[\s\S]*?localPlayer\.muted = !localPlayer\.muted;[\s\S]*?\}[\s\S]*?\}/,
  `function toggleMuteMedia() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      localPlayer.muted = !localPlayer.muted;
    } else {
      const iframe = document.getElementById('player');
      if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
        isYtMuted = !isYtMuted;
        const cmd = isYtMuted ? 'mute' : 'unMute';
        iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: cmd, args: []}), '*');
      }
    }
  }`
);

// 5. Update renderPlaylist to include saved playlists
code = code.replace(
  /function renderPlaylist\(\) \{[\s\S]*?const container = document\.getElementById\('playlist-container'\);[\s\S]*?container\.innerHTML = '';[\s\S]*?mediaFiles\.forEach\(\(file, index\) => \{[\s\S]*?const btn = document\.createElement\('button'\);[\s\S]*?btn\.className = `btn btn-ghost \$\{index === currentMediaIndex \? 'active' : ''\}`;[\s\S]*?btn\.style\.cssText = "padding: 4px 8px; font-size: 0\.75rem; white-space: nowrap; max-width: 150px; overflow: hidden; text-overflow: ellipsis;";[\s\S]*?if \(index === currentMediaIndex\) btn\.style\.background = 'var\(--accent\)';[\s\S]*?btn\.innerText = file\.name;[\s\S]*?btn\.onclick = \(\) => playLocalMedia\(index\);[\s\S]*?container\.appendChild\(btn\);[\s\S]*?\}\);[\s\S]*?\}/,
  `function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    container.innerHTML = '';
    
    savedPlaylists.forEach((item, index) => {
      const btn = document.createElement('button');
      const isActive = (document.getElementById('m-url').value === item.url || index === currentPlaylistIndex);
      btn.className = 'btn btn-ghost ' + (isActive ? 'active' : '');
      btn.style.cssText = "padding: 6px 12px; font-size: 0.8rem; white-space: nowrap; max-width: 160px; overflow: hidden; text-overflow: ellipsis; border-radius: 8px; font-weight: 700;";
      if (isActive) {
         btn.style.background = 'var(--accent)';
         btn.style.color = 'var(--accent-text)';
      }
      btn.innerText = item.name || \`Link \${index+1}\`;
      btn.onclick = () => {
         currentPlaylistIndex = index;
         document.getElementById('m-url').value = item.url;
         loadMedia();
         renderPlaylist();
      };
      container.appendChild(btn);
    });

    mediaFiles.forEach((file, index) => {
      const btn = document.createElement('button');
      btn.className = \`btn btn-ghost \${index === currentMediaIndex ? 'active' : ''}\`;
      btn.style.cssText = "padding: 6px 12px; font-size: 0.8rem; white-space: nowrap; max-width: 160px; overflow: hidden; text-overflow: ellipsis; border-radius: 8px;";
      if (index === currentMediaIndex) {
         btn.style.background = 'var(--accent)';
         btn.style.color = 'var(--accent-text)';
      }
      btn.innerText = "📁 " + file.name;
      btn.onclick = () => playLocalMedia(index);
      container.appendChild(btn);
    });
  }`
);

// Add renderPlaylist calls to next/prev Playlist so the UI updates
code = code.replace(
  "loadMedia();\n    renderPlaylists();",
  "loadMedia();\n    renderPlaylists();\n    renderPlaylist();"
);

code = code.replace(
  "document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;\n    loadMedia();\n    renderPlaylists();",
  "document.getElementById('m-url').value = savedPlaylists[currentPlaylistIndex].url;\n    loadMedia();\n    renderPlaylists();\n    renderPlaylist();"
);

fs.writeFileSync('index.html', code);
