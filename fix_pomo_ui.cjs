const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldHTML = `        <div class="pomo-settings-box">
          <div class="pomo-settings-group">
            <div class="pomo-settings-title">Phase Durations</div>
            <div class="pomo-settings-row">
              <div class="field"><label for="r-len">Get Ready (min)</label><input type="number" id="r-len" value="0" min="0" onchange="saveSettings(); resetPomo();"></div>

              <div class="field"><label for="w-len">Work (min)</label><input type="number" id="w-len" value="25" min="1" onchange="saveSettings(); resetPomo();"></div>

              <div class="field"><label for="b-len">Short Break</label><input type="number" id="b-len" value="5" min="1" onchange="saveSettings(); resetPomo();"></div>

              <div class="field"><label for="long-break-len">Long Break</label><input type="number" id="long-break-len" value="15" min="1" onchange="saveSettings(); resetPomo();"></div>

            </div>
          </div>
          <div class="pomo-settings-group" style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 1rem;">
            <div class="pomo-settings-title">Schedule</div>
            <div class="pomo-settings-row">
              <div class="field"><label for="p-count">Total Sessions</label><input type="number" id="p-count" value="4" min="1" onchange="saveSettings(); resetPomo();"></div>

              <div class="field"><label for="long-break-every">Long Break Every</label><input type="number" id="long-break-every" value="4" min="1" onchange="saveSettings(); resetPomo();"></div>

            </div>
          </div>
        </div>`;

const newHTML = `      </div>

      <div class="section-group">
        <div class="section-label">Pomodoro Schedule</div>
        
        <div class="style-row">
          <label for="r-len">Get Ready Phase (min)</label>
          <input class="style-number" type="number" id="r-len" value="0" min="0" onchange="saveSettings(); resetPomo();">
        </div>
        
        <div class="style-row">
          <label for="w-len">Work Phase (min)</label>
          <input class="style-number" type="number" id="w-len" value="25" min="1" onchange="saveSettings(); resetPomo();">
        </div>
        
        <div class="style-row">
          <label for="b-len">Short Break (min)</label>
          <input class="style-number" type="number" id="b-len" value="5" min="1" onchange="saveSettings(); resetPomo();">
        </div>
        
        <div class="style-row">
          <label for="long-break-len">Long Break (min)</label>
          <input class="style-number" type="number" id="long-break-len" value="15" min="1" onchange="saveSettings(); resetPomo();">
        </div>
        
        <div class="style-row">
          <label for="p-count">Total Sessions Before Reset</label>
          <input class="style-number" type="number" id="p-count" value="4" min="1" onchange="saveSettings(); resetPomo();">
        </div>
        
        <div class="style-row">
          <label for="long-break-every">Long Break Interval</label>
          <input class="style-number" type="number" id="long-break-every" value="4" min="1" onchange="saveSettings(); resetPomo();">
        </div>`;

content = content.replace(oldHTML, newHTML);
fs.writeFileSync('index.html', content);
