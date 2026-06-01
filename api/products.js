import { getDb, setCors } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  try {
    if (req.method === 'GET') {
      const rows = await sql`SELECT data FROM products ORDER BY created_at ASC`;
      return res.json(rows.map(r => r.data));
    }
    if (req.method === 'POST') {
      const p = req.body;
      await sql`
        INSERT INTO products (id, code, name, category_code, stock_uom, sales_price, is_active, data, created_at, updated_at)
        VALUES (${p.id}, ${p.code}, ${p.name}, ${p.categoryCode||null}, ${p.stockUOM||null}, ${Number(p.salesPrice)||0}, ${p.isActive!==false}, ${JSON.stringify(p)}, ${p.createdAt}, ${p.updatedAt})
        ON CONFLICT (code) DO UPDATE SET name=${p.name}, category_code=${p.categoryCode||null}, stock_uom=${p.stockUOM||null}, sales_price=${Number(p.salesPrice)||0}, is_active=${p.isActive!==false}, data=${JSON.stringify(p)}, updated_at=${p.updatedAt}`;
      return res.status(201).json(p);
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
