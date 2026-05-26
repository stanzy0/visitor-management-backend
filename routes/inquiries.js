const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM inquiries ORDER BY created_at DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { first_name, last_name, email, phone, grade_applying, source } = req.body;
  db.run(`INSERT INTO inquiries (first_name, last_name, email, phone, grade_applying, source) VALUES (?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone, grade_applying, source], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { status, next_followup } = req.body;
  db.run(`UPDATE inquiries SET status = ?, next_followup = ? WHERE id = ?`, [status, next_followup, req.params.id],
    function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Updated' }); });
});

module.exports = router;