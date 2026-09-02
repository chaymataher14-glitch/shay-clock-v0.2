const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/e\.source\.postMessage/g, 'event.source.postMessage');

fs.writeFileSync('index.html', code);
console.log("Fixed e.source");
