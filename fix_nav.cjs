const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// 1. We need to implement proper navigation functions.
// 2. We need to replace nextTrack, prevTrack, nextPlaylist, prevPlaylist
// 3. We need to hook up K, J, N, P

// Let's first inspect where the keydown is
const match = code.match(/addEventListener\('keydown'[\s\S]*?(?=<\/script>)/m);
if (match) {
   console.log(match[0].substring(0, 500));
} else {
   console.log("Could not find keydown");
}
