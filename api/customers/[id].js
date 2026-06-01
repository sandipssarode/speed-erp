import { getDb, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM customers WHERE id=${id}`;
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0].data);
    }
    if (req.method === 'PUT') {
      const c = req.body;
      await sql`UPDATE customers SET code=${c.code}, name=${c.name}, is_deactivated=${c.isDeactivated||false}, data=${JSON.stringify(c)}, updated_at=${c.updatedAt} WHERE id=${id}`;
      return res.json(c);
    }
    if (req.method === 'DELETE') {
      await sql`DELETE FROM customers WHERE id=${id}`;
      return res.json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
