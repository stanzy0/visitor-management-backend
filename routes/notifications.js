const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/announcements', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM announcements WHERE expires_at IS NULL OR expires_at > datetime('now') ORDER BY created_at DESC`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.post('/announcements', authenticateToken, (req, res) => {
  const { title, content, priority, target_audience, expires_at } = req.body;
  db.run(`INSERT INTO announcements (title, content, priority, target_audience, expires_at) VALUES (?, ?, ?, ?, ?)`,
    [title, content, priority, target_audience, expires_at], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;