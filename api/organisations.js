import { getDb, setCors, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    await ensureSchema(sql);

    if (id) {
      if (req.method === 'GET') {
        const rows = await sql`SELECT data FROM organisations WHERE id=${id}`;
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.json(rows[0].data);
      }
      if (req.method === 'PUT') {
        const o = req.body;
        await sql`UPDATE organisations SET code=${o.companyCode}, name=${o.companyName}, type=${o.type || null}, state=${o.state || null}, data=${JSON.stringify(o)}, updated_at=${o.updatedAt} WHERE id=${id}`;
        return res.json(o);
      }
      if (req.method === 'DELETE') {
        await sql`DELETE FROM organisations WHERE id=${id}`;
        return res.json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM organisations ORDER BY created_at ASC`;
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const o = req.body;
      // Check unique company code
      const existing = await sql`SELECT id FROM organisations WHERE code=${o.companyCode}`;
      if (existing.length) return res.status(409).json({ error: 'Company Code already exists. Please enter a unique code.' });
      await sql`
        INSERT INTO organisations (id, code, name, type, state, data, created_at, updated_at)
        VALUES (${o.id}, ${o.companyCode}, ${o.companyName}, ${o.type || null}, ${o.state || null}, ${JSON.stringify(o)}, ${o.createdAt}, ${o.updatedAt})`;
      return res.status(201).json(o);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
