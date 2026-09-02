const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// We will replace the entire set of navigation functions.

const newNav = `
  // --- UNIFIED NAVIGATION SYSTEM ---
  function goToNextMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let next = curr + 1;
    if (next >= q.length) return; // Rule 5: boundary limit
    playMacroItem(next, q, 1);
  }

  function goToPreviousMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let prev = curr - 1;
    if (prev < 0) return; // Rule 5: boundary limit
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
       const iframe = document.getElementById('player');
       if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
           let ytLen = window.ytPlaylistLength || 1;
           let ytIdx = window.ytPlaylistIndex || 0;
           if (ytLen > 1 && ytIdx < ytLen - 1) {
               iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');
           } else {
               goToNextMedia();
           }
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
       const iframe = document.getElementById('player');
       if (iframe && (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be'))) {
           let ytIdx = window.ytPlaylistIndex || 0;
           if (ytIdx > 0) {
               iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');
           } else {
               goToPreviousMedia();
           }
       } else {
           goToPreviousMedia();
       }
    }
  }

  // ALIASES for UI buttons (which were calling nextTrack, nextPlaylist etc)
  function nextPlaylist() { goToNextMedia(); }
  function prevPlaylist() { goToPreviousMedia(); }
  function nextTrack() { goToNextItem(); }
  function prevTrack() { goToPreviousItem(); }
`;

// Now we need to remove the old nextPlaylist, prevPlaylist, nextTrack, prevTrack
// First, find the start of nextPlaylist
let startStr = "function nextPlaylist() {";
let pStart = code.indexOf(startStr);
if (pStart === -1) {
  // Maybe it's function nextPlaylist
  console.log("Could not find nextPlaylist");
  process.exit(1);
}

// Find the end of prevTrack or the next function
let endRegex = /function playLocalMedia/m;
let match = code.match(endRegex);
if (!match) {
  console.log("Could not find playLocalMedia");
  process.exit(1);
}

let newCode = code.substring(0, pStart) + newNav + "\n  " + code.substring(match.index);

// Let's also patch the keydown listener to strictly use N, P, K, J without any weird duplication
newCode = newCode.replace(/} else if \(e\.key === 'p' \|\| e\.key === 'P'\) \{[\s\S]*?\} else if \(e\.key === 'k' \|\| e\.key === 'K'\) \{[\s\S]*?nextTrack\(\);\n    \}/, 
`} else if (e.key === 'p' || e.key === 'P') {
      goToPreviousMedia();
    } else if (e.key === 'n' || e.key === 'N') {
      goToNextMedia();
    } else if (e.key === 'j' || e.key === 'J') {
      goToPreviousItem();
    } else if (e.key === 'k' || e.key === 'K') {
      goToNextItem();
    }`);

fs.writeFileSync('index.html', newCode);
console.log("Patched successfully");
