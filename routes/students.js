const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT s.id, s.enrollment_no, u.full_name, u.email, s.dob, s.gender, s.status, s.enrollment_date, c.grade_level, c.section
    FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.current_class_id = c.id ORDER BY s.enrollment_no`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.get('/:id', authenticateToken, (req, res) => {
  db.get(`SELECT s.*, u.email, u.full_name FROM students s JOIN users u ON s.user_id = u.id WHERE s.id = ?`,
    [req.params.id], (err, row) => { if (err) return res.status(500).json({ error: err.message }); if (!row) return res.status(404).json({ error: 'Student not found' }); res.json(row); });
});

router.post('/', authenticateToken, (req, res) => {
  const { user_id, enrollment_no, dob, gender, class_id } = req.body;
  db.run(`INSERT INTO students (user_id, enrollment_no, dob, gender, current_class_id) VALUES (?, ?, ?, ?, ?)`,
    [user_id, enrollment_no, dob, gender, class_id], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { enrollment_no, dob, gender, class_id, status } = req.body;
  db.run(`UPDATE students SET enrollment_no = ?, dob = ?, gender = ?, current_class_id = ?, status = ? WHERE id = ?`,
    [enrollment_no, dob, gender, class_id, status, req.params.id], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Updated' }); });
});

router.delete('/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM students WHERE id = ?', [req.params.id], function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Deleted' }); });
});

module.exports = router;