const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldFallback = `      if (finalSrc) {
        iframe.src = finalSrc;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      } else {
        iframe.src = url;
      }`;
      
const newFallback = `      if (finalSrc) {
        iframe.src = finalSrc;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      } else {
        iframe.src = url;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      }`;

if(code.includes(oldFallback)) {
    code = code.replace(oldFallback, newFallback);
}

fs.writeFileSync('index.html', code);
