const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT v.*, vi.status as visit_status FROM visitors v LEFT JOIN visits vi ON v.id = vi.visitor_id WHERE vi.id IS NULL OR vi.status = 'IN_PROGRESS'`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.post('/checkin', authenticateToken, (req, res) => {
  const { visitor_name, visitor_email, visitor_phone, host_id, purpose } = req.body;
  db.get('SELECT id FROM visitors WHERE email = ?', [visitor_email], (err, row) => {
    let visitorId;
    if (row) visitorId = row.id;
    else db.run('INSERT INTO visitors (full_name, email, phone) VALUES (?, ?, ?)', [visitor_name, visitor_email, visitor_phone], function(err) { visitorId = this.lastID; });
    db.run(`INSERT INTO visits (visitor_id, host_id, purpose) VALUES (?, ?, ?)`, [visitorId, host_id, purpose],
      function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
  });
});

router.put('/checkout/:visitId', authenticateToken, (req, res) => {
  db.run(`UPDATE visits SET check_out = CURRENT_TIMESTAMP, status = 'COMPLETED' WHERE id = ?`,
    [req.params.visitId], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Updated' }); });
});

module.exports = router;