const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const regex = /<script>([\s\S]*?)<\/script>/g;
let match;
while ((match = regex.exec(html)) !== null) {
  try {
    new Function(match[1]);
  } catch (err) {
    console.error("Syntax Error:", err);
  }
}
