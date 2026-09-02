const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  'max-height: 100%;',
  'max-height: 100%;\n    min-width: 0;\n    min-height: 0;'
);

fs.writeFileSync('index.html', code);
