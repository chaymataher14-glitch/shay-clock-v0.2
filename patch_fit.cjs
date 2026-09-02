const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldFit = `    function fit() {
      raf = 0;
      const rect = widget.getBoundingClientRect();
      const scaleFit = document.getElementById('scale-fit-toggle') ? document.getElementById('scale-fit-toggle').checked : true;            
      const view = activeView();
      if (!view) return;
      const availW = rect.width;
      const availH = rect.height;
      const inner = view.querySelector('.view-inner');
      if (!inner) return;
      const measureW = inner.scrollWidth;
      const measureH = inner.scrollHeight;
      
      let s = 1;
      if (scaleFit && measureH > availH) s = Math.min(s, availH / measureH);
      if (measureW > availW) s = Math.min(s, availW / measureW);
      s = Math.max(0.1, Math.min(1, s));
      
      widget.style.setProperty('--auto-scale', s);
    }`;

const newFit = `    function fit() {
      raf = 0;
      const rect = widget.getBoundingClientRect();
      const scaleFit = document.getElementById('scale-fit-toggle') ? document.getElementById('scale-fit-toggle').checked : true;            
      const view = activeView();
      if (!view) return;
      const viewStyles = window.getComputedStyle(view);
      const padT = parseFloat(viewStyles.paddingTop) || 0;
      const padB = parseFloat(viewStyles.paddingBottom) || 0;
      const padL = parseFloat(viewStyles.paddingLeft) || 0;
      const padR = parseFloat(viewStyles.paddingRight) || 0;
      
      const availW = rect.width - padL - padR;
      const availH = rect.height - padT - padB;
      const inner = view.querySelector('.view-inner');
      if (!inner) return;
      
      // Reset scale to measure natural size
      const oldScale = widget.style.getPropertyValue('--auto-scale');
      widget.style.setProperty('--auto-scale', '1');
      const measureW = inner.scrollWidth;
      const measureH = inner.scrollHeight;
      
      let s = 1;
      if (scaleFit && measureH > availH) s = Math.min(s, availH / measureH);
      if (measureW > availW) s = Math.min(s, availW / measureW);
      
      // Additional safety margin
      s = s * 0.95;
      
      s = Math.max(0.1, Math.min(1, s));
      
      widget.style.setProperty('--auto-scale', s);
    }`;

if(code.includes('const availW = rect.width;')) {
    code = code.replace(oldFit, newFit);
}

fs.writeFileSync('index.html', code);
