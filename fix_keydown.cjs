const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Ensure keydown listener isn't duplicating logic
let updated = code.replace(/\} else if \(e\.key === 'p' \|\| e\.key === 'P'\) \{[\s\S]*?\} else if \(e\.key === 'k' \|\| e\.key === 'K'\) \{[\s\S]*?goToNextItem\(\);\n    \}/, 
`} else if (e.key === 'p' || e.key === 'P') {
      goToPreviousMedia();
    } else if (e.key === 'n' || e.key === 'N') {
      goToNextMedia();
    } else if (e.key === 'j' || e.key === 'J') {
      goToPreviousItem();
    } else if (e.key === 'k' || e.key === 'K') {
      goToNextItem();
    }`);

if (code !== updated) {
    fs.writeFileSync('index.html', updated);
    console.log("Keydown listener explicitly fixed.");
} else {
    console.log("No changes needed in keydown listener.");
}
