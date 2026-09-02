const dom = {};
let currentMediaIndex = 0;
let mediaFiles = [{name: 'a', url: 'a'}, {name: 'b', url: 'b'}];
let savedPlaylists = [{url: 'web1', name: 'web1'}];
let currentPlaylistIndex = 0;
let localPlayer = { style: { display: 'block' }, pause: () => {} };
let iframe = { style: { display: 'none' }, src: '' };

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

function playLocalMedia(index) {
    console.log("playLocalMedia called with index:", index);
    currentMediaIndex = index;
    localPlayer.style.display = 'block';
    iframe.style.display = 'none';
}

function loadMedia() {
    console.log("loadMedia called");
    iframe.style.display = 'block';
    localPlayer.style.display = 'none';
}

function playMacroItem(mIndex, q, direction = 1) {
  if (!q) q = getMacroQueue();
  if (q.length === 0) return;
  if (mIndex >= q.length) mIndex = 0;
  if (mIndex < 0) mIndex = q.length - 1;

  let item = q[mIndex];
  console.log("playMacroItem playing macro index", mIndex, "item type", item.type);
  if (item.type === 'local') {
    let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
    playLocalMedia(trackIdx);
  } else {
    currentPlaylistIndex = item.index;
    loadMedia();
  }
}

function nextPlaylist() {
  let q = getMacroQueue();
  if (q.length === 0) return;
  playMacroItem(getCurrentMacroIndex(q) + 1, q, 1);
}

function prevPlaylist() {
  let q = getMacroQueue();
  if (q.length === 0) return;
  playMacroItem(getCurrentMacroIndex(q) - 1, q, -1);
}

function nextTrack() {
  if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
    if (currentMediaIndex >= mediaFiles.length - 1) {
      nextPlaylist();
    } else {
      playLocalMedia(currentMediaIndex + 1);
    }
  } else {
    nextPlaylist();
  }
}

function prevTrack() {
  if (localPlayer && localPlayer.style.display !== 'none' && mediaFiles.length > 0) {
    if (currentMediaIndex <= 0) {
      prevPlaylist();
    } else {
      playLocalMedia(currentMediaIndex - 1);
    }
  } else {
    prevPlaylist();
  }
}

console.log("--- Initial State: Playing local file 0 ---");
console.log("Press K (nextTrack)");
nextTrack(); // should play local 1
console.log("Press K (nextTrack)");
nextTrack(); // should spill over to Web1
console.log("Press J (prevTrack) from Web1");
prevTrack(); // should spill over to Local 1 (last local)
console.log("Press J (prevTrack)");
prevTrack(); // should play local 0
console.log("Press J (prevTrack)");
prevTrack(); // should spill over to Web1
