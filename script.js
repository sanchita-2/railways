const ctx = document.getElementById('trendChart');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Efficiency Trend',
      data: [75, 80, 85, 83, 89, 92],
      borderColor: '#0097ff',
      tension: 0.3,
      fill: false
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: '#1f2a3a' }, ticks: { color: '#aaa' } },
      x: { grid: { color: '#1f2a3a' }, ticks: { color: '#aaa' } }
    }
  }
});

// Animate safety score
let score = 0;
const target = 92;
const el = document.getElementById('safetyScore');
const interval = setInterval(() => {
  if (score >= target) clearInterval(interval);
  el.textContent = ++score;
}, 20);

// Button to simulate QR scan
document.querySelector('.scan-btn').addEventListener('click', () => {
  alert("Opening QR Scanner... (connects to backend scan API in real version)");
});
