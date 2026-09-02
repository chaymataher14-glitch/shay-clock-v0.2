const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldInfoDelivery = `        if (data.event === 'infoDelivery' && data.info) {
            if (data.info.playlistIndex !== undefined) window.ytPlaylistIndex = data.info.playlistIndex;
            if (data.info.playlist !== undefined) window.ytPlaylistLength = data.info.playlist.length;
            if (data.info.playerState !== undefined) {
                if (data.info.playerState === 1 || data.info.playerState === 3) {
                    if (data.info.videoData) {
                        currentYtTitle = data.info.videoData.title || '';
                    }
                }
                if (data.info.playerState === 0) {
                    // Video ended
                    if (window.ytPlaylistLength > 1) {
                        if (window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
                            nextPlaylist(); // Reached end of YT playlist, spill over to next Macro item
                        }
                    } else {
                        nextPlaylist(); // Single video ended, spill over
                    }
                }
            }
        }`;

const newInfoDelivery = `        if (data.event === 'infoDelivery' && data.info) {
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
            if (data.info.playerState !== undefined) {
                if (data.info.playerState === 1 || data.info.playerState === 3) {
                    if (data.info.videoData) {
                        currentYtTitle = data.info.videoData.title || '';
                    }
                }
                if (data.info.playerState === 0) {
                    // Video ended
                    if (window.ytPlaylistLength > 1) {
                        if (window.ytPlaylistIndex >= window.ytPlaylistLength - 1) {
                            nextPlaylist(); // Reached end of YT playlist, spill over to next Macro item
                        }
                    } else {
                        nextPlaylist(); // Single video ended, spill over
                    }
                }
            }
        }`;

if (code.includes(oldInfoDelivery)) {
   code = code.replace(oldInfoDelivery, newInfoDelivery);
   fs.writeFileSync('index.html', code);
   console.log("Patched infoDelivery");
} else {
   console.log("Could not find oldInfoDelivery");
}
