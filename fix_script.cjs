const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Remove the rogue block around 3150
// The rogue block looks exactly like this:
//     
//     localPlayer.style.display = 'block';
//     localPlayer.src = mediaFiles[index].url;
//     localPlayer.play().catch(e => { console.log('Auto-play prevented', e); showToast('Auto-play blocked. Please click play.'); });
//   }

const rogueBlock = `    
    localPlayer.style.display = 'block';
    localPlayer.src = mediaFiles[index].url;
    localPlayer.play().catch(e => { console.log('Auto-play prevented', e); showToast('Auto-play blocked. Please click play.'); });
  }`;

if (content.includes(rogueBlock)) {
    content = content.replace(rogueBlock, "");
    console.log("Rogue block removed.");
} else {
    console.log("Rogue block NOT FOUND!");
}

// 2. Insert it back into playLocalMedia
const targetStr = `      document.querySelector('.iframe-area').appendChild(localPlayer);
    }`;

const insertBlock = `      document.querySelector('.iframe-area').appendChild(localPlayer);
    }
    
    localPlayer.style.display = 'block';
    localPlayer.src = mediaFiles[index].url;
    localPlayer.play().catch(e => { console.log('Auto-play prevented', e); showToast('Auto-play blocked. Please click play.'); });
  }`;

if (content.includes(targetStr) && !content.includes(insertBlock)) {
    content = content.replace(targetStr, insertBlock);
    console.log("Fixed playLocalMedia.");
} else {
    console.log("Target string NOT FOUND in playLocalMedia!");
}

fs.writeFileSync('index.html', content);
