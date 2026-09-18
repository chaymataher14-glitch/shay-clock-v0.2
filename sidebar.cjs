const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

content = content.replace(
    `<button class="side-tab" data-tab="style" onclick="tab('style', event)">Settings</button>\n    <button class="side-tab" data-tab="stats" onclick="tab('stats', event)">Statistics</button>`,
    `<button class="side-tab" data-tab="stats" onclick="tab('stats', event)">Statistics</button>\n    <button class="side-tab" data-tab="style" onclick="tab('style', event)">Settings</button>`
);

fs.writeFileSync('index.html', content);
