import { getDb, setCors, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sql = getDb();
  try {
    await ensureSchema(sql);
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM product_categories ORDER BY code ASC`;
      return res.json(rows.map(r => ({ id: r.id, code: r.code, name: r.name, costMethod: r.cost_method, expenseAccount: r.expense_account, incomeAccount: r.income_account })));
    }
    if (req.method === 'POST') {
      const c = req.body;
      const id = c.id || Date.now().toString();
      await sql`
        INSERT INTO product_categories (id, code, name, cost_method, expense_account, income_account)
        VALUES (${id}, ${c.code}, ${c.name}, ${c.costMethod||null}, ${c.expenseAccount||null}, ${c.incomeAccount||null})
        ON CONFLICT (code) DO UPDATE SET name=${c.name}, cost_method=${c.costMethod||null}, expense_account=${c.expenseAccount||null}, income_account=${c.incomeAccount||null}`;
      return res.status(201).json({ ...c, id });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
