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
   TEMPORARY ROUTE
   Inserts one sample scheme
=========================== */

app.get('/add-sample', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO schemes (name, description, eligibility, link)
      VALUES (
        'Scholarship for Minority Students',
        'Government scholarship for minority community students.',
        'Students from recognized minority communities',
        'https://scholarships.gov.in'
      );
    `);

    res.send('Sample scheme inserted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Insert failed');
  }
});

/* ===========================
   START SERVER
=========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});