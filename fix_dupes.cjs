const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(/renderPlaylist\(\);\s*renderPlaylist\(\);/g, 'renderPlaylist();');
code = code.replace(/renderPlaylists\(\);\s*renderPlaylist\(\);/g, 'renderPlaylists();\n    renderPlaylist();');
code = code.replace(/renderPlaylist\(\);\s*renderPlaylist\(\);/g, 'renderPlaylist();');

fs.writeFileSync('index.html', code);
