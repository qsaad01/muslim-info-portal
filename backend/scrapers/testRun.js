const { Pool } = require('pg');
const { fetchAllSchemes } = require('./fetchSchemes');
const { saveSchemes }     = require('./saveToDb');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://muslimuser:TC1F2wDdzdFCYZ4AntwHem3f4bfb6xiL@dpg-d756f0ea2pns73b1dakg-a.singapore-postgres.render.com/musliminfo',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    const schemes = await fetchAllSchemes();
    console.log('\nSchemes found:', schemes.length);
    console.log('\nFirst scheme preview:');
    console.log(JSON.stringify(schemes[0], null, 2));

    const result = await saveSchemes(pool, schemes);
    console.log('\nFinal result:', result);
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await pool.end();
  }
}

run();
