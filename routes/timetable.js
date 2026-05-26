const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT t.*, s.name as subject_name, st.full_name as teacher_name, c.grade_level, c.section
    FROM timetable t JOIN subjects s ON t.subject_id = s.id JOIN staff st ON t.teacher_id = st.id JOIN classes c ON t.class_id = c.id ORDER BY t.day_of_week, t.start_time`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.post('/', authenticateToken, (req, res) => {
  const { class_id, teacher_id, subject_id, day_of_week, start_time, end_time } = req.body;
  db.run(`INSERT INTO timetable (class_id, teacher_id, subject_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)`,
    [class_id, teacher_id, subject_id, day_of_week, start_time, end_time], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;