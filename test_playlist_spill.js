const dom = {};
let currentMediaIndex = 0;
let mediaFiles = [];
let savedPlaylists = [
  {url: 'https://youtube.com/watch?v=A&list=LIST1', name: 'Web1'},
  {url: 'https://youtube.com/watch?v=B&list=LIST2', name: 'Web2'}
];
let currentPlaylistIndex = 0;
let localPlayer = { style: { display: 'none' }, pause: () => {} };
let iframe = { style: { display: 'block' }, src: '' };

function getMacroQueue() {
  let q = [];
  if (mediaFiles && mediaFiles.length > 0) {
    q.push({ type: 'local', items: mediaFiles });
  }
  savedPlaylists.forEach((list, idx) => {
    if (list.autoplay !== false) {
      q.push({ type: 'web', index: idx, url: list.url, name: list.name });
    }
  });
  return q;
}

function getCurrentMacroIndex(q) {
  if (!q) q = getMacroQueue();
  if (localPlayer && localPlayer.style.display !== 'none') {
    let idx = q.findIndex(i => i.type === 'local');
    return idx !== -1 ? idx : 0;
  } else {
    let idx = q.findIndex(i => i.type === 'web' && i.index === currentPlaylistIndex);
    return idx !== -1 ? idx : 0;
  }
}

function playMacroItem(mIndex, q, direction = 1) {
  if (!q) q = getMacroQueue();
  if (q.length === 0) return;
  if (mIndex >= q.length) mIndex = 0;
  if (mIndex < 0) mIndex = q.length - 1;

  let item = q[mIndex];
  console.log("playMacroItem called with index", mIndex, "item:", item.url);
  if (item.type === 'local') {
    // ...
  } else {
    currentPlaylistIndex = item.index;
    console.log("Switched to playlist:", currentPlaylistIndex);
  }
}

function nextPlaylist() {
  console.log("nextPlaylist called!");
  let q = getMacroQueue();
  if (q.length === 0) return;
  playMacroItem(getCurrentMacroIndex(q) + 1, q, 1);
}

// Simulate timeout condition
console.log("Simulating edge case timeout...");
let window = { ytPlaylistIndex: 5, ytPlaylistLength: 6 };
let oldIndex = window.ytPlaylistIndex;
// send nextVideo
// simulate wrap around to 0
window.ytPlaylistIndex = 0;
if (window.ytPlaylistIndex === oldIndex || window.ytPlaylistIndex < oldIndex) {
  nextPlaylist();
}
