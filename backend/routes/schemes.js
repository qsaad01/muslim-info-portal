const express = require('express');
const cache = require('../utils/cache');

module.exports = (pool) => {
  const router = express.Router();

  router.get('/', async (req, res) => {
    const page     = parseInt(req.query.page)     || 1;
    const limit    = parseInt(req.query.limit)    || 20;
    const search   = req.query.search             || '';
    const category = req.query.category           || '';
    const location = req.query.location           || '';

    const cacheKey = `schemes_${page}_${limit}_${search}_${category}_${location}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    try {
      let conditions = ['is_active = TRUE', 'is_verified = TRUE'];
      const params = [];

      if (search) {
        params.push(`%${search}%`);
        conditions.push(
          `(name ILIKE $${params.length} OR description ILIKE $${params.length})`
        );
      }

      if (category) {
        params.push(category);
        conditions.push(`category = $${params.length}`);
      }

      if (location) {
        params.push(location);
        conditions.push(`location = $${params.length}`);
      }

      const whereClause = conditions.join(' AND ');

      const countResult = await pool.query(
        `SELECT COUNT(*) FROM schemes WHERE ${whereClause}`,
        params
      );
      const total      = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / limit);
      const offset     = (page - 1) * limit;

      const dataParams = [...params, limit, offset];
      const result = await pool.query(
        `SELECT id, name, description, eligibility, link,
                category, provider, location,
                contact_name, contact_phone, contact_email,
                contact_address, deadline, source_url
         FROM schemes
         WHERE ${whereClause}
         ORDER BY id DESC
         LIMIT $${dataParams.length - 1}
         OFFSET $${dataParams.length}`,
        dataParams
      );

      const response = {
        data:       result.rows,
        total:      total,
        page:       page,
        totalPages: totalPages
      };

      cache.set(cacheKey, response);
      res.json(response);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};