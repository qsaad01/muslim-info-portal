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

// Serve static frontend files
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
   HOMEPAGE ROUTE
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
   START SERVER
=========================== */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});