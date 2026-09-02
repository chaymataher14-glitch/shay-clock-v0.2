const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldLoadMedia = `    if (!savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    }
    // Always render playlist so active state updates
    renderPlaylist();

    const iframe = document.getElementById('player');
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      if (videoId) {
        iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      }
    } else {
      iframe.src = url;
      if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
      iframe.style.display = 'block';
    }`;

const newLoadMedia = `    if (!savedPlaylists.some(p => p.url === url)) {
      let title = "Saved Link";
      if (url.includes('youtube.com') || url.includes('youtu.be')) title = "YouTube";
      else if (url.includes('spotify.com')) title = "Spotify";
      else if (url.includes('soundcloud.com')) title = "SoundCloud";
      else if (url.includes('music.apple.com')) title = "Apple Music";
      savedPlaylists.push({ url, name: title });
      currentPlaylistIndex = savedPlaylists.length - 1;
      saveSettings();
      renderPlaylists();
    }
    // Always render playlist so active state updates
    renderPlaylist();

    const iframe = document.getElementById('player');
    if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
    iframe.style.display = 'block';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      if (videoId) {
        iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
      }
    } else {
      let finalUrl = url;
      if (url.includes('spotify.com') && !url.includes('/embed/')) {
         finalUrl = url.replace('spotify.com/', 'spotify.com/embed/');
      } else if (url.includes('soundcloud.com') && !url.includes('api.soundcloud.com')) {
         finalUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url) + '&auto_play=true';
      } else if (url.includes('music.apple.com') && !url.includes('embed.music.apple.com')) {
         finalUrl = url.replace('music.apple.com', 'embed.music.apple.com');
      }
      iframe.src = finalUrl;
    }`;

code = code.replace(oldLoadMedia, newLoadMedia);
fs.writeFileSync('index.html', code);
