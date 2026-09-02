const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/function goToNextItem\(\) \{[\s\S]*?if \(q.length === 0\) return;/g, 
`function goToNextItem() {
    let q = getMacroQueue();
    if (q.length === 0) return;`);

fs.writeFileSync('index.html', code);
console.log("Fixed syntax 2");
