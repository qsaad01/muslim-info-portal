const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const schemesRoute = require('./routes/schemes');
const submissionsRoute = require('./routes/submissions');

const app = express();

/* ===========================
   MIDDLEWARE
=========================== */

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

/* ===========================
   DATABASE CONNECTION
=========================== */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

/* ===========================
   HOMEPAGE
=========================== */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/* ===========================
   API ROUTES
=========================== */

app.use('/api/schemes', schemesRoute(pool));
app.use('/api/submissions', submissionsRoute(pool));

/* ===========================
   STEP 1: UPGRADE DATABASE
=========================== */

app.get('/upgrade-db', async (req, res) => {
  try {
    await pool.query(`ALTER TABLE schemes ADD COLUMN IF NOT EXISTS category TEXT;`);
    await pool.query(`ALTER TABLE schemes ADD COLUMN IF NOT EXISTS provider TEXT;`);
    await pool.query(`ALTER TABLE schemes ADD COLUMN IF NOT EXISTS location TEXT;`);

    res.send('Database upgraded successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Upgrade failed');
  }
});

/* ===========================
   START SERVER
=========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});