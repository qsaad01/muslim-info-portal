const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const result = await db.query('SELECT * FROM schemes ORDER BY deadline');
  res.json(result.rows);
});

router.post('/', async (req, res) => {
  const { name, category, city, deadline } = req.body;
  await db.query(
    'INSERT INTO schemes(name, category, city, deadline) VALUES($1,$2,$3,$4)',
    [name, category, city, deadline]
  );
  res.json({ message: 'Scheme added' });
});

module.exports = router;
