import { neon } from '@neondatabase/serverless';
import { SEED_USERS, SEED_VENDORS, SEED_CUSTOMERS, SEED_CATEGORIES, SEED_PRODUCTS } from './_seed.js';

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is not set.');
  return neon(process.env.DATABASE_URL);
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Creates tables and seeds all sample data on first call. Safe to call on every request.
export async function ensureSchema(sql) {
  // ── Create tables ──
  await sql`CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, is_deactivated BOOLEAN DEFAULT false, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, is_deactivated BOOLEAN DEFAULT false, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS product_categories (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, cost_method TEXT, expense_account TEXT, income_account TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, category_code TEXT, stock_uom TEXT, sales_price NUMERIC, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'User', department TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`;

  // ── Seed all tables if empty (first-time setup) ──
  const [{ count }] = await sql`SELECT COUNT(*) AS count FROM users`;
  if (Number(count) === 0) {
    // Users
    for (const u of SEED_USERS) {
      await sql`INSERT INTO users (id,code,name,email,password,role,department,is_active,data,created_at,updated_at)
        VALUES (${u.id},${u.code},${u.name},${u.email},${u.password},${u.role},${u.department},${u.isActive},${JSON.stringify(u)},${u.createdAt},${u.updatedAt})
        ON CONFLICT DO NOTHING`;
    }
    // Vendors
    for (const v of SEED_VENDORS) {
      await sql`INSERT INTO vendors (id,code,name,is_deactivated,data,created_at,updated_at)
        VALUES (${v.id},${v.code},${v.name},${v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`;
    }
    // Customers
    for (const c of SEED_CUSTOMERS) {
      await sql`INSERT INTO customers (id,code,name,is_deactivated,data,created_at,updated_at)
        VALUES (${c.id},${c.code},${c.name},${c.isDeactivated},${JSON.stringify(c)},${c.createdAt},${c.updatedAt})
        ON CONFLICT DO NOTHING`;
    }
    // Product Categories
    for (const cat of SEED_CATEGORIES) {
      await sql`INSERT INTO product_categories (id,code,name,cost_method,expense_account,income_account)
        VALUES (${cat.id},${cat.code},${cat.name},${cat.costMethod},${cat.expenseAccount},${cat.incomeAccount})
        ON CONFLICT DO NOTHING`;
    }
    // Products
    for (const p of SEED_PRODUCTS) {
      await sql`INSERT INTO products (id,code,name,category_code,stock_uom,sales_price,is_active,data,created_at,updated_at)
        VALUES (${p.id},${p.code},${p.name},${p.categoryCode},${p.stockUOM},${Number(p.salesPrice)},${p.isActive},${JSON.stringify(p)},${p.createdAt},${p.updatedAt})
        ON CONFLICT DO NOTHING`;
    }
  }
}
