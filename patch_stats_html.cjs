const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetHTML = `<section id="view-stats" class="view">
      <div class="view-inner" style="width: 90%; display: flex; flex-direction: column; align-items: center;">
      
        <div class="section-group">
          <div class="section-label">Study Statistics</div>
          <div id="stats-header" style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; color: var(--text);">Today: 0h 0m</div>
          
          <div style="display: flex; justify-content: space-between; width: 100%; margin-bottom: 1rem; align-items: center;">
            <button class="btn btn-ghost" onclick="changeStatsMonth(-1)">&#8592; Prev</button>
            <div id="stats-month-label" style="font-weight: 600; font-size: 1.1rem; color: var(--text);">September 2026</div>
            <button class="btn btn-ghost" onclick="changeStatsMonth(1)">Next &#8594;</button>
          </div>
          
          <div style="width: 100%; height: 250px; background: rgba(128,128,128,0.05); border-radius: 1.5rem; padding: 1rem; box-sizing: border-box;">
            <canvas id="statsChart"></canvas>
          </div>
          <div id="stats-total-month" style="margin-top: 1rem; text-align: center; font-weight: 600; opacity: 0.8; color: var(--text);">Total this month: 0h 0m</div>
        </div>
      </div>
    </section>`;

const newHTML = `<section id="view-stats" class="view">
      <div class="view-inner" style="width: 100%; max-width: 600px; display: flex; flex-direction: column; gap: 1.5rem; align-items: stretch; margin: 0 auto; padding-top: 1rem;">
        
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--card); border-radius: 2rem; padding: 2rem 1rem; box-shadow: 0 10px 30px rgba(0,0,0,0.02);">
          <div style="font-size: 0.85rem; font-weight: 700; opacity: 0.5; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.5rem; color: var(--text);">Studied Today</div>
          <div id="stats-header" style="font-size: 3.2rem; font-weight: 800; color: var(--accent); line-height: 1; letter-spacing: -1px;">0h 0m</div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div style="background: var(--card); border-radius: 1.5rem; padding: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 0.75rem; font-weight: 700; opacity: 0.5; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text);">This Month</div>
            <div id="stats-total-month" style="font-size: 1.4rem; font-weight: 700; color: var(--text);">0h 0m</div>
          </div>
          <div style="background: var(--card); border-radius: 1.5rem; padding: 1.5rem; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.02); display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 0.75rem; font-weight: 700; opacity: 0.5; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text);">Daily Average</div>
            <div id="stats-avg-month" style="font-size: 1.4rem; font-weight: 700; color: var(--text);">0h 0m</div>
          </div>
        </div>

        <div style="background: var(--card); border-radius: 2rem; padding: 1.5rem; box-shadow: 0 10px 30px rgba(0,0,0,0.02); position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <button class="btn btn-ghost" onclick="changeStatsMonth(-1)" style="padding: 0.5rem 1rem; border-radius: 1rem;">&#8592;</button>
            <div id="stats-month-label" style="font-weight: 700; font-size: 1.1rem; color: var(--text);">September 2026</div>
            <button class="btn btn-ghost" onclick="changeStatsMonth(1)" style="padding: 0.5rem 1rem; border-radius: 1rem;">&#8594;</button>
          </div>
          <div style="width: 100%; height: 220px; position: relative;">
            <canvas id="statsChart"></canvas>
          </div>
        </div>
        
      </div>
    </section>`;

if (content.includes(targetHTML)) {
    content = content.replace(targetHTML, newHTML);
    console.log("HTML replaced successfully.");
} else {
    // Try regex if whitespace is slightly different
    console.log("Exact match failed, trying regex replacement...");
    const htmlRegex = /<section id="view-stats" class="view">[\s\S]*?<\/section>/;
    if (htmlRegex.test(content)) {
        content = content.replace(htmlRegex, newHTML);
        console.log("HTML regex replaced successfully.");
    } else {
        console.error("HTML NOT FOUND!");
    }
}

fs.writeFileSync('index.html', content);
