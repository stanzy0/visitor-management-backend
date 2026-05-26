const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT a.*, s.full_name as student_name, s.enrollment_no FROM applications a JOIN inquiries i ON a.inquiry_id = i.id JOIN students s ON a.student_id = s.id ORDER BY a.application_date DESC`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.post('/', authenticateToken, (req, res) => {
  const { inquiry_id, entrance_score, reviewer_id } = req.body;
  db.run(`INSERT INTO applications (inquiry_id, application_date, entrance_score, reviewer_id) VALUES (?, date('now'), ?, ?)`,
    [inquiry_id, entrance_score, reviewer_id], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { status, review_notes } = req.body;
  db.run(`UPDATE applications SET status = ?, review_notes = ? WHERE id = ?`, [status, review_notes, req.params.id],
    function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Updated' }); });
});

module.exports = router;