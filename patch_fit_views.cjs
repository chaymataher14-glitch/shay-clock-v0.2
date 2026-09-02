const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldFit = `    function fit() {
      raf = 0;
      const rect = widget.getBoundingClientRect();
      const scaleFit = document.getElementById('scale-fit-toggle') ? document.getElementById('scale-fit-toggle').checked : true;            
      const view = activeView();
      if (!view) return;`;

const newFit = `    function fit() {
      raf = 0;
      const rect = widget.getBoundingClientRect();
      const scaleFit = document.getElementById('scale-fit-toggle') ? document.getElementById('scale-fit-toggle').checked : true;            
      const view = activeView();
      if (!view) return;
      if (view.id === 'view-media' || view.id === 'view-style') {
        widget.style.setProperty('--auto-scale', '1');
        return;
      }`;

if(code.includes(oldFit)) {
    code = code.replace(oldFit, newFit);
}

// Ensure .media-view view-inner handles height nicely
code = code.replace(
  '<div class="view-inner" style="width: 100%; height: 100%;">',
  '<div class="view-inner" style="width: 100%; height: 100%; min-height: 0; display: flex; flex-direction: column;">'
);
// Ensure media-container can shrink
code = code.replace(
  '.media-container { width: 100%; height: 100%; display: flex; flex-direction: column; gap: 1rem;  }',
  '.media-container { width: 100%; flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; gap: 1rem;  }'
);

fs.writeFileSync('index.html', code);
