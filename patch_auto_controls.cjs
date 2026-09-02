const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. Change the control buttons to call autoNextMedia and autoPrevMedia
code = code.replace(
  'onclick="prevTrack()" title="Previous Track (J)"',
  'onclick="autoPrevMedia()" title="Previous Media (J)"'
);
code = code.replace(
  'onclick="nextTrack()" title="Next Track (K)"',
  'onclick="autoNextMedia()" title="Next Media (K)"'
);

fs.writeFileSync('index.html', code);
