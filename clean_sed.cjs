const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const regex = /[ \t]*const view = document\.getElementById\('view-stats'\);\n[ \t]*if \(view && view\.classList\.contains\('active'\)\) renderStats\(\);/g;

content = content.replace(regex, '');

fs.writeFileSync('index.html', content);
