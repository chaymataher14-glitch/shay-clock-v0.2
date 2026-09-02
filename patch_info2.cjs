const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldBlock = `        if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playlistIndex !== undefined) window.ytPlaylistIndex = data.info.playlistIndex;
            if (data.info.playlist !== undefined) window.ytPlaylistLength = data.info.playlist.length;
            
            if (data.info.playerState !== undefined) {`;

const newBlock = `        if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playlistIndex !== undefined) window.ytPlaylistIndex = data.info.playlistIndex;
            if (data.info.playlist !== undefined) {
                window.ytPlaylistLength = data.info.playlist.length;
                if (window.playLastYtTrackOnLoad && window.ytPlaylistLength > 1) {
                    window.playLastYtTrackOnLoad = false;
                    let target = window.ytPlaylistLength - 1;
                    if (window.ytPlaylistIndex !== target) {
                        e.source.postMessage(JSON.stringify({event: 'command', func: 'playVideoAt', args: [target]}), '*');
                    }
                }
            }
            
            if (data.info.playerState !== undefined) {`;

if (code.includes(oldBlock)) {
    code = code.replace(oldBlock, newBlock);
    fs.writeFileSync('index.html', code);
    console.log("Patched infoDelivery correctly");
} else {
    console.log("Could not find oldBlock");
}
