const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Fix goToNextItem
code = code.replace(/function goToNextItem\(\) \{[\s\S]*?if \(q.length === 0\) return;\n    let curr = getCurrentMacroIndex\(q\);/,
`function goToNextItem() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);`);

// Fix goToNextMedia
code = code.replace(/function goToNextMedia\(\) \{[\s\S]*?if \(q.length === 0\) return;\n    let curr = getCurrentMacroIndex\(q\);/,
`function goToNextMedia() {
    let q = getMacroQueue();
    if (q.length === 0) return;
    let curr = getCurrentMacroIndex(q);`);

fs.writeFileSync('index.html', code);
console.log("Syntax fixed.");
