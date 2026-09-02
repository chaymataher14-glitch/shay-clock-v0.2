const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  "navigator.mediaSession.setActionHandler('previoustrack', prevTrack);",
  "navigator.mediaSession.setActionHandler('previoustrack', autoPrevMedia);"
);
code = code.replace(
  "navigator.mediaSession.setActionHandler('nexttrack', nextTrack);",
  "navigator.mediaSession.setActionHandler('nexttrack', autoNextMedia);"
);

fs.writeFileSync('index.html', code);
