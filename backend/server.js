const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const schemesRoute = require('./routes/schemes');
const submissionsRoute = require('./routes/submissions');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/* ===========================
   API ROUTES
=========================== */

app.use('/api/schemes', schemesRoute(pool));
app.use('/api/submissions', submissionsRoute(pool));

/* ===========================
   TEMPORARY SETUP ROUTE
   Creates database tables
=========================== */

app.get('/setup', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        eligibility TEXT,
        link TEXT
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT,
        scheme_id INTEGER
      );
    `);

    res.send('Tables created successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating tables');
  }
});

/* ===========================
   START SERVER
=========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});