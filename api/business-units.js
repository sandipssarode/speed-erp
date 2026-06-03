import { getDb, setCors, ensureSchema } from './_db.js';

// Single serverless function handles both collection and detail routes.
// vercel.json rewrites /api/business-units/:id -> /api/business-units?id=:id
// to stay within the Vercel Hobby 12-function limit.
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    await ensureSchema(sql);

    if (id) {
      if (req.method === 'GET') {
        const rows = await sql`SELECT data FROM business_units WHERE id=${id}`;
        if (!rows.length) return res.status(404).json({ error: 'Not found' });
        return res.json(rows[0].data);
      }
      if (req.method === 'PUT') {
        const b = req.body;
        await sql`UPDATE business_units SET code=${b.locationCode}, contact_name=${b.contactName || null}, state=${b.state || null}, is_active=${b.isActive !== false}, data=${JSON.stringify(b)}, updated_at=${b.updatedAt} WHERE id=${id}`;
        return res.json(b);
      }
      if (req.method === 'DELETE') {
        await sql`DELETE FROM business_units WHERE id=${id}`;
        return res.json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM business_units ORDER BY created_at ASC`;
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const b = req.body;
      await sql`
        INSERT INTO business_units (id, code, contact_name, state, is_active, data, created_at, updated_at)
        VALUES (${b.id}, ${b.locationCode}, ${b.contactName || null}, ${b.state || null}, ${b.isActive !== false}, ${JSON.stringify(b)}, ${b.createdAt}, ${b.updatedAt})`;
      return res.status(201).json(b);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
