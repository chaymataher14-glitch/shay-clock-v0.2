const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    'if (next >= q.length) return; // Rule 5: boundary limit',
    'if (next >= q.length) next = 0; // wrap around'
);

content = content.replace(
    'if (prev < 0) return; // Rule 5: boundary limit',
    'if (prev < 0) prev = q.length - 1; // wrap around'
);

fs.writeFileSync('index.html', content);
console.log("Replaced boundary limits with wrap around.");
