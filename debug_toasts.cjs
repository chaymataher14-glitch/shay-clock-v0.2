const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/function goToNextItem\(\) \{[\s\S]*?let q = getMacroQueue\(\);/, 
`function goToNextItem() {
    let q = getMacroQueue();
    let curr = getCurrentMacroIndex(q);
    let ytLen = window.ytPlaylistLength || 1;
    let ytIdx = window.ytPlaylistIndex || 0;
    showToast('K pressed. q.length: ' + q.length + ' curr: ' + curr + ' ytIdx: ' + ytIdx + '/' + ytLen);
`);

code = code.replace(/function goToNextMedia\(\) \{[\s\S]*?let q = getMacroQueue\(\);/,
`function goToNextMedia() {
    let q = getMacroQueue();
    let curr = getCurrentMacroIndex(q);
    showToast('N pressed or Spillover. next: ' + (curr+1) + '/' + q.length);
`);

fs.writeFileSync('index.html', code);
console.log("Injected debug toasts");
