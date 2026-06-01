import { getDb, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM users WHERE id=${id}`;
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      const d = rows[0].data; delete d.password;
      return res.json(d);
    }
    if (req.method === 'PUT') {
      const u = req.body;
      // If password provided update it, else keep existing
      if (u.password) {
        await sql`UPDATE users SET code=${u.code}, name=${u.name}, email=${u.email}, password=${u.password}, role=${u.role||'User'}, department=${u.department||null}, is_active=${u.isActive!==false}, data=${JSON.stringify(u)}, updated_at=${u.updatedAt} WHERE id=${id}`;
      } else {
        await sql`UPDATE users SET code=${u.code}, name=${u.name}, email=${u.email}, role=${u.role||'User'}, department=${u.department||null}, is_active=${u.isActive!==false}, data=${JSON.stringify(u)}, updated_at=${u.updatedAt} WHERE id=${id}`;
      }
      const safe = { ...u }; delete safe.password;
      return res.json(safe);
    }
    if (req.method === 'DELETE') {
      await sql`DELETE FROM users WHERE id=${id}`;
      return res.json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
