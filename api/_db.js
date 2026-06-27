import { neon } from '@neondatabase/serverless';
import { SEED_USERS, SEED_VENDORS, SEED_CUSTOMERS, SEED_CATEGORIES, SEED_PRODUCTS, SEED_WAREHOUSES, SEED_BUSINESS_UNITS, SEED_ORGANISATIONS, SEED_COUNTRIES, SEED_STATES, SEED_DISTRICTS, SEED_VILLAGE_TALUKAS, SEED_PRODUCT_TYPES, SEED_PRODUCT_SUBTYPES, SEED_PRODUCT_MASTERS, SEED_DEPARTMENTS, SEED_DESIGNATIONS, SEED_EMPLOYEES } from './_seed.js';
import { SEED_WORK_ORDER_TYPES, SEED_UNIT_TYPES, SEED_UOM, SEED_ASSET_STRUCTURES, SEED_ASSETS, SEED_MAINTENANCE_TYPES, SEED_JOB_LIST } from './_seed_asset.js';

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

export function resetSchemaFlag() { _schemaReady = false; }

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
    sql`CREATE TABLE IF NOT EXISTS countries (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, dial_code TEXT, currency TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS states (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, country_id TEXT, country_name TEXT, gst_state_code TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS districts (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, state TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS village_talukas (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, district_id TEXT, district_name TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS product_types (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS product_subtypes (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, product_type_id TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS product_masters (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, product_type_id TEXT, subtype_id TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS departments (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS designations (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, level TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS employees (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, department_id TEXT, designation_id TEXT, status TEXT DEFAULT 'Active', is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS work_orders (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, product_id TEXT, status TEXT DEFAULT 'Draft', data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS work_order_types (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS unit_types (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS uom (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, short_code TEXT UNIQUE NOT NULL, unit_type_id TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS asset_structures (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, site TEXT, warehouse_id TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS assets (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, location_id TEXT, asset_type_id TEXT, status TEXT DEFAULT 'Active', data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS maintenance_types (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, priority TEXT, is_active BOOLEAN DEFAULT true, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
    sql`CREATE TABLE IF NOT EXISTS job_list (id TEXT PRIMARY KEY, code TEXT UNIQUE NOT NULL, asset_id TEXT, maintenance_type_id TEXT, priority TEXT, status TEXT DEFAULT 'Open', assigned_to_id TEXT, job_date DATE, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW())`,
  ]);

  // Check all seed counts in parallel
  const [[uCount], [vCount], [cCount], [catCount], [pCount], [whCount], [buCount], [orgCount], [ctryCount], [stCount], [distCount], [vlgCount], [ptCount], [pstCount], [pmCount], [deptCount], [desgCount], [empCount], [wotCount], [utCount], [uomCount], [locCount], [astCount], [mtCount], [jobCount]] = await Promise.all([
    sql`SELECT COUNT(*) AS c FROM users`,
    sql`SELECT COUNT(*) AS c FROM vendors`,
    sql`SELECT COUNT(*) AS c FROM customers`,
    sql`SELECT COUNT(*) AS c FROM product_categories`,
    sql`SELECT COUNT(*) AS c FROM products`,
    sql`SELECT COUNT(*) AS c FROM warehouses`,
    sql`SELECT COUNT(*) AS c FROM business_units`,
    sql`SELECT COUNT(*) AS c FROM organisations`,
    sql`SELECT COUNT(*) AS c FROM countries`,
    sql`SELECT COUNT(*) AS c FROM states`,
    sql`SELECT COUNT(*) AS c FROM districts`,
    sql`SELECT COUNT(*) AS c FROM village_talukas`,
    sql`SELECT COUNT(*) AS c FROM product_types`,
    sql`SELECT COUNT(*) AS c FROM product_subtypes`,
    sql`SELECT COUNT(*) AS c FROM product_masters`,
    sql`SELECT COUNT(*) AS c FROM departments`,
    sql`SELECT COUNT(*) AS c FROM designations`,
    sql`SELECT COUNT(*) AS c FROM employees`,
    sql`SELECT COUNT(*) AS c FROM work_order_types`,
    sql`SELECT COUNT(*) AS c FROM unit_types`,
    sql`SELECT COUNT(*) AS c FROM uom`,
    sql`SELECT COUNT(*) AS c FROM asset_structures`,
    sql`SELECT COUNT(*) AS c FROM assets`,
    sql`SELECT COUNT(*) AS c FROM maintenance_types`,
    sql`SELECT COUNT(*) AS c FROM job_list`,
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
    Number(ctryCount.c) === 0 && Promise.all(SEED_COUNTRIES.map(c =>
      sql`INSERT INTO countries (id,code,name,dial_code,currency,is_active,data,created_at,updated_at)
        VALUES (${c.id},${c.countryCode},${c.countryName},${c.dialCode||null},${c.currency||null},${!c.isDeactivated},${JSON.stringify(c)},${c.createdAt},${c.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(stCount.c) === 0 && Promise.all(SEED_STATES.map(s =>
      sql`INSERT INTO states (id,code,name,country_id,country_name,gst_state_code,is_active,data,created_at,updated_at)
        VALUES (${s.id},${s.stateCode},${s.stateName},${s.countryId},${s.countryName},${s.gstStateCode||null},${!s.isDeactivated},${JSON.stringify(s)},${s.createdAt},${s.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(distCount.c) === 0 && Promise.all(SEED_DISTRICTS.map(d =>
      sql`INSERT INTO districts (id,code,name,state,is_active,data,created_at,updated_at)
        VALUES (${d.id},${d.districtCode},${d.districtName},${d.state||null},${!d.isDeactivated},${JSON.stringify(d)},${d.createdAt},${d.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(vlgCount.c) === 0 && Promise.all(SEED_VILLAGE_TALUKAS.map(v =>
      sql`INSERT INTO village_talukas (id,code,name,district_id,district_name,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.villageCode},${v.villageName},${v.districtId||null},${v.districtName||null},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(ptCount.c) === 0 && Promise.all(SEED_PRODUCT_TYPES.map(v =>
      sql`INSERT INTO product_types (id,code,name,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.typeId},${v.name},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(pstCount.c) === 0 && Promise.all(SEED_PRODUCT_SUBTYPES.map(v =>
      sql`INSERT INTO product_subtypes (id,code,name,product_type_id,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.subtypeId},${v.subtypeName},${v.productTypeId||null},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(pmCount.c) === 0 && Promise.all(SEED_PRODUCT_MASTERS.map(v =>
      sql`INSERT INTO product_masters (id,code,name,product_type_id,subtype_id,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.productCode},${v.productName},${v.productTypeId||null},${v.subtypeId||null},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(deptCount.c) === 0 && Promise.all(SEED_DEPARTMENTS.map(v =>
      sql`INSERT INTO departments (id,code,name,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.departmentCode},${v.departmentName},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(desgCount.c) === 0 && Promise.all(SEED_DESIGNATIONS.map(v =>
      sql`INSERT INTO designations (id,code,name,level,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.designationCode},${v.designationName},${v.level||null},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(empCount.c) === 0 && Promise.all(SEED_EMPLOYEES.map(v =>
      sql`INSERT INTO employees (id,code,name,department_id,designation_id,status,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.employeeId},${(v.firstName||'')+' '+(v.lastName||'')},${v.departmentId||null},${v.designationId||null},${v.status||'Active'},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(wotCount.c) === 0 && Promise.all(SEED_WORK_ORDER_TYPES.map(v =>
      sql`INSERT INTO work_order_types (id,code,name,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.typeId},${v.typeName},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(utCount.c) === 0 && Promise.all(SEED_UNIT_TYPES.map(v =>
      sql`INSERT INTO unit_types (id,code,name,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.unitTypeId},${v.unitTypeName},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(uomCount.c) === 0 && Promise.all(SEED_UOM.map(v =>
      sql`INSERT INTO uom (id,code,name,short_code,unit_type_id,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.unitId},${v.unitName},${v.unitShortCode},${v.unitTypeId||null},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(locCount.c) === 0 && Promise.all(SEED_ASSET_STRUCTURES.map(v =>
      sql`INSERT INTO asset_structures (id,code,name,site,warehouse_id,data,created_at,updated_at)
        VALUES (${v.id},${v.locationId},${v.locationName},${v.site||null},${v.warehouseId||null},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(astCount.c) === 0 && Promise.all(SEED_ASSETS.map(v =>
      sql`INSERT INTO assets (id,code,name,location_id,asset_type_id,status,data,created_at,updated_at)
        VALUES (${v.id},${v.assetId},${v.name},${v.locationId||null},${v.assetTypeId||null},${v.status||'Active'},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(mtCount.c) === 0 && Promise.all(SEED_MAINTENANCE_TYPES.map(v =>
      sql`INSERT INTO maintenance_types (id,code,name,priority,is_active,data,created_at,updated_at)
        VALUES (${v.id},${v.typeId},${v.maintenanceName},${v.priority||null},${!v.isDeactivated},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
    Number(jobCount.c) === 0 && Promise.all(SEED_JOB_LIST.map(v =>
      sql`INSERT INTO job_list (id,code,asset_id,maintenance_type_id,priority,status,assigned_to_id,job_date,data,created_at,updated_at)
        VALUES (${v.id},${v.jobId},${v.assetId||null},${v.maintenanceTypeId||null},${v.priority||null},${v.status||'Open'},${v.assignedToId||null},${v.jobDate||null},${JSON.stringify(v)},${v.createdAt},${v.updatedAt})
        ON CONFLICT DO NOTHING`
    )),
  ].filter(Boolean));

  _schemaReady = true;
}
