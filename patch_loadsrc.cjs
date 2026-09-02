const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldLoadMedia = `      let finalSrc = '';
      if (videoId && listId) {
        finalSrc = \`https://www.youtube.com/embed/\${videoId}?list=\${listId}&autoplay=1&enablejsapi=1\`;
      } else if (videoId) {
        finalSrc = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
      } else if (listId) {
        finalSrc = \`https://www.youtube.com/embed/videoseries?list=\${listId}&autoplay=1&enablejsapi=1\`;
      }
      
      if (finalSrc) {
        iframe.src = finalSrc;`;

const newLoadMedia = `      let finalSrc = '';
      // If we have both, prefer the playlist URL so it doesn't get hard-locked to one specific video index
      if (listId) {
        finalSrc = \`https://www.youtube.com/embed/videoseries?list=\${listId}&autoplay=1&enablejsapi=1\`;
      } else if (videoId) {
        finalSrc = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
      }
      
      if (finalSrc) {
        iframe.src = finalSrc;`;

if (code.includes(oldLoadMedia)) {
   code = code.replace(oldLoadMedia, newLoadMedia);
   fs.writeFileSync('index.html', code);
   console.log("Patched loadMedia");
} else {
   console.log("Could not find oldLoadMedia");
}
