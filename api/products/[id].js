import { getDb, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM products WHERE id=${id}`;
      if (!rows.length) return res.status(404).json({ error: 'Not found' });
      return res.json(rows[0].data);
    }
    if (req.method === 'PUT') {
      const p = req.body;
      await sql`UPDATE products SET code=${p.code}, name=${p.name}, category_code=${p.categoryCode||null}, stock_uom=${p.stockUOM||null}, sales_price=${Number(p.salesPrice)||0}, is_active=${p.isActive!==false}, data=${JSON.stringify(p)}, updated_at=${p.updatedAt} WHERE id=${id}`;
      return res.json(p);
    }
    if (req.method === 'DELETE') {
      await sql`DELETE FROM products WHERE id=${id}`;
      return res.json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
