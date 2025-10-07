// --- Chart.js Trend Chart ---
const ctx = document.getElementById('trendChart');
let trendChart;

// --- Load Dashboard Stats ---
async function loadDashboard() {
  try {
    const res = await fetch('http://localhost:5500/api/stats');
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
    console.error("Error loading dashboard:", err);
  }
}

// --- Load Recent Activity Feed ---
async function loadActivity() {
  try {
    const res = await fetch('http://localhost:5500/api/activity');
    const data = await res.json();

    const feed = document.getElementById('activityFeed');
    feed.innerHTML = '';
    data.forEach(item => {
      const p = document.createElement('p');
      p.textContent = `[${new Date(item.created_at).toLocaleTimeString()}] Asset ${item.asset_id} - ${item.status}`;
      feed.appendChild(p);
    });
  } catch (err) {
    console.error("Error loading activity:", err);
  }
}

// --- Animate Safety Score ---
function animateScore(target) {
  let score = 0;
  const el = document.getElementById('safetyScore');
  const interval = setInterval(() => {
    if (score >= target) {
      clearInterval(interval);
      return;
    }
    el.textContent = ++score;
  }, 20);
}

// --- QR Scanner Logic ---
let html5QrCode = null;
let isScanning = false;

const scanBtn = document.querySelector('.scan-btn');
const readerDiv = document.getElementById('reader');

scanBtn.addEventListener('click', async () => {
  if (!isScanning) {
    try {
      if (!html5QrCode) html5QrCode = new Html5Qrcode("reader");

      readerDiv.style.display = "block";
      readerDiv.style.margin = "20px auto";
      scanBtn.textContent = "Stop Scanning";
      isScanning = true;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          alert(`✅ QR Detected: ${decodedText}`);

          // Stop camera
          await html5QrCode.stop();
          html5QrCode.clear();
          readerDiv.style.display = "none";
          scanBtn.textContent = "Scan QR";
          isScanning = false;

          // Log scan to backend
          try {
            await fetch('http://localhost:5500/api/scan', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assetId: decodedText, status: "Inspected" })
            });
            loadDashboard();
            loadActivity();
          } catch (err) {
            console.error("Error logging scan:", err);
            alert("Error logging scan!");
          }
        },
        (errorMessage) => {
          // Optional: log scanning process
          console.log("Scanning...", errorMessage);
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      alert("Camera access failed! Make sure it's not in use by another app.");
    }
  } else {
    try {
      await html5QrCode.stop();
      html5QrCode.clear();
      readerDiv.style.display = "none";
      scanBtn.textContent = "Scan QR";
      isScanning = false;
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  }
});

// --- Initial Load ---
loadDashboard();
loadActivity();
animateScore(92);