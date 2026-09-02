const q = [
  { type: 'local', items: [1, 2, 3] },
  { type: 'web', index: 0, url: 'url1' },
  { type: 'web', index: 1, url: 'url2' }
];

let localPlayer = { style: { display: 'none' } };
let currentPlaylistIndex = 0;

function getCurrentMacroIndex() {
    if (localPlayer && localPlayer.style.display !== 'none') {
      let idx = q.findIndex(i => i.type === 'local');
      return idx !== -1 ? idx : 0;
    } else {
      let idx = q.findIndex(i => i.type === 'web' && i.index === currentPlaylistIndex);
      return idx !== -1 ? idx : 0;
    }
}

console.log(getCurrentMacroIndex()); // should be 1
