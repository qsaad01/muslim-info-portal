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

app.use('/api/schemes', schemesRoute(pool));
app.use('/api/submissions', submissionsRoute(pool));

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});