const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  "id=\"new-saved-url\" placeholder=\"Paste URL here...\" style=\"flex:1; padding:10px 12px; border-radius:10px; border:2px solid var(--card); background:var(--bg); color:var(--text); outline:none; font-family:var(--font);\">",
  "id=\"new-saved-url\" placeholder=\"Paste URL here...\" style=\"flex:1; padding:10px 12px; border-radius:10px; border:2px solid var(--card); background:var(--bg); color:var(--text); outline:none; font-family:var(--font);\" onkeydown=\"if(event.key==='Enter') { addCurrentUrlToPlaylist(); this.blur(); }\">"
);

fs.writeFileSync('index.html', code);
