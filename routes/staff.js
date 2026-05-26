const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT s.*, u.email, u.full_name FROM staff s JOIN users u ON s.user_id = u.id ORDER BY u.full_name`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.post('/', authenticateToken, (req, res) => {
  const { user_id, employee_id, designation, department } = req.body;
  db.run(`INSERT INTO staff (user_id, employee_id, designation, department) VALUES (?, ?, ?, ?)`,
    [user_id, employee_id, designation, department], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;