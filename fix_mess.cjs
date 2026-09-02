const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/localPlayer\.style\.display = 'block';\s+localPlayer\.src = mediaFiles\[index\]\.url;\s+localPlayer\.play\(\)\.catch\(e => \{ console\.log\('Auto-play prevented', e\); showToast\('Auto-play blocked\. Please click play\.'\); \}\);\s+\}/, '');

fs.writeFileSync('index.html', code);
console.log("Fixed mess.");
