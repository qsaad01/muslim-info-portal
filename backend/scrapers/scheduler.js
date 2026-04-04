const cron              = require('node-cron');
const { fetchAllSchemes } = require('./fetchSchemes');
const { saveSchemes }     = require('./saveToDb');

function startScheduler(pool) {

  // ── Run every Sunday at 2:00 AM ──────────────────
  cron.schedule('0 2 * * 0', async () => {
    console.log('\n[Scheduler] Weekly scrape started —', new Date().toISOString());
    try {
      const schemes = await fetchAllSchemes();
      const result  = await saveSchemes(pool, schemes);
      console.log('[Scheduler] Done —', result);
    } catch (err) {
      console.error('[Scheduler] Scrape failed:', err.message);
    }
  });

  console.log('[Scheduler] Scraper scheduled — runs every Sunday at 2:00 AM');
}

module.exports = { startScheduler };