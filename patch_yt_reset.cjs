const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const strToFind = "function loadMedia() {";
const strToReplace = "function loadMedia() {\n    window.ytPlaylistIndex = -1;\n    window.ytPlaylistLength = 0;";

code = code.replace(strToFind, strToReplace);
fs.writeFileSync('index.html', code);
