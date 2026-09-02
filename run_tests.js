let mediaFiles = [];
let savedPlaylists = [];
let localPlayer = null;
let currentPlaylistIndex = 0;
let currentMediaIndex = 0; // Local index

let window = { ytPlaylistLength: 0, ytPlaylistIndex: 0, playLastYtTrackOnLoad: false };
let iframe = {
    src: 'youtube.com',
    contentWindow: {
        postMessage: (data, origin) => {
            let msg = JSON.parse(data);
            if (msg.func === 'nextVideo') {
                window.ytPlaylistIndex++;
            } else if (msg.func === 'previousVideo') {
                window.ytPlaylistIndex--;
            } else if (msg.func === 'playVideoAt') {
                window.ytPlaylistIndex = msg.args[0];
            }
        }
    }
};

let document = {
    getElementById: (id) => {
        if (id === 'player') return iframe;
        if (id === 'm-url') return { value: '' };
        return { value: '' };
    }
};

function getMacroQueue() {
    let q = [];
    if (mediaFiles && mediaFiles.length > 0) {
        q.push({ type: 'local', items: mediaFiles });
    }
    savedPlaylists.forEach((list, idx) => {
        q.push({ type: 'web', index: idx, url: list.url, name: list.name, length: list.length });
    });
    return q;
}

function getCurrentMacroIndex(q) {
    if (!q) q = getMacroQueue();
    if (localPlayer) {
        let idx = q.findIndex(i => i.type === 'local');
        return idx !== -1 ? idx : 0;
    } else {
        let idx = q.findIndex(i => i.type === 'web' && i.index === currentPlaylistIndex);
        return idx !== -1 ? idx : 0;
    }
}

function playLocalMedia(index) {
    currentMediaIndex = index;
    localPlayer = true; // active
}

function loadMedia() {
    // mock loading a playlist
    localPlayer = null; // deactivate local
    let q = getMacroQueue();
    let idx = getCurrentMacroIndex(q);
    let item = q[idx];
    
    // Simulate YouTube iframe state
    window.ytPlaylistLength = item.length;
    if (window.playLastYtTrackOnLoad) {
        window.playLastYtTrackOnLoad = false;
        window.ytPlaylistIndex = item.length - 1;
    } else {
        window.ytPlaylistIndex = 0;
    }
}

function playMacroItem(mIndex, q, direction = 1) {
    if (!q) q = getMacroQueue();
    if (q.length === 0) return;
    
    // Bounds clamping, do NOT wrap around.
    if (mIndex >= q.length) return;
    if (mIndex < 0) return;

    let item = q[mIndex];
    let currentIdx = getCurrentMacroIndex(q);
    
    // Check if we are already playing this exact macro piece
    if (mIndex === currentIdx) {
      if (item.type === 'local') {
        let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
        playLocalMedia(trackIdx);
      } else {
          if (window.ytPlaylistLength > 1) {
             let targetIdx = (direction === -1) ? window.ytPlaylistLength - 1 : 0;
             iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'playVideoAt', args: [targetIdx]}), '*');
          }
      }
      return;
    }

    if (item.type === 'local') {
      let trackIdx = (direction === -1) ? mediaFiles.length - 1 : 0;
      playLocalMedia(trackIdx);
    } else {
      currentPlaylistIndex = item.index;
      
      if (direction === -1) {
          window.playLastYtTrackOnLoad = true;
      } else {
          window.playLastYtTrackOnLoad = false;
      }
      
      loadMedia();
    }
}

function goToNextMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let next = curr + 1;
    if (next >= q.length) return; // Rule 5
    playMacroItem(next, q, 1);
}

function goToPreviousMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let prev = curr - 1;
    if (prev < 0) return; // Rule 5
    playMacroItem(prev, q, -1);
}

function goToNextItem() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let item = q[curr];

    if (item.type === 'local') {
       if (currentMediaIndex < item.items.length - 1) {
           playLocalMedia(currentMediaIndex + 1);
       } else {
           goToNextMedia();
       }
    } else {
       if (window.ytPlaylistLength > 1 && window.ytPlaylistIndex < window.ytPlaylistLength - 1) {
           iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
       } else {
           goToNextMedia();
       }
    }
}

function goToPreviousItem() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let item = q[curr];

    if (item.type === 'local') {
       if (currentMediaIndex > 0) {
           playLocalMedia(currentMediaIndex - 1);
       } else {
           goToPreviousMedia();
       }
    } else {
       if (window.ytPlaylistIndex > 0) {
           iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');
       } else {
           goToPreviousMedia();
       }
    }
}

function reportState() {
    let q = getMacroQueue();
    let idx = getCurrentMacroIndex(q);
    let mediaName = q[idx].type === 'local' ? 'Media A' : q[idx].name;
    let itemIdx = q[idx].type === 'local' ? currentMediaIndex : window.ytPlaylistIndex;
    return `${mediaName}${itemIdx + 1}`;
}

// SETUP TEST ENVIRONMENT
mediaFiles = [1, 2, 3]; // Media A
savedPlaylists = [
    { url: 'x', name: 'Media B', length: 2 },
    { url: 'y', name: 'Media C', length: 4 }
];

console.log("=== Test 1: Micro forward ===");
playLocalMedia(0); // A1
console.log("Start:", reportState());
goToNextItem(); console.log("K ->", reportState());
goToNextItem(); console.log("K ->", reportState());
goToNextItem(); console.log("K ->", reportState());

console.log("\n=== Test 2: Micro backward ===");
playMacroItem(1, getMacroQueue(), 1); // B1
console.log("Start:", reportState());
goToPreviousItem(); console.log("J ->", reportState());
goToPreviousItem(); console.log("J ->", reportState());
goToPreviousItem(); console.log("J ->", reportState());

console.log("\n=== Test 3: Macro forward ===");
playLocalMedia(1); // A2
console.log("Start:", reportState());
goToNextMedia(); console.log("N ->", reportState());

console.log("\n=== Test 4: Macro backward ===");
playMacroItem(1, getMacroQueue(), 1);
window.ytPlaylistIndex = 1; // B2
console.log("Start:", reportState());
goToPreviousMedia(); console.log("P ->", reportState());

console.log("\n=== Test 5: Different media lengths ===");
mediaFiles = [1]; // A = 1
savedPlaylists = [
    { url: 'x', name: 'Media B', length: 7 },
    { url: 'y', name: 'Media C', length: 2 }
];
playLocalMedia(0); // A1
console.log("Start:", reportState());
goToNextItem(); console.log("K ->", reportState());
window.ytPlaylistIndex = 6; // B7
console.log("Jump to:", reportState());
goToNextItem(); console.log("K ->", reportState());
goToPreviousItem(); console.log("J ->", reportState());
window.ytPlaylistIndex = 0; // B1
console.log("Jump to:", reportState());
goToPreviousItem(); console.log("J ->", reportState());

console.log("\n=== Test 6: First/last global boundaries ===");
playLocalMedia(0); // A1
console.log("Start:", reportState());
goToPreviousItem(); console.log("J ->", reportState()); // Should not wrap or crash

playMacroItem(2, getMacroQueue(), 1); 
window.ytPlaylistIndex = 1; // C2
console.log("Start:", reportState());
goToNextItem(); console.log("K ->", reportState()); // Should not wrap or crash
