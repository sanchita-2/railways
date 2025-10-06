// --- Chart.js Trend Chart ---
const ctx = document.getElementById('trendChart');
let trendChart;

// --- Load Dashboard Stats ---
async function loadDashboard() {
  try {
    const res = await fetch('http://localhost:5000/api/stats');
    const data = await res.json();

    document.getElementById('totalAssets').textContent = data.totalAssets;
    document.getElementById('pendingInspections').textContent = data.pendingInspections;

    const labels = data.trendData.map(d => d.month);
    const values = data.trendData.map(d => d.value);

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Efficiency Trend',
          data: values,
          borderColor: '#0097ff',
          tension: 0.3,
          fill: false
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#1f2a3a' }, ticks: { color: '#aaa' } },
          x: { grid: { color: '#1f2a3a' }, ticks: { color: '#aaa' } }
        }
      }
    });

  } catch (err) {
    console.error(err);
  }
}

// --- Load Recent Activity Feed ---
async function loadActivity() {
  try {
    const res = await fetch('http://localhost:5000/api/activity');
    const data = await res.json();

    const feed = document.getElementById('activityFeed');
    feed.innerHTML = '';
    data.forEach(item => {
      const p = document.createElement('p');
      p.textContent = `[${new Date(item.created_at).toLocaleTimeString()}] Asset ${item.asset_id} - ${item.status}`;
      feed.appendChild(p);
    });
  } catch (err) {
    console.error(err);
  }
}

// --- Animate Safety Score ---
function animateScore(target) {
  let score = 0;
  const el = document.getElementById('safetyScore');
  const interval = setInterval(() => {
    if(score >= target){ clearInterval(interval); return; }
    el.textContent = ++score;
  }, 20);
}

// --- QR Scan Button ---
document.querySelector('.scan-btn').addEventListener('click', () => {
  const html5QrCode = new Html5Qrcode("reader");

  html5QrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async (qrCodeMessage) => {
      // Stop scanning after successful scan
      html5QrCode.stop();

      try {
        await fetch('http://localhost:5000/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId: qrCodeMessage, status: "Inspected" })
        });

        // Refresh dashboard stats and activity feed
        loadDashboard();
        loadActivity();

      } catch (err) {
        console.error(err);
        alert("Error logging asset!");
      }
    },
    (errorMessage) => {
      console.log("Scanning...", errorMessage);
    }
  );
});

// --- Initial Load ---
loadDashboard();
loadActivity();
animateScore(92);