import { getDb, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM vendors WHERE id=${id}`;
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0].data);
    }
    if (req.method === 'PUT') {
      const v = req.body;
      await sql`UPDATE vendors SET code=${v.code}, name=${v.name}, is_deactivated=${v.isDeactivated||false}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
      return res.json(v);
    }
    if (req.method === 'DELETE') {
      await sql`DELETE FROM vendors WHERE id=${id}`;
      return res.json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
