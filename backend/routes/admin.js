const express   = require('express');
const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const router    = express.Router();

const JWT_SECRET    = process.env.JWT_SECRET    || 'muslim-info-portal-secret-key-2024';
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// ── Middleware: check if logged in ─────────────
function requireAuth(req, res, next) {
  const token = req.cookies && req.cookies.adminToken;
  if (!token) return res.redirect('/admin/login');
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.redirect('/admin/login');
  }
}

// ── Login page ─────────────────────────────────
router.get('/login', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Admin Login</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); width: 100%; max-width: 380px; }
    h1 { font-size: 22px; color: #2c3e50; margin-bottom: 6px; }
    p { font-size: 13px; color: #888; margin-bottom: 28px; }
    label { font-size: 13px; color: #555; display: block; margin-bottom: 6px; }
    input { width: 100%; padding: 10px 14px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; margin-bottom: 20px; }
    input:focus { outline: none; border-color: #3498db; }
    button { width: 100%; padding: 12px; background: #2c3e50; color: white; border: none; border-radius: 6px; font-size: 15px; cursor: pointer; }
    button:hover { background: #1a252f; }
    .error { background: #fdecea; color: #c0392b; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 16px; display: ${req.query.error ? 'block' : 'none'}; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Muslim Info Portal</h1>
    <p>Admin Panel — authorised access only</p>
    <div class="error">Incorrect password. Please try again.</div>
    <form method="POST" action="/admin/login">
      <label>Admin Password</label>
      <input type="password" name="password" placeholder="Enter your password" autofocus required>
      <button type="submit">Log In</button>
    </form>
  </div>
</body>
</html>`);
});

// ── Login POST ─────────────────────────────────
router.post('/login', async (req, res) => {
  const { password } = req.body;
  try {
    const valid = await bcrypt.compare(password, PASSWORD_HASH);
    if (!valid) return res.redirect('/admin/login?error=1');

    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '8h' });
    res.cookie('adminToken', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
    res.redirect('/admin/dashboard');
  } catch (err) {
    res.redirect('/admin/login?error=1');
  }
});

// ── Logout ─────────────────────────────────────
router.get('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.redirect('/admin/login');
});

// ── Dashboard ──────────────────────────────────
router.get('/dashboard', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const counts = await pool.query(`
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE is_verified = FALSE) AS pending,
      COUNT(*) FILTER (WHERE is_verified = TRUE)  AS verified
    FROM schemes
  `);
  const { total, pending, verified } = counts.rows[0];

  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Admin Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #f0f2f5; }
    nav { background: #2c3e50; padding: 14px 24px; display: flex; justify-content: space-between; align-items: center; }
    nav h1 { color: white; font-size: 18px; }
    nav a { color: #aaa; text-decoration: none; font-size: 13px; }
    nav a:hover { color: white; }
    .container { max-width: 1100px; margin: 30px auto; padding: 0 16px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 30px; }
    .stat { background: white; padding: 24px; border-radius: 10px; text-align: center; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .stat .num { font-size: 36px; font-weight: 700; color: #2c3e50; }
    .stat .label { font-size: 13px; color: #888; margin-top: 4px; }
    .actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .action-card { background: white; padding: 24px; border-radius: 10px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .action-card h2 { font-size: 16px; color: #2c3e50; margin-bottom: 8px; }
    .action-card p { font-size: 13px; color: #888; margin-bottom: 16px; }
    .btn { display: inline-block; padding: 10px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; text-decoration: none; }
    .btn-primary { background: #3498db; color: white; }
    .btn-warning { background: #e67e22; color: white; }
    .btn-success { background: #27ae60; color: white; }
    .btn-danger  { background: #e74c3c; color: white; }
    @media(max-width:600px){ .stats,.actions{ grid-template-columns:1fr; } }
  </style>
</head>
<body>
<nav>
  <h1>Muslim Info Portal — Admin</h1>
  <a href="/admin/logout">Log out</a>
</nav>
<div class="container">
  <div class="stats">
    <div class="stat"><div class="num">${total}</div><div class="label">Total schemes</div></div>
    <div class="stat"><div class="num" style="color:#e67e22">${pending}</div><div class="label">Pending approval</div></div>
    <div class="stat"><div class="num" style="color:#27ae60">${verified}</div><div class="label">Live on site</div></div>
  </div>
  <div class="actions">
    <div class="action-card">
      <h2>Pending schemes</h2>
      <p>Review schemes scraped automatically — approve or reject each one before it goes live.</p>
      <a href="/admin/pending" class="btn btn-warning">Review pending (${pending})</a>
    </div>
    <div class="action-card">
      <h2>All schemes</h2>
      <p>See all live schemes on your portal. Edit or delete any scheme at any time.</p>
      <a href="/admin/schemes" class="btn btn-primary">View all schemes</a>
    </div>
    <div class="action-card">
      <h2>Add new scheme</h2>
      <p>Manually add a verified scheme collected from your Google Form or fieldwork.</p>
      <a href="/admin/add" class="btn btn-success">Add scheme</a>
    </div>
    <div class="action-card">
      <h2>Run scraper now</h2>
      <p>Manually trigger the scraper instead of waiting for Sunday. New schemes go to pending.</p>
      <a href="/admin/scrape" class="btn btn-danger">Run scraper</a>
    </div>
  </div>
</div>
</body>
</html>`);
});

// ── Pending schemes ────────────────────────────
router.get('/pending', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const result = await pool.query(
    `SELECT * FROM schemes WHERE is_verified = FALSE ORDER BY id DESC`
  );
  const rows = result.rows;

  const cards = rows.length === 0
    ? '<p style="color:#888;text-align:center;padding:40px">No pending schemes. Everything is reviewed!</p>'
    : rows.map(s => `
      <div style="background:white;border-radius:10px;padding:20px;margin-bottom:16px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
          <div style="flex:1">
            <h3 style="font-size:16px;color:#2c3e50;margin-bottom:6px">${s.name}</h3>
            <span style="background:#f0f2f5;padding:3px 10px;border-radius:20px;font-size:12px;color:#555">${s.category}</span>
            <span style="background:#f0f2f5;padding:3px 10px;border-radius:20px;font-size:12px;color:#555;margin-left:6px">${s.location}</span>
            <p style="margin-top:10px;font-size:13px;color:#555">${(s.description || '').substring(0, 150)}...</p>
            <p style="font-size:12px;color:#888;margin-top:6px"><strong>Provider:</strong> ${s.provider || 'N/A'}</p>
            <p style="font-size:12px;color:#888"><strong>Phone:</strong> ${s.contact_phone || 'N/A'} &nbsp;|&nbsp; <strong>Email:</strong> ${s.contact_email || 'N/A'}</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;min-width:120px">
            <a href="/admin/approve/${s.id}" style="background:#27ae60;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;text-align:center">Approve</a>
            <a href="/admin/edit/${s.id}" style="background:#3498db;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;text-align:center">Edit first</a>
            <a href="/admin/delete/${s.id}" style="background:#e74c3c;color:white;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;text-align:center" onclick="return confirm('Delete this scheme?')">Reject</a>
          </div>
        </div>
      </div>`).join('');

  res.send(adminPage('Pending Schemes', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="font-size:20px;color:#2c3e50">Pending Schemes (${rows.length})</h2>
      <a href="/admin/dashboard" style="color:#3498db;font-size:13px">Back to dashboard</a>
    </div>
    ${cards}
  `));
});

// ── All schemes ────────────────────────────────
router.get('/schemes', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const result = await pool.query(
    `SELECT id, name, category, location, is_verified, is_active FROM schemes ORDER BY id DESC`
  );
  const rows = result.rows;

  const tableRows = rows.map(s => `
    <tr>
      <td>${s.id}</td>
      <td style="max-width:200px">${s.name}</td>
      <td>${s.category}</td>
      <td>${s.location}</td>
      <td><span style="background:${s.is_verified ? '#d1e7dd' : '#fff3cd'};color:${s.is_verified ? '#0a3622' : '#856404'};padding:2px 8px;border-radius:10px;font-size:12px">${s.is_verified ? 'Live' : 'Pending'}</span></td>
      <td style="white-space:nowrap">
        <a href="/admin/edit/${s.id}" style="color:#3498db;font-size:13px;margin-right:10px">Edit</a>
        <a href="/admin/delete/${s.id}" style="color:#e74c3c;font-size:13px" onclick="return confirm('Delete this scheme?')">Delete</a>
      </td>
    </tr>`).join('');

  res.send(adminPage('All Schemes', `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="font-size:20px;color:#2c3e50">All Schemes (${rows.length})</h2>
      <a href="/admin/dashboard" style="color:#3498db;font-size:13px">Back to dashboard</a>
    </div>
    <div style="background:white;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,0.08);overflow:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f8f9fa;border-bottom:1px solid #eee">
            <th style="padding:12px 16px;text-align:left;color:#555">ID</th>
            <th style="padding:12px 16px;text-align:left;color:#555">Name</th>
            <th style="padding:12px 16px;text-align:left;color:#555">Category</th>
            <th style="padding:12px 16px;text-align:left;color:#555">Location</th>
            <th style="padding:12px 16px;text-align:left;color:#555">Status</th>
            <th style="padding:12px 16px;text-align:left;color:#555">Actions</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `));
});

// ── Approve ────────────────────────────────────
router.get('/approve/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  await pool.query(
    `UPDATE schemes SET is_verified = TRUE WHERE id = $1`,
    [req.params.id]
  );
  res.redirect('/admin/pending');
});

// ── Delete ─────────────────────────────────────
router.get('/delete/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  await pool.query('DELETE FROM schemes WHERE id = $1', [req.params.id]);
  const ref = req.headers.referer || '/admin/schemes';
  res.redirect(ref);
});

// ── Add scheme form ────────────────────────────
router.get('/add', requireAuth, (req, res) => {
  res.send(adminPage('Add Scheme', schemeForm({})));
});

// ── Add scheme POST ────────────────────────────
router.post('/add', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const f = req.body;
  await pool.query(`
    INSERT INTO schemes
      (name,description,eligibility,link,category,location,provider,
       contact_name,contact_phone,contact_email,contact_address,
       deadline,source_url,is_verified,is_active)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,TRUE,TRUE)`,
    [f.name, f.description, f.eligibility, f.link, f.category,
     f.location, f.provider, f.contact_name, f.contact_phone,
     f.contact_email, f.contact_address,
     f.deadline || null, f.source_url]
  );
  res.redirect('/admin/schemes');
});

// ── Edit scheme form ───────────────────────────
router.get('/edit/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const result = await pool.query('SELECT * FROM schemes WHERE id = $1', [req.params.id]);
  const scheme = result.rows[0];
  if (!scheme) return res.redirect('/admin/schemes');
  res.send(adminPage('Edit Scheme', schemeForm(scheme, true)));
});

// ── Edit scheme POST ───────────────────────────
router.post('/edit/:id', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  const f = req.body;
  await pool.query(`
    UPDATE schemes SET
      name=$1, description=$2, eligibility=$3, link=$4,
      category=$5, location=$6, provider=$7,
      contact_name=$8, contact_phone=$9, contact_email=$10,
      contact_address=$11, deadline=$12, source_url=$13,
      is_verified=$14
    WHERE id=$15`,
    [f.name, f.description, f.eligibility, f.link, f.category,
     f.location, f.provider, f.contact_name, f.contact_phone,
     f.contact_email, f.contact_address,
     f.deadline || null, f.source_url,
     f.is_verified === 'true', req.params.id]
  );
  res.redirect('/admin/schemes');
});

// ── Run scraper manually ───────────────────────
router.get('/scrape', requireAuth, async (req, res) => {
  const pool = req.app.get('pool');
  try {
    const { fetchAllSchemes } = require('../scrapers/fetchSchemes');
    const { saveSchemes }     = require('../scrapers/saveToDb');
    const schemes  = await fetchAllSchemes();
    const result   = await saveSchemes(pool, schemes);
    res.send(adminPage('Scraper Result', `
      <div style="background:white;border-radius:10px;padding:30px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
        <h2 style="color:#2c3e50;margin-bottom:20px">Scrape Complete</h2>
        <p style="font-size:18px;color:#27ae60;margin-bottom:8px">Added: <strong>${result.added}</strong></p>
        <p style="font-size:18px;color:#888;margin-bottom:8px">Skipped (duplicates): <strong>${result.skipped}</strong></p>
        <p style="font-size:18px;color:#e74c3c;margin-bottom:24px">Failed: <strong>${result.failed}</strong></p>
        <a href="/admin/pending" style="background:#3498db;color:white;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px">Review pending schemes</a>
      </div>
    `));
  } catch (err) {
    res.send(adminPage('Scraper Error', `<p style="color:red">Error: ${err.message}</p>`));
  }
});

// ── Helper: shared page layout ─────────────────
function adminPage(title, content) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>${title} — Admin</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;background:#f0f2f5}
    nav{background:#2c3e50;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
    nav h1{color:white;font-size:16px}
    nav div{display:flex;gap:20px}
    nav a{color:#aaa;text-decoration:none;font-size:13px}
    nav a:hover{color:white}
    .container{max-width:1100px;margin:30px auto;padding:0 16px}
  </style>
</head>
<body>
<nav>
  <h1>Muslim Info Portal — Admin</h1>
  <div>
    <a href="/admin/dashboard">Dashboard</a>
    <a href="/admin/pending">Pending</a>
    <a href="/admin/schemes">All Schemes</a>
    <a href="/admin/add">Add Scheme</a>
    <a href="/admin/logout">Log out</a>
  </div>
</nav>
<div class="container">${content}</div>
</body>
</html>`;
}

// ── Helper: scheme form ────────────────────────
function schemeForm(s, isEdit = false) {
  const action = isEdit ? `/admin/edit/${s.id}` : '/admin/add';
  const v = (val) => val || '';
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
      <h2 style="font-size:20px;color:#2c3e50">${isEdit ? 'Edit Scheme' : 'Add New Scheme'}</h2>
      <a href="/admin/schemes" style="color:#3498db;font-size:13px">Back to schemes</a>
    </div>
    <div style="background:white;border-radius:10px;padding:28px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <form method="POST" action="${action}">
      ${field('Scheme Name *', 'name', v(s.name))}
      ${textarea('Description *', 'description', v(s.description))}
      ${textarea('Eligibility *', 'eligibility', v(s.eligibility))}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${selectField('Category *', 'category', v(s.category), ['Government','State Government','NGO'])}
        ${selectField('Location *', 'location', v(s.location), ['India','Maharashtra','Mumbai','Pune'])}
      </div>
      ${field('Provider / Organisation *', 'provider', v(s.provider))}
      ${field('Official Website / Application Link', 'link', v(s.link))}
      ${field('Deadline (optional)', 'deadline', v(s.deadline ? s.deadline.toString().substring(0,10) : ''), 'date')}
      <hr style="margin:20px 0;border:none;border-top:1px solid #eee">
      <p style="font-size:13px;color:#888;margin-bottom:16px;font-weight:bold">Contact Information</p>
      ${field('Contact Person / Office Name', 'contact_name', v(s.contact_name))}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${field('Phone Number', 'contact_phone', v(s.contact_phone), 'tel')}
        ${field('Email Address', 'contact_email', v(s.contact_email), 'email')}
      </div>
      ${textarea('Office Address', 'contact_address', v(s.contact_address), 2)}
      ${field('Source URL', 'source_url', v(s.source_url))}
      ${isEdit ? `
      <div style="margin-bottom:16px">
        <label style="font-size:13px;color:#555;display:block;margin-bottom:6px">Status</label>
        <select name="is_verified" style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
          <option value="true" ${s.is_verified ? 'selected' : ''}>Live (verified)</option>
          <option value="false" ${!s.is_verified ? 'selected' : ''}>Pending (hidden)</option>
        </select>
      </div>` : ''}
      <button type="submit" style="background:#2c3e50;color:white;padding:12px 28px;border:none;border-radius:6px;font-size:15px;cursor:pointer;margin-top:8px">
        ${isEdit ? 'Save Changes' : 'Add Scheme'}
      </button>
    </form>
    </div>`;
}

function field(label, name, value, type='text') {
  return `<div style="margin-bottom:16px">
    <label style="font-size:13px;color:#555;display:block;margin-bottom:6px">${label}</label>
    <input type="${type}" name="${name}" value="${value}"
      style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
  </div>`;
}

function textarea(label, name, value, rows=3) {
  return `<div style="margin-bottom:16px">
    <label style="font-size:13px;color:#555;display:block;margin-bottom:6px">${label}</label>
    <textarea name="${name}" rows="${rows}"
      style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px;resize:vertical">${value}</textarea>
  </div>`;
}

function selectField(label, name, value, options) {
  return `<div style="margin-bottom:16px">
    <label style="font-size:13px;color:#555;display:block;margin-bottom:6px">${label}</label>
    <select name="${name}" style="width:100%;padding:9px 12px;border:1px solid #ddd;border-radius:6px;font-size:14px">
      ${options.map(o => `<option value="${o}" ${value===o?'selected':''}>${o}</option>`).join('')}
    </select>
  </div>`;
}

module.exports = router;