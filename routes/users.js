const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT u.id, u.email, u.full_name, u.status, u.created_at, r.name as role_name
    FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.created_at DESC`,
    (err, rows) => { if (err) return res.status(500).json({ error: err.message }); res.json(rows); });
});

router.get('/:id', authenticateToken, (req, res) => {
  db.get(`SELECT u.id, u.email, u.full_name, u.status, r.name as role_name
    FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?`,
    [req.params.id], (err, row) => { if (err) return res.status(500).json({ error: err.message }); if (!row) return res.status(404).json({ error: 'User not found' }); res.json(row); });
});

router.put('/:id', authenticateToken, (req, res) => {
  const { full_name, status } = req.body;
  db.run(`UPDATE users SET full_name = ?, status = ? WHERE id = ?`, [full_name, status, req.params.id],
    function(err) { if (err) return res.status(500).json({ error: err.message }); res.json({ message: 'Updated' }); });
});

module.exports = router;