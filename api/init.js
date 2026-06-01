import { getDb, setCors, ensureSchema } from './_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  try {
    await ensureSchema(sql);
    return res.json({
      success: true,
      message: 'Database initialised. All tables created and sample data seeded.',
      defaultLogin: { email: 'admin@speedinnovations.in', password: 'Admin@123' },
    });
  } catch (err) {
    console.error('Init error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
