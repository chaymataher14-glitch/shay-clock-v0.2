const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldWebIsActive = `      const isActive = (document.getElementById('m-url').value === item.url || index === currentPlaylistIndex);`;
const newWebIsActive = `      const isActive = (!localPlayer || localPlayer.style.display === 'none') && (document.getElementById('m-url').value === item.url || index === currentPlaylistIndex);`;

const oldLocalActive = `      btn.className = \`btn \${index === currentMediaIndex ? 'active' : ''}\`;`;
const newLocalActive = `      const isLocalActive = (localPlayer && localPlayer.style.display !== 'none' && index === currentMediaIndex);
      btn.className = \`btn \${isLocalActive ? 'active' : ''}\`;`;

const oldLocalIf = `      if (index === currentMediaIndex) {`;
const newLocalIf = `      if (isLocalActive) {`;

code = code.replace(oldWebIsActive, newWebIsActive);
code = code.replace(oldLocalActive, newLocalActive);
code = code.replace(oldLocalIf, newLocalIf);

fs.writeFileSync('index.html', code);
