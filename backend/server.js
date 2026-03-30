const express = require('express');
const cors = require('cors');
const schemesRoute = require('./routes/schemes');
const submissionsRoute = require('./routes/submissions');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/schemes', schemesRoute);
app.use('/api/submissions', submissionsRoute);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
