const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const targetJS = `  function renderStats() {
      const key = STORAGE_KEY + '_stats';
      let stats = JSON.parse(localStorage.getItem(key) || '{}');
      
      let d = new Date();
      let todayStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      let todaySeconds = stats[todayStr] || 0;
      document.getElementById('stats-header').textContent = 'Today: ' + formatTime(todaySeconds);
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const y = currentStatsMonth.getFullYear();
      const m = currentStatsMonth.getMonth();
      document.getElementById('stats-month-label').textContent = monthNames[m] + ' ' + y;
      
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const labels = [];
      const data = [];
      let totalSecondsThisMonth = 0;
      
      for(let i=1; i<=daysInMonth; i++) {
          labels.push(i);
          let dateStr = y + '-' + String(m+1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
          let s = stats[dateStr] || 0;
          totalSecondsThisMonth += s;
          data.push(s / 3600); // in hours for chart
      }
      
      document.getElementById('stats-total-month').textContent = 'Total this month: ' + formatTime(totalSecondsThisMonth);
      
      updateChart(labels, data);
  }

  function updateChart(labels, data) {
      const ctx = document.getElementById('statsChart');
      if(!ctx) return;
      
      const rawAccent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
      const accent = rawAccent.startsWith('#') ? rawAccent : (rawAccent || '#FF7B90');
      const text = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#333333';

      if (statsChart) {
          statsChart.data.labels = labels;
          statsChart.data.datasets[0].data = data;
          statsChart.data.datasets[0].borderColor = accent;
          statsChart.data.datasets[0].backgroundColor = accent + '33';
          statsChart.data.datasets[0].pointBackgroundColor = accent;
          statsChart.options.scales.x.ticks.color = text;
          statsChart.options.scales.y.ticks.color = text;
          statsChart.update();
      } else {
          if(typeof Chart === 'undefined') return;
          statsChart = new Chart(ctx, {
              type: 'line',
              data: {
                  labels: labels,
                  datasets: [{
                      label: 'Hours Studied',
                      data: data,
                      borderColor: accent,
                      backgroundColor: accent + '33',
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: accent,
                      pointRadius: 2,
                      pointHoverRadius: 6
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: { display: false },
                      tooltip: {
                          callbacks: {
                              label: function(context) {
                                  let val = context.parsed.y;
                                  let h = Math.floor(val);
                                  let m = Math.floor((val - h) * 60);
                                  return h + 'h ' + m + 'm';
                              }
                          }
                      }
                  },
                  scales: {
                      x: {
                          ticks: { color: text, font: {family: 'inherit'} },
                          grid: { display: false }
                      },
                      y: {
                          ticks: { color: text, font: {family: 'inherit'}, maxTicksLimit: 5 },
                          grid: { color: 'rgba(128,128,128,0.1)' },
                          beginAtZero: true
                      }
                  }
              }
          });
      }
  }`;

