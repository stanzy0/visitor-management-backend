const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT c.*, a.label as year_label FROM classes c JOIN academic_years a ON c.academic_year_id = a.id ORDER BY a.start_date DESC`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.post('/', authenticateToken, (req, res) => {
  const { academic_year_id, grade_level, section } = req.body;
  db.run(`INSERT INTO classes (academic_year_id, grade_level, section) VALUES (?, ?, ?)`,
    [academic_year_id, grade_level, section], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;