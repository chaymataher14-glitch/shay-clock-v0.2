const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  /nameInput\.onchange = \(e\) => \{[\s\S]*?savedPlaylists\[index\]\.name = e\.target\.value;[\s\S]*?saveSettings\(\);[\s\S]*?\};/,
  `nameInput.onchange = (e) => {
        savedPlaylists[index].name = e.target.value;
        saveSettings();
        renderPlaylist();
      };`
);

code = code.replace(
  /row\.ondrop = \(e\) => \{([\s\S]*?)renderPlaylists\(\);\s*\};/,
  `row.ondrop = (e) => {
$1renderPlaylists();
        renderPlaylist();
      };`
);

code = code.replace(
  /delBtn\.onclick = \(\) => \{([\s\S]*?)renderPlaylists\(\);\s*\};/,
  `delBtn.onclick = () => {
$1renderPlaylists();
        renderPlaylist();
      };`
);

code = code.replace(
  /playBtn\.onclick = \(\) => \{([\s\S]*?)renderPlaylists\(\);\s*\};/,
  `playBtn.onclick = () => {
$1renderPlaylists();
        renderPlaylist();
      };`
);

fs.writeFileSync('index.html', code);