const newJS = `  function renderStats() {
      const key = STORAGE_KEY + '_stats';
      let stats = JSON.parse(localStorage.getItem(key) || '{}');
      
      let d = new Date();
      let todayStr = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      let todaySeconds = stats[todayStr] || 0;
      let hdr = document.getElementById('stats-header');
      if(hdr) hdr.textContent = formatTime(todaySeconds);
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const y = currentStatsMonth.getFullYear();
      const m = currentStatsMonth.getMonth();
      let mlbl = document.getElementById('stats-month-label');
      if(mlbl) mlbl.textContent = monthNames[m] + ' ' + y;
      
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const labels = [];
      const data = [];
      let totalSecondsThisMonth = 0;
      let daysStudied = 0;
      
      for(let i=1; i<=daysInMonth; i++) {
          labels.push(i);
          let dateStr = y + '-' + String(m+1).padStart(2, '0') + '-' + String(i).padStart(2, '0');
          let s = stats[dateStr] || 0;
          totalSecondsThisMonth += s;
          if(s > 0) daysStudied++;
          data.push(s / 3600); // in hours for chart
      }
      
      let tlbl = document.getElementById('stats-total-month');
      if(tlbl) tlbl.textContent = formatTime(totalSecondsThisMonth);
      
      let avg = daysStudied > 0 ? Math.floor(totalSecondsThisMonth / daysStudied) : 0;
      let albl = document.getElementById('stats-avg-month');
      if(albl) albl.textContent = formatTime(avg);
      
      updateChart(labels, data);
  }

  function updateChart(labels, data) {
      const canvas = document.getElementById('statsChart');
      if(!canvas) return;
      const ctx = canvas.getContext('2d');
      
      const rawAccent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
      const accent = rawAccent.startsWith('#') ? rawAccent : (rawAccent || '#FF7B90');
      const text = getComputedStyle(document.body).getPropertyValue('--text').trim() || '#333333';
      const fontFam = getComputedStyle(document.body).getPropertyValue('--font').trim() || 'inherit';

      // Create a nice vertical gradient for the line fill
      let gradient = ctx.createLinearGradient(0, 0, 0, 250);
      gradient.addColorStop(0, accent + '66'); // 40% opacity
      gradient.addColorStop(1, accent + '00'); // 0% opacity

      if (statsChart) {
          statsChart.data.labels = labels;
          statsChart.data.datasets[0].data = data;
          statsChart.data.datasets[0].borderColor = accent;
          statsChart.data.datasets[0].backgroundColor = gradient;
          statsChart.data.datasets[0].pointBackgroundColor = accent;
          statsChart.data.datasets[0].pointHoverBackgroundColor = accent;
          statsChart.options.scales.x.ticks.color = text;
          statsChart.options.scales.y.ticks.color = text;
          statsChart.update();
      } else {
          if(typeof Chart === 'undefined') return;
          Chart.defaults.font.family = fontFam;
          
          statsChart = new Chart(ctx, {
              type: 'line',
              data: {
                  labels: labels,
                  datasets: [{
                      label: 'Hours Studied',
                      data: data,
                      borderColor: accent,
                      backgroundColor: gradient,
                      borderWidth: 3,
                      fill: true,
                      tension: 0.4, // smooth curves
                      pointBackgroundColor: accent,
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 0, // hide points by default for a cleaner look
                      pointHoverRadius: 6, // show them big on hover
                      pointHoverBackgroundColor: accent,
                      pointHoverBorderColor: '#fff',
                      pointHoverBorderWidth: 2,
                  }]
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                      mode: 'index', // makes hovering easier (don't have to be exact on the point)
                      intersect: false,
                  },
                  plugins: {
                      legend: { display: false },
                      tooltip: {
                          backgroundColor: 'rgba(0,0,0,0.85)',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          titleFont: { size: 13, weight: 'bold' },
                          bodyFont: { size: 14, weight: 'bold' },
                          padding: 12,
                          cornerRadius: 12,
                          displayColors: false,
                          callbacks: {
                              title: function(context) {
                                  return 'Day ' + context[0].label;
                              },
                              label: function(context) {
                                  let val = context.parsed.y;
                                  if (val === 0) return '0h 0m';
                                  let h = Math.floor(val);
                                  let m = Math.floor((val - h) * 60);
                                  return h + 'h ' + m + 'm';
                              }
                          }
                      }
                  },
                  scales: {
                      x: {
                          ticks: { color: text, maxTicksLimit: 10, padding: 10 },
                          grid: { display: false },
                          border: { display: false }
                      },
                      y: {
                          ticks: { color: text, maxTicksLimit: 5, padding: 10 },
                          grid: { color: 'rgba(128,128,128,0.1)', drawBorder: false },
                          border: { display: false },
                          beginAtZero: true,
                          suggestedMax: 1
                      }
                  }
              }
          });
      }
  }`;

if (content.includes(targetJS)) {
    content = content.replace(targetJS, newJS);
    console.log("JS replaced successfully.");
} else {
    // Try regex
    console.log("JS exact match failed, trying regex replacement...");
    const jsRegex = /function renderStats\(\) \{[\s\S]*?\}\s*function updateChart\(labels, data\) \{[\s\S]*?\}\s*\}/;
    if (jsRegex.test(content)) {
        content = content.replace(jsRegex, newJS);
        console.log("JS regex replaced successfully.");
    } else {
        console.error("JS NOT FOUND!");
    }
}

fs.writeFileSync('index.html', content);
