const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldPlayMacro = `  function playMacroItem(mIndex, q, direction = 1) {
    if (!q) q = getMacroQueue();
    if (q.length === 0) return;
    if (mIndex >= q.length) mIndex = 0;
    if (mIndex < 0) mIndex = q.length - 1;

    let item = q[mIndex];
    if (item.type === 'local') {
      let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
      playLocalMedia(trackIdx);
    } else {
      currentPlaylistIndex = item.index;
      document.getElementById('m-url').value = item.url;
      loadMedia();
      renderPlaylists();
      renderPlaylist();
    }
  }`;

const newPlayMacro = `  function playMacroItem(mIndex, q, direction = 1) {
    if (!q) q = getMacroQueue();
    if (q.length === 0) return;
    if (mIndex >= q.length) mIndex = 0;
    if (mIndex < 0) mIndex = q.length - 1;

    let item = q[mIndex];
    let currentIdx = getCurrentMacroIndex(q);
    
    // If the queue only has 1 item, or we wrapped around to the same item
    if (mIndex === currentIdx) {
      if (item.type === 'local') {
        let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
        playLocalMedia(trackIdx);
      } else {
        const iframe = document.getElementById('player');
        if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
          if (window.ytPlaylistLength > 1) {
             let targetIdx = (direction === -1) ? window.ytPlaylistLength - 1 : 0;
             iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideoAt', args: [targetIdx]}), '*');
          } else {
             let oldSrc = iframe.src;
             iframe.src = '';
             setTimeout(() => { iframe.src = oldSrc; }, 50);
          }
        }
      }
      return;
    }

    if (item.type === 'local') {
      let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
      playLocalMedia(trackIdx);
    } else {
      currentPlaylistIndex = item.index;
      document.getElementById('m-url').value = item.url;
      
      // Tell loadMedia we want to play the last track if going backwards
      if (direction === -1) {
          window.playLastYtTrackOnLoad = true;
      }
      
      loadMedia();
      renderPlaylists();
      renderPlaylist();
    }
  }`;

if (code.includes(oldPlayMacro)) {
   code = code.replace(oldPlayMacro, newPlayMacro);
   fs.writeFileSync('index.html', code);
   console.log("Patched playMacroItem");
} else {
   console.log("Could not find oldPlayMacro");
}
