import { neon } from '@neondatabase/serverless';
import { SEED_USERS, SEED_VENDORS, SEED_CUSTOMERS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_WAREHOUSES, SEED_BUSINESS_UNITS, SEED_ORGANISATIONS } from './_seed.js';

// Reused across requests within the same serverless instance lifetime
let _sql = null;
let _schemaReady = false;

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL environment variable is not set.');
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql;
}

export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export async function ensureSchema(sql) {
  if (_schemaReady) return;

  // Create all tables in parallel — one round-trip instead of 5 sequential
  await Promise.all([
    sql`CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, is_deactivated BOOLEAN DEFAULT false, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS customers (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, is_deactivated BOOLEAN DEFAULT false, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS product_categories (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, cost_method TEXT, expense_account TEXT, income_account TEXT, created_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT, category_code TEXT, stock_uom TEXT, sales_price NUMERIC, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'User', department TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS warehouses (id TEXT PRIMARY KEY, code TEXT, name TEXT NOT NULL, company_name TEXT, state TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS business_units (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, contact_name TEXT, state TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS organisations (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, type TEXT, state TEXT, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
  ]);

  // Check all seed counts in parallel
  const [[uCount], [vCount], [cCount], [catCount], [pCount], [whCount], [buCount], [orgCount]] = await Promise.all([
    sql`SELECT COUNT(*) AS c FROM users`,
    sql`SELECT COUNT(*) AS c FROM vendors`,
    sql`SELECT COUNT(*) AS c FROM customers`,
    sql`SELECT COUNT(*) AS c FROM product_categories`,
    sql`SELECT COUNT(*) AS c FROM products`,
    sql`SELECT COUNT(*) AS c FROM warehouses`,
    sql`SELECT COUNT(*) AS c FROM business_units`,
    sql`SELECT COUNT(*) AS c FROM organisations`,
  ]);

  // Seed empty tables in parallel; each table's rows are also inserted in parallel
  await Promise.all([
    Number(uCount.c) === 0 && Promise.all(SEED_USERS.map(u =>
      sql`INSERT INTO users (id,code,name,email,password,role,department,is_active,data,created_at,updated_at)
        VALUES (${u.id},${u.code},${u.name},${u.email},${u.password},${u.role},${u.department},${u.isActive},${JSON.stringify(u)},${u.createdAt},${u.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(vCount.c) === 0 && Promise.all(SEED_VENDORS.map(v =>
      sql`INSERT INTO vendors (id,code,name,is_deactivated,data,created_at,updated_at)
        VALUES (${v.id},${v.code},${v.name},${v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(cCount.c) === 0 && Promise.all(SEED_CUSTOMERS.map(c =>
      sql`INSERT INTO customers (id,code,name,is_deactivated,data,created_at,updated_at)
        VALUES (${c.id},${c.code},${c.name},${c.isDeactivated},${JSON.stringify(c)},${c.createdAt},${c.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(catCount.c) === 0 && Promise.all(SEED_CATEGORIES.map(cat =>
      sql`INSERT INTO product_categories (id,code,name,cost_method,expense_account,income_account)
        VALUES (${cat.id},${cat.code},${cat.name},${cat.costMethod},${cat.expenseAccount},${cat.incomeAccount})
        ON CONFLICT DO NOTHING`
    )),
    Number(pCount.c) === 0 && Promise.all(SEED_PRODUCTS.map(p =>
      sql`INSERT INTO products (id,code,name,category_code,stock_uom,sales_price,is_active,data,created_at,updated_at)
        VALUES (${p.id},${p.code},${p.name},${p.categoryCode},${p.stockUOM},${Number(p.salesPrice)},${p.isActive},${JSON.stringify(p)},${p.createdAt},${p.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(whCount.c) === 0 && Promise.all(SEED_WAREHOUSES.map(w =>
      sql`INSERT INTO warehouses (id,code,name,company_name,state,is_active,data,created_at,updated_at)
        VALUES (${w.id},${w.warehouseCode||null},${w.warehouseName},${w.companyName||null},${w.state||null},${w.isActive!==false},${JSON.stringify(w)},${w.createdAt},${w.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(buCount.c) === 0 && Promise.all(SEED_BUSINESS_UNITS.map(b =>
      sql`INSERT INTO business_units (id,code,contact_name,state,is_active,data,created_at,updated_at)
        VALUES (${b.id},${b.locationCode},${b.contactName||null},${b.state||null},${b.isActive!==false},${JSON.stringify(b)},${b.createdAt},${b.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(orgCount.c) === 0 && Promise.all(SEED_ORGANISATIONS.map(o =>
      sql`INSERT INTO organisations (id,code,name,type,state,data,created_at,updated_at)
        VALUES (${o.id},${o.companyCode},${o.companyName},${o.type||null},${o.state||null},${JSON.stringify(o)},${o.createdAt},${o.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
  ].filter(Boolean));

  _schemaReady = true;
}
