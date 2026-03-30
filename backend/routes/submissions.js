const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;
  await db.query(
    'INSERT INTO submissions(name,email,message) VALUES($1,$2,$3)',
    [name, email, message]
  );
  res.json({ message: 'Submission received' });
});

module.exports = router;
