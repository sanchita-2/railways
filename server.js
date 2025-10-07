
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5500;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '00001111',
  database: 'rail_dashboard'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL');
});

// Fetch dashboard stats
app.get('/api/stats', (req, res) => {
  db.query('SELECT COUNT(*) as totalAssets FROM assets', (err, totalRes) => {
    if (err) return res.status(500).json(err);

    db.query('SELECT COUNT(*) as pending FROM assets WHERE status="Pending"', (err2, pendingRes) => {
      if (err2) return res.status(500).json(err2);

      db.query('SELECT * FROM efficiency ORDER BY FIELD(month,"Jan","Feb","Mar","Apr","May","Jun")', (err3, trendRes) => {
        if (err3) return res.status(500).json(err3);

        res.json({
          totalAssets: totalRes[0].totalAssets,
          pendingInspections: pendingRes[0].pending,
          trendData: trendRes
        });
      });
    });
  });
});

// Scan QR (log asset)
app.post('/api/scan', (req, res) => {
  console.log("Received scan POST request:", req.body); // log incoming data
  const { assetId, status } = req.body;

  if (!assetId || !status) {
    console.log("Missing assetId or status");
    return res.status(400).json({ message: "assetId or status missing" });
  }

  db.query(
    'INSERT INTO assets (asset_id, status) VALUES (?, ?)',
    [assetId, status],
    (err, result) => {
      if (err) {
        console.error("MySQL insert error:", err); // log exact error
        return res.status(500).json(err);
      }
      console.log("Insert successful:", result);
      res.json({ message: 'Asset logged', assetId, id: result.insertId });
    }
  );
});

// Fetch recent activity
app.get('/api/activity', (req, res) => {
  db.query('SELECT * FROM assets ORDER BY created_at DESC LIMIT 10', (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));