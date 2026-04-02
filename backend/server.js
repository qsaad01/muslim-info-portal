const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
const schemesRoute = require('./routes/schemes');
const submissionsRoute = require('./routes/submissions');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.static(path.join(__dirname, '../frontend')));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use('/api/schemes', schemesRoute(pool));
app.use('/api/submissions', submissionsRoute(pool));

/* ===========================
   INSERT REAL DATA
=========================== */
app.get('/insert-real-data', async (req, res) => {
  try {
    await pool.query(`
      INSERT INTO schemes (name, description, eligibility, link, category, provider, location)
      VALUES
      ('Pre-Matric Scholarship for Minorities',
       'Financial support for minority students studying in school.',
       'Minority students with family income below ₹1 lakh.',
       'https://scholarships.gov.in',
       'Government',
       'Ministry of Minority Affairs',
       'India'),
      ('Post-Matric Scholarship for Minorities',
       'Scholarship for students studying from class 11 to postgraduate.',
       'Minority students with income below ₹2 lakh.',
       'https://scholarships.gov.in',
       'Government',
       'Ministry of Minority Affairs',
       'India'),
      ('Merit-cum-Means Scholarship',
       'Support for professional courses like engineering, medicine.',
       'Minority students with income below ₹2.5 lakh.',
       'https://scholarships.gov.in',
       'Government',
       'Ministry of Minority Affairs',
       'India'),
      ('Begum Hazrat Mahal Scholarship',
       'Scholarship for minority girls in India.',
       'Girl students from minority communities.',
       'https://scholarships.gov.in',
       'Government',
       'Ministry of Minority Affairs',
       'India'),
      ('Padho Pardesh Scheme',
       'Interest subsidy for students studying abroad.',
       'Minority students pursuing higher education overseas.',
       'https://scholarships.gov.in',
       'Government',
       'Ministry of Minority Affairs',
       'India'),
      ('Maharashtra Minority Scholarship',
       'Financial aid for minority students in Maharashtra.',
       'Students domiciled in Maharashtra.',
       'https://mahadbt.maharashtra.gov.in',
       'State Government',
       'Minority Development Dept, Maharashtra',
       'Maharashtra'),
      ('Tata Trusts Education Grant',
       'Financial assistance for higher education.',
       'Students studying in recognized institutions.',
       'https://www.tatatrusts.org',
       'NGO',
       'Tata Trusts',
       'India'),
      ('Azim Premji Foundation Scholarship',
       'Support for education and development programs.',
       'Students from low-income backgrounds.',
       'https://azimpremjifoundation.org',
       'NGO',
       'Azim Premji Foundation',
       'India'),
      ('Concern India Foundation Support',
       'Grants for education and healthcare.',
       'Underprivileged communities.',
       'https://www.concernindiafoundation.org',
       'NGO',
       'Concern India Foundation',
       'India');
    `);
    res.send('Real schemes inserted successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Insert failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});