const { cleanScheme, isValidScheme } = require('./cleanData');

async function saveSchemes(pool, rawSchemes) {
  let added   = 0;
  let skipped = 0;
  let failed  = 0;

  for (const raw of rawSchemes) {
    try {
      const scheme = cleanScheme(raw);

      if (!isValidScheme(scheme)) {
        console.log('Skipped invalid scheme:', scheme.name || 'unnamed');
        skipped++;
        continue;
      }

      // Check if scheme with same name already exists
      const existing = await pool.query(
        'SELECT id FROM schemes WHERE LOWER(name) = LOWER($1)',
        [scheme.name]
      );

      if (existing.rows.length > 0) {
        console.log('Duplicate skipped:', scheme.name);
        skipped++;
        continue;
      }

      // Save as unverified — you must approve before it shows publicly
      await pool.query(
        `INSERT INTO schemes (
          name, description, eligibility,
          category, location, provider,
          link, contact_name, contact_phone,
          contact_email, contact_address,
          source_url, deadline,
          is_verified, is_active
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
          FALSE, TRUE
        )`,
        [
          scheme.name,
          scheme.description,
          scheme.eligibility,
          scheme.category,
          scheme.location,
          scheme.provider,
          scheme.link,
          scheme.contact_name,
          scheme.contact_phone,
          scheme.contact_email,
          scheme.contact_address,
          scheme.source_url,
          scheme.deadline,
        ]
      );

      console.log('Saved:', scheme.name);
      added++;

    } catch (err) {
      console.error('Error saving scheme:', err.message);
      failed++;
    }
  }

  console.log(`\nScrape complete — Added: ${added} | Skipped: ${skipped} | Failed: ${failed}`);
  return { added, skipped, failed };
}

module.exports = { saveSchemes };