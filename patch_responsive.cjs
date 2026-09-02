const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// Add max-height container queries
const cssToInsert = `
  @container widget (max-height: 500px) {
    .clock-wrap { gap: 8px; }
    .flip-box { width: calc(110px * var(--flip-scale, 1) * var(--auto-scale, 1)); }
    .view { padding: 40px 4% 2%; }
  }
  @container widget (max-height: 350px) {
    .clock-wrap { gap: 6px; }
    .flip-box { width: calc(80px * var(--flip-scale, 1) * var(--auto-scale, 1)); }
    .view { padding: 30px 4% 2%; }
    .media-input { flex-direction: row; }
    .corner-controls { top: 8px; right: 8px; }
    .settings-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 150px), 1fr)); }
  }
  
  /* Additional flexibility rules */
  .view-inner {
    max-width: 100%;
  }
  .clock-wrap {
    max-width: 100%;
    flex-wrap: wrap; /* allow wrapping on extremely thin screens */
  }
`;

code = code.replace('</style>', cssToInsert + '\n</style>');

fs.writeFileSync('index.html', code);
