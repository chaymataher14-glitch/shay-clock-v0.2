const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Let's add some console.logs to goToNextItem and goToNextMedia
let updated = code.replace(/function goToNextItem\(\) \{/, `function goToNextItem() { console.log('goToNextItem called', getMacroQueue());`)
                .replace(/function goToNextMedia\(\) \{/, `function goToNextMedia() { console.log('goToNextMedia called', getMacroQueue(), getCurrentMacroIndex(getMacroQueue()));`);

fs.writeFileSync('index.html', updated);
console.log("Added debug logs.");
