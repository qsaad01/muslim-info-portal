const axios   = require('axios');
const cheerio = require('cheerio');

// Shared axios settings — pretends to be a real browser
const axiosConfig = {
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-IN,en;q=0.9',
  }
};

// ─────────────────────────────────────────────
// SOURCE 1: National Scholarship Portal
// Fetches central government minority schemes
// ─────────────────────────────────────────────
async function scrapeNSP() {
  console.log('Scraping National Scholarship Portal...');
  const schemes = [];

  try {
    const { data } = await axios.get(
      'https://scholarships.gov.in/public/schemeGuidelines/schemeGuidelines.htm',
      axiosConfig
    );
    const $ = cheerio.load(data);

    $('table tr').each((i, row) => {
      if (i === 0) return; // skip header row
      const cols = $(row).find('td');
      if (cols.length < 2) return;

      const name = $(cols[0]).text().trim();
      const link = $(cols[1]).find('a').attr('href') || '';

      if (name && name.length > 5) {
        schemes.push({
          name:        name,
          description: 'Government scholarship scheme listed on National Scholarship Portal.',
          eligibility: 'See official NSP website for full eligibility criteria.',
          category:    'Government',
          location:    'India',
          provider:    'Ministry of Minority Affairs',
          link:        link.startsWith('http') ? link : 'https://scholarships.gov.in' + link,
          contact_name:  'NSP Helpdesk',
          contact_phone: '0120-6619540',
          contact_email: 'helpdesk@nsp.gov.in',
          source_url:  'https://scholarships.gov.in',
        });
      }
    });

    console.log(`NSP: found ${schemes.length} schemes`);
  } catch (err) {
    console.error('NSP scrape failed:', err.message);
  }

  return schemes;
}

// ─────────────────────────────────────────────
// SOURCE 2: MahaDBT Maharashtra
// Fetches Maharashtra state schemes
// ─────────────────────────────────────────────
async function scrapeMahaDBT() {
  console.log('Scraping MahaDBT...');
  const schemes = [];

  try {
    const { data } = await axios.get(
      'https://mahadbt.maharashtra.gov.in/SchemeData/SchemeData',
      axiosConfig
    );
    const $ = cheerio.load(data);

    // MahaDBT lists schemes in a table or list — grab all scheme names
    $('.scheme-name, .schemeName, table tr td:first-child').each((i, el) => {
      const name = $(el).text().trim();
      if (name && name.length > 5 && name.length < 200) {
        schemes.push({
          name:        name,
          description: 'Maharashtra state scheme available through MahaDBT portal.',
          eligibility: 'Domicile of Maharashtra required. See MahaDBT for full criteria.',
          category:    'State Government',
          location:    'Maharashtra',
          provider:    'Government of Maharashtra',
          link:        'https://mahadbt.maharashtra.gov.in',
          contact_name:  'MahaDBT Helpdesk',
          contact_phone: '022-22025251',
          contact_email: 'helpdesk.mahadbt@maharashtra.gov.in',
          contact_address: 'Mantralaya, Madam Cama Road, Mumbai - 400032',
          source_url:  'https://mahadbt.maharashtra.gov.in',
        });
      }
    });

    console.log(`MahaDBT: found ${schemes.length} schemes`);
  } catch (err) {
    console.error('MahaDBT scrape failed:', err.message);
  }

  return schemes;
}

// ─────────────────────────────────────────────
// SOURCE 3: Maulana Azad Education Foundation
// ─────────────────────────────────────────────
async function scrapeMAEF() {
  console.log('Scraping MAEF...');
  const schemes = [];

  try {
    const { data } = await axios.get(
      'https://maef.net.in/view_schemes.php',
      axiosConfig
    );
    const $ = cheerio.load(data);

    $('table tr').each((i, row) => {
      if (i === 0) return;
      const cols    = $(row).find('td');
      const name    = $(cols[0]).text().trim();
      const desc    = $(cols[1]).text().trim();
      const linkTag = $(cols[2]).find('a').attr('href') || '';

      if (name && name.length > 5) {
        schemes.push({
          name:        name,
          description: desc || 'Education scheme by Maulana Azad Education Foundation.',
          eligibility: 'Minority community students. See MAEF website for details.',
          category:    'Government',
          location:    'India',
          provider:    'Maulana Azad Education Foundation',
          link:        linkTag.startsWith('http') ? linkTag : 'https://maef.net.in/' + linkTag,
          contact_name:  'MAEF Office',
          contact_phone: '011-23583788',
          contact_email: 'info@maef.net.in',
          contact_address: 'Chelmsford Road, New Delhi - 110055',
          source_url:  'https://maef.net.in',
        });
      }
    });

    console.log(`MAEF: found ${schemes.length} schemes`);
  } catch (err) {
    console.error('MAEF scrape failed:', err.message);
  }

  return schemes;
}

// ─────────────────────────────────────────────
// SOURCE 4: Minority Affairs Maharashtra
// ─────────────────────────────────────────────
async function scrapeMinorityMaharashtra() {
  console.log('Scraping Maharashtra Minority Affairs...');
  const schemes = [];

  try {
    const { data } = await axios.get(
      'https://www.minorityaffairs.gov.in/en/schemes',
      axiosConfig
    );
    const $ = cheerio.load(data);

    // Try common selectors for scheme listings
    $('h3, h4, .scheme-title, .views-field-title').each((i, el) => {
      const name    = $(el).text().trim();
      const link    = $(el).find('a').attr('href')
                   || $(el).closest('a').attr('href')
                   || '';

      if (name && name.length > 5 && name.length < 200) {
        schemes.push({
          name:        name,
          description: 'Scheme by Ministry of Minority Affairs, Government of India.',
          eligibility: 'Minority communities — Muslim, Christian, Sikh, Buddhist, Jain, Parsi.',
          category:    'Government',
          location:    'India',
          provider:    'Ministry of Minority Affairs',
          link:        link.startsWith('http') ? link : 'https://www.minorityaffairs.gov.in' + link,
          contact_name:  'Ministry of Minority Affairs',
          contact_phone: '011-23382545',
          contact_email: 'helpline-mma@gov.in',
          contact_address: 'CGO Complex, Lodhi Road, New Delhi - 110003',
          source_url:  'https://www.minorityaffairs.gov.in',
        });
      }
    });

    console.log(`Minority Affairs: found ${schemes.length} schemes`);
  } catch (err) {
    console.error('Minority Affairs scrape failed:', err.message);
  }

  return schemes;
}

// ─────────────────────────────────────────────
// MAIN — runs all scrapers and combines results
// ─────────────────────────────────────────────
async function fetchAllSchemes() {
  console.log('\n====== Starting scrape ======\n');

  const results = await Promise.allSettled([
    scrapeNSP(),
    scrapeMahaDBT(),
    scrapeMAEF(),
    scrapeMinorityMaharashtra(),
  ]);

  const allSchemes = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      allSchemes.push(...result.value);
    } else {
      console.error(`Scraper ${i} failed:`, result.reason);
    }
  });

  console.log(`\nTotal schemes found across all sources: ${allSchemes.length}`);
  return allSchemes;
}

module.exports = { fetchAllSchemes };