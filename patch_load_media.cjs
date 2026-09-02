const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const strToFind = `    const iframe = document.getElementById('player');
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      if (videoId) {
        iframe.src = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      }
    } else {
      iframe.src = url;
    }`;

const newStr = `    const iframe = document.getElementById('player');
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      let listId = '';
      
      if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      
      if (url.includes('list=')) listId = url.split('list=')[1].split('&')[0];
      
      let finalSrc = '';
      if (videoId && listId) {
        finalSrc = \`https://www.youtube.com/embed/\${videoId}?list=\${listId}&autoplay=1&enablejsapi=1\`;
      } else if (videoId) {
        finalSrc = \`https://www.youtube.com/embed/\${videoId}?autoplay=1&enablejsapi=1\`;
      } else if (listId) {
        finalSrc = \`https://www.youtube.com/embed/videoseries?list=\${listId}&autoplay=1&enablejsapi=1\`;
      }
      
      if (finalSrc) {
        iframe.src = finalSrc;
        if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
        iframe.style.display = 'block';
      } else {
        iframe.src = url;
      }
    } else {
      iframe.src = url;
      if (localPlayer) { localPlayer.pause(); localPlayer.style.display = 'none'; }
      iframe.style.display = 'block';
    }`;

if(code.includes(strToFind)) {
    code = code.replace(strToFind, newStr);
} else {
    console.log("Not found");
}

fs.writeFileSync('index.html', code);
