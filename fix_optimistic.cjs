const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/if \(ytLen > 1 && ytIdx < ytLen - 1\) \{[\s\S]*?iframe.contentWindow.postMessage\([\s\S]*?nextVideo[\s\S]*?\*'\);/,
`if (ytLen > 1 && ytIdx < ytLen - 1) {
               window.ytPlaylistIndex++; // Optimistically update index
               iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'nextVideo', args: []}), '*');`);

code = code.replace(/if \(ytIdx > 0\) \{[\s\S]*?iframe.contentWindow.postMessage\([\s\S]*?previousVideo[\s\S]*?\*'\);/,
`if (ytIdx > 0) {
               window.ytPlaylistIndex--; // Optimistically update index
               iframe.contentWindow.postMessage(JSON.stringify({event: 'command', func: 'previousVideo', args: []}), '*');`);

fs.writeFileSync('index.html', code);
console.log("Applied optimistic index updates.");
