import { getDb, setCors } from '../_db.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sql = getDb();
  const { email, password } = req.body || {};

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  try {
    const rows = await sql`SELECT data, password FROM users WHERE LOWER(email)=LOWER(${email}) AND is_active=true`;
    if (!rows.length) return res.status(401).json({ error: 'Invalid email or password.' });

    const user = rows[0];
    if (user.password !== password) return res.status(401).json({ error: 'Invalid email or password.' });

    // Return user data without password
    const userData = user.data;
    delete userData.password;
    return res.json({ success: true, user: userData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
