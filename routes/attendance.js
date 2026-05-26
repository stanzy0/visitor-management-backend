const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM attendance ORDER BY date DESC LIMIT 100`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { student_id, class_id, date, status } = req.body;
  db.run(`INSERT INTO attendance (student_id, class_id, date, status) VALUES (?, ?, ?, ?)`,
    [student_id, class_id, date, status], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE attendance SET status = ? WHERE id = ?`, [status, req.params.id],
    function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Updated' }); });
});

module.exports = router;