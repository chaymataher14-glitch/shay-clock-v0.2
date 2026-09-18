const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const statsJs = `
  // --- STATS SYSTEM ---
  let statsChart = null;
  let currentStatsMonth = new Date();

  function logStudyTime(seconds) {
      if (seconds <= 0) return;
      const key = STORAGE_KEY + '_stats';
      let stats = JSON.parse(localStorage.getItem(key) || '{}');
      let d = new Date();
      let dateString = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      if (!stats[dateString]) stats[dateString] = 0;
      stats[dateString] += seconds;
      localStorage.setItem(key, JSON.stringify(stats));
      
      const view = document.getElementById('view-stats');
      if (view && view.classList.contains('active')) {
          renderStats();
      }
  }

  function formatTime(seconds) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return h + 'h ' + m + 'm';
  }

  function changeStatsMonth(delta) {
      currentStatsMonth.setMonth(currentStatsMonth.getMonth() + delta);
      renderStats();
  }

  function renderStats() {
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
  }
`;

const marker = '// --- UNIFIED NAVIGATION SYSTEM ---';
content = content.replace(marker, statsJs + '\n  ' + marker);
fs.writeFileSync('index.html', content);
