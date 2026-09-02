const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/function goToNextItem\(\) \{/, 
`function goToNextItem() {
    let q = getMacroQueue();
    let curr = getCurrentMacroIndex(q);
    let ytLen = window.ytPlaylistLength;
    let ytIdx = window.ytPlaylistIndex;
    showToast('K pressed! ytLen: ' + ytLen + ' ytIdx: ' + ytIdx);
`);

fs.writeFileSync('index.html', code);
console.log("Added toast");
