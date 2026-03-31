const express = require('express');

module.exports = (pool) => {
  const router = express.Router();

  router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    try {
      await pool.query(
        'INSERT INTO submissions (name, email, message) VALUES ($1, $2, $3)',
        [name, email, message]
      );

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};