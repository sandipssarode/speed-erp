import { neon } from '@neondatabase/serverless';

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is not set.');
  return neon(process.env.DATABASE_URL);
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Creates all tables and seeds the default admin user. Safe to call on every request.
export async function ensureSchema(sql) {
  await sql`CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, is_deactivated BOOLEAN DEFAULT false, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, is_deactivated BOOLEAN DEFAULT false, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS product_categories (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, cost_method TEXT, expense_account TEXT, income_account TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, category_code TEXT, stock_uom TEXT, sales_price NUMERIC, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'User', department TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;

  // Auto-seed default admin if users table is empty
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM users`;
  if (Number(count) === 0) {
    const admin = {
      id: 'u001', code: 'U001', name: 'Admin User',
      email: 'admin@speedinnovations.in', password: 'Admin@123',
      role: 'Admin', department: 'IT', mobile: '', isActive: true,
      displayName: 'Admin', emailAddress: 'admin@speedinnovations.in',
      smtpServer: '', smtpPort: '587', smtpSSL: false,
      ccEmails: '', outlookEmail: false, fixLoginPC: '',
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      createdBy: 'System', updatedBy: 'System', changelog: [],
    };
    await sql`
      INSERT INTO users (id, code, name, email, password, role, department, is_active, data, created_at, updated_at)
      VALUES ('u001','U001','Admin User','admin@speedinnovations.in','Admin@123','Admin','IT',true,${JSON.stringify(admin)},NOW(),NOW())
      ON CONFLICT DO NOTHING`;
  }
}
