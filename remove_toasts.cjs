const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/showToast\('K pressed.*?;\n/g, '');
code = code.replace(/showToast\('N pressed.*?;\n/g, '');

fs.writeFileSync('index.html', code);
console.log("Removed debug toasts");
