const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM exams ORDER BY date DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { subject_id, exam_type, date, max_marks } = req.body;
  db.run(`INSERT INTO exams (subject_id, exam_type_id, date, max_marks) VALUES (?, ?, ?, ?)`,
    [subject_id, exam_type, date, max_marks], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;