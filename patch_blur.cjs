const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  "onkeydown=\"if(event.key==='Enter') loadMedia()\"",
  "onkeydown=\"if(event.key==='Enter') { loadMedia(); this.blur(); }\""
);

fs.writeFileSync('index.html', code);
