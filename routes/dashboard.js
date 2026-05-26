const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/stats', authenticateToken, (req, res) => {
  db.get('SELECT COUNT(*) as count FROM students', (err, row) => {
    const stats = { totalStudents: row.count };
    db.get(`SELECT COUNT(*) as count FROM attendance WHERE date = date('now')`, (err, row) => {
      stats.todayAttendance = row.count;
      res.json(stats);
    });
  });
});

module.exports = router;