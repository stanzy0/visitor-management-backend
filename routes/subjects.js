const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM subjects ORDER BY code`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); res.json(rows);
  });
});

router.post('/', authenticateToken, (req, res) => {
  const { code, name, description, department } = req.body;
  db.run(`INSERT INTO subjects (code, name, description, department) VALUES (?, ?, ?, ?)`,
    [code, name, description, department], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;