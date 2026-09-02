const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldYtEvent = `        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
            isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
            if (data.info.playerState === 0) {
                // Video ended
                autoNextMedia();
            }
        }`;

const newYtEvent = `        if (data.event === 'infoDelivery' && data.info && data.info.playerState !== undefined) {
            isYtPlaying = (data.info.playerState === 1 || data.info.playerState === 3);
            if (data.info.muted !== undefined) isYtMuted = data.info.muted;
            if (data.info.playerState === 0) {
                // Video ended
                const url = document.getElementById('m-url') ? document.getElementById('m-url').value : '';
                if (!url.includes('list=')) {
                    autoNextMedia();
                }
            }
        }`;

code = code.replace(oldYtEvent, newYtEvent);
fs.writeFileSync('index.html', code);
