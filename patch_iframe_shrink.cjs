const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  'min-height: 100px;',
  'min-height: 0; min-height: 50px;'
);

fs.writeFileSync('index.html', code);
