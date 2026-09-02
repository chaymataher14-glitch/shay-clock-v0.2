const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const replacement = `
  // --- UNIFIED NAVIGATION SYSTEM ---
  function goToNextMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let next = curr + 1;
    if (next >= q.length) next = 0; // Wrap around macro optionally? User said: "Remain at final valid position. Do NOT wrap around unless supported." Wait, test 6 says "C2 --K--> C2". So NO WRAP AROUND.
    // Actually wait, let's look at user's rule: "K at final item of final media piece: Do NOT wrap around unless explicitly supports queue looping. Remain at final valid position."
    if (next >= q.length) return; 
    playMacroItem(next, q, 1);
  }

  function goToPreviousMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);
    let prev = curr - 1;
    if (prev < 0) return; // Do not wrap around
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

  // Backward compatibility / UI button aliases
  function nextPlaylist() { goToNextMedia(); }
  function prevPlaylist() { goToPreviousMedia(); }
  function nextTrack() { goToNextItem(); }
  function prevTrack() { goToPreviousItem(); }
`;

// Replace the existing nextTrack/prevTrack/nextPlaylist/prevPlaylist and add the new unified ones
const removeRegex = /function nextTrack\(\) \{[\s\S]*?function prevTrack\(\) \{[\s\S]*?(?=function playLocalMedia|<\/script>)/m;

const removePlaylistRegex = /function nextPlaylist\(\) \{[\s\S]*?function prevPlaylist\(\) \{[\s\S]*?(?=function nextTrack)/m;

// wait, playMacroItem needs to handle bounds properly too without wrapping if we are strictly not wrapping?
// Actually the user said "unless explicitly supports queue looping". Playlists looping might be desired, but let's stick to the user's test case.
