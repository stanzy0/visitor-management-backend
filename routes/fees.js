const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const db = require('../models/db');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM fee_invoices ORDER BY due_date DESC`, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message }); res.json(rows);
  });
});

router.post('/invoices', authenticateToken, (req, res) => {
  const { student_id, academic_year_id, due_date, total_amount } = req.body;
  db.run(`INSERT INTO fee_invoices (student_id, academic_year_id, due_date, total_amount) VALUES (?, ?, ?, ?)`,
    [student_id, academic_year_id, due_date, total_amount], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

router.post('/payments', authenticateToken, (req, res) => {
  const { invoice_id, amount, payment_method, transaction_id } = req.body;
  db.run(`INSERT INTO payments (invoice_id, amount, payment_method, transaction_id) VALUES (?, ?, ?, ?)`,
    [invoice_id, amount, payment_method, transaction_id], function(err) { if (err) return res.status(500).json({ error: err.message }); res.status(201).json({ id: this.lastID }); });
});

module.exports = router;