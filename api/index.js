import { getDb, setCors, ensureSchema } from './_db.js';

// Single unified serverless function — routes all /api/* traffic.
// vercel.json rewrites:
//   /api/:resource/:id  →  /api/index?resource=:resource&id=:id
//   /api/:resource      →  /api/index?resource=:resource
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  const { resource, id } = req.query;

  try {
    await ensureSchema(sql);

    switch (resource) {

      // ── VENDORS ──────────────────────────────────────────────
      case 'vendors': {
        if (req.method === 'GET') {
          const rows = await sql`SELECT data FROM vendors ORDER BY created_at ASC`;
          return res.json(rows.map(r => r.data));
        }
        if (req.method === 'POST') {
          const v = req.body;
          await sql`
            INSERT INTO vendors (id, code, name, is_deactivated, data, created_at, updated_at)
            VALUES (${v.id}, ${v.code}, ${v.name}, ${v.isDeactivated||false}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})
            ON CONFLICT (code) DO UPDATE SET name=${v.name}, is_deactivated=${v.isDeactivated||false}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt}`;
          return res.status(201).json(v);
        }
        break;
      }

      // ── CUSTOMERS ─────────────────────────────────────────────
      case 'customers': {
        if (req.method === 'GET') {
          const rows = await sql`SELECT data FROM customers ORDER BY created_at ASC`;
          return res.json(rows.map(r => r.data));
        }
        if (req.method === 'POST') {
          const c = req.body;
          await sql`
            INSERT INTO customers (id, code, name, is_deactivated, data, created_at, updated_at)
            VALUES (${c.id}, ${c.code}, ${c.name}, ${c.isDeactivated||false}, ${JSON.stringify(c)}, ${c.createdAt}, ${c.updatedAt})
            ON CONFLICT (code) DO UPDATE SET name=${c.name}, is_deactivated=${c.isDeactivated||false}, data=${JSON.stringify(c)}, updated_at=${c.updatedAt}`;
          return res.status(201).json(c);
        }
        break;
      }

      // ── USERS ─────────────────────────────────────────────────
      case 'users': {
        if (!id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM users ORDER BY created_at ASC`;
            return res.json(rows.map(r => { const d = r.data; delete d.password; return d; }));
          }
          if (req.method === 'POST') {
            const u = req.body;
            await sql`
              INSERT INTO users (id, code, name, email, password, role, department, is_active, data, created_at, updated_at)
              VALUES (${u.id}, ${u.code}, ${u.name}, ${u.email}, ${u.password||''}, ${u.role||'User'}, ${u.department||null}, ${u.isActive!==false}, ${JSON.stringify(u)}, ${u.createdAt}, ${u.updatedAt})
              ON CONFLICT (email) DO UPDATE SET name=${u.name}, role=${u.role||'User'}, department=${u.department||null}, is_active=${u.isActive!==false}, data=${JSON.stringify(u)}, updated_at=${u.updatedAt}`;
            const safe = { ...u }; delete safe.password;
            return res.status(201).json(safe);
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM users WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            const d = rows[0].data; delete d.password;
            return res.json(d);
          }
          if (req.method === 'PUT') {
            const u = req.body;
            await sql`UPDATE users SET code=${u.code}, name=${u.name}, email=${u.email}, password=${u.password||''}, role=${u.role||'User'}, department=${u.department||null}, is_active=${u.isActive!==false}, data=${JSON.stringify(u)}, updated_at=${u.updatedAt} WHERE id=${id}`;
            const safe = { ...u }; delete safe.password;
            return res.json(safe);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM users WHERE id=${id}`;
            return res.json({ success: true });
          }
        }
        break;
      }

      // ── PRODUCTS ──────────────────────────────────────────────
      case 'products': {
        if (!id) {
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
        } else {
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
        }
        break;
      }

      // ── PRODUCT CATEGORIES ────────────────────────────────────
      case 'product-categories': {
        if (req.method === 'GET') {
          const rows = await sql`SELECT * FROM product_categories ORDER BY code ASC`;
          return res.json(rows.map(r => ({ id: r.id, code: r.code, name: r.name, costMethod: r.cost_method, expenseAccount: r.expense_account, incomeAccount: r.income_account })));
        }
        if (req.method === 'POST') {
          const c = req.body;
          const catId = c.id || Date.now().toString();
          await sql`
            INSERT INTO product_categories (id, code, name, cost_method, expense_account, income_account)
            VALUES (${catId}, ${c.code}, ${c.name}, ${c.costMethod||null}, ${c.expenseAccount||null}, ${c.incomeAccount||null})
            ON CONFLICT (code) DO UPDATE SET name=${c.name}, cost_method=${c.costMethod||null}, expense_account=${c.expenseAccount||null}, income_account=${c.incomeAccount||null}`;
          return res.status(201).json({ ...c, id: catId });
        }
        break;
      }

      // ── WAREHOUSES ────────────────────────────────────────────
      case 'warehouses': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM warehouses WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const w = req.body;
            await sql`UPDATE warehouses SET code=${w.warehouseCode||null}, name=${w.warehouseName}, company_name=${w.companyName||null}, state=${w.state||null}, is_active=${w.isActive!==false}, data=${JSON.stringify(w)}, updated_at=${w.updatedAt} WHERE id=${id}`;
            return res.json(w);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM warehouses WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM warehouses ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const w = req.body;
            await sql`
              INSERT INTO warehouses (id, code, name, company_name, state, is_active, data, created_at, updated_at)
              VALUES (${w.id}, ${w.warehouseCode||null}, ${w.warehouseName}, ${w.companyName||null}, ${w.state||null}, ${w.isActive!==false}, ${JSON.stringify(w)}, ${w.createdAt}, ${w.updatedAt})`;
            return res.status(201).json(w);
          }
        }
        break;
      }

      // ── BUSINESS UNITS ────────────────────────────────────────
      case 'business-units': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM business_units WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const b = req.body;
            await sql`UPDATE business_units SET code=${b.locationCode}, contact_name=${b.contactName||null}, state=${b.state||null}, is_active=${b.isActive!==false}, data=${JSON.stringify(b)}, updated_at=${b.updatedAt} WHERE id=${id}`;
            return res.json(b);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM business_units WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM business_units ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const b = req.body;
            await sql`
              INSERT INTO business_units (id, code, contact_name, state, is_active, data, created_at, updated_at)
              VALUES (${b.id}, ${b.locationCode}, ${b.contactName||null}, ${b.state||null}, ${b.isActive!==false}, ${JSON.stringify(b)}, ${b.createdAt}, ${b.updatedAt})`;
            return res.status(201).json(b);
          }
        }
        break;
      }

      // ── ORGANISATIONS ─────────────────────────────────────────
      case 'organisations': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM organisations WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const o = req.body;
            await sql`UPDATE organisations SET code=${o.companyCode}, name=${o.companyName}, type=${o.type||null}, state=${o.state||null}, data=${JSON.stringify(o)}, updated_at=${o.updatedAt} WHERE id=${id}`;
            return res.json(o);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM organisations WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM organisations ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const o = req.body;
            const existing = await sql`SELECT id FROM organisations WHERE code=${o.companyCode}`;
            if (existing.length) return res.status(409).json({ error: 'Company Code already exists. Please enter a unique code.' });
            await sql`
              INSERT INTO organisations (id, code, name, type, state, data, created_at, updated_at)
              VALUES (${o.id}, ${o.companyCode}, ${o.companyName}, ${o.type||null}, ${o.state||null}, ${JSON.stringify(o)}, ${o.createdAt}, ${o.updatedAt})`;
            return res.status(201).json(o);
          }
        }
        break;
      }

      // ── COUNTRIES ─────────────────────────────────────────────
      case 'countries': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM countries WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const c = req.body;
            await sql`UPDATE countries SET code=${c.countryCode}, name=${c.countryName}, dial_code=${c.dialCode||null}, currency=${c.currency||null}, is_active=${!c.isDeactivated}, data=${JSON.stringify(c)}, updated_at=${c.updatedAt} WHERE id=${id}`;
            return res.json(c);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM countries WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM countries ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const c = req.body;
            const existing = await sql`SELECT id FROM countries WHERE code=${c.countryCode}`;
            if (existing.length) return res.status(409).json({ error: 'Country Code already exists.' });
            await sql`INSERT INTO countries (id, code, name, dial_code, currency, is_active, data, created_at, updated_at) VALUES (${c.id}, ${c.countryCode}, ${c.countryName}, ${c.dialCode||null}, ${c.currency||null}, ${!c.isDeactivated}, ${JSON.stringify(c)}, ${c.createdAt}, ${c.updatedAt})`;
            return res.status(201).json(c);
          }
        }
        break;
      }

      // ── STATES ────────────────────────────────────────────────
      case 'states': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM states WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const s = req.body;
            await sql`UPDATE states SET code=${s.stateCode}, name=${s.stateName}, country_id=${s.countryId||null}, country_name=${s.countryName||null}, gst_state_code=${s.gstStateCode||null}, is_active=${!s.isDeactivated}, data=${JSON.stringify(s)}, updated_at=${s.updatedAt} WHERE id=${id}`;
            return res.json(s);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM states WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM states ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const s = req.body;
            const existing = await sql`SELECT id FROM states WHERE code=${s.stateCode}`;
            if (existing.length) return res.status(409).json({ error: 'State Code already exists.' });
            await sql`INSERT INTO states (id, code, name, country_id, country_name, gst_state_code, is_active, data, created_at, updated_at) VALUES (${s.id}, ${s.stateCode}, ${s.stateName}, ${s.countryId||null}, ${s.countryName||null}, ${s.gstStateCode||null}, ${!s.isDeactivated}, ${JSON.stringify(s)}, ${s.createdAt}, ${s.updatedAt})`;
            return res.status(201).json(s);
          }
        }
        break;
      }

      // ── DISTRICTS ─────────────────────────────────────────────
      case 'districts': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM districts WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const d = req.body;
            await sql`UPDATE districts SET code=${d.districtCode}, name=${d.districtName}, state=${d.state||null}, is_active=${!d.isDeactivated}, data=${JSON.stringify(d)}, updated_at=${d.updatedAt} WHERE id=${id}`;
            return res.json(d);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM districts WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM districts ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const d = req.body;
            const existing = await sql`SELECT id FROM districts WHERE code=${d.districtCode}`;
            if (existing.length) return res.status(409).json({ error: 'District Code already exists.' });
            await sql`INSERT INTO districts (id, code, name, state, is_active, data, created_at, updated_at) VALUES (${d.id}, ${d.districtCode}, ${d.districtName}, ${d.state||null}, ${!d.isDeactivated}, ${JSON.stringify(d)}, ${d.createdAt}, ${d.updatedAt})`;
            return res.status(201).json(d);
          }
        }
        break;
      }

      // ── VILLAGE / TALUKAS ──────────────────────────────────────
      case 'village-talukas': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM village_talukas WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE village_talukas SET code=${v.villageCode}, name=${v.villageName}, district_id=${v.districtId||null}, district_name=${v.districtName||null}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM village_talukas WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM village_talukas ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM village_talukas WHERE code=${v.villageCode}`;
            if (existing.length) return res.status(409).json({ error: 'Village / Taluka Code already exists.' });
            await sql`INSERT INTO village_talukas (id, code, name, district_id, district_name, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.villageCode}, ${v.villageName}, ${v.districtId||null}, ${v.districtName||null}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── PRODUCT TYPES ─────────────────────────────────────────
      case 'product-types': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM product_types WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE product_types SET code=${v.typeId}, name=${v.name}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM product_types WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM product_types ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM product_types WHERE code=${v.typeId}`;
            if (existing.length) return res.status(409).json({ error: 'Type ID already exists.' });
            await sql`INSERT INTO product_types (id, code, name, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.typeId}, ${v.name}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── PRODUCT SUB-TYPES ─────────────────────────────────────
      case 'product-subtypes': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM product_subtypes WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE product_subtypes SET code=${v.subtypeId}, name=${v.subtypeName}, product_type_id=${v.productTypeId||null}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM product_subtypes WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM product_subtypes ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM product_subtypes WHERE code=${v.subtypeId}`;
            if (existing.length) return res.status(409).json({ error: 'Sub-type ID already exists.' });
            await sql`INSERT INTO product_subtypes (id, code, name, product_type_id, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.subtypeId}, ${v.subtypeName}, ${v.productTypeId||null}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── PRODUCT MASTERS (new) ─────────────────────────────────
      case 'product-masters': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM product_masters WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE product_masters SET code=${v.productCode}, name=${v.productName}, product_type_id=${v.productTypeId||null}, subtype_id=${v.subtypeId||null}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM product_masters WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM product_masters ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM product_masters WHERE code=${v.productCode}`;
            if (existing.length) return res.status(409).json({ error: 'Product Code already exists.' });
            await sql`INSERT INTO product_masters (id, code, name, product_type_id, subtype_id, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.productCode}, ${v.productName}, ${v.productTypeId||null}, ${v.subtypeId||null}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── DEPARTMENTS ───────────────────────────────────────────
      case 'departments': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM departments WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE departments SET code=${v.departmentCode}, name=${v.departmentName}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM departments WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM departments ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM departments WHERE code=${v.departmentCode}`;
            if (existing.length) return res.status(409).json({ error: 'Department Code already exists.' });
            await sql`INSERT INTO departments (id, code, name, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.departmentCode}, ${v.departmentName}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── DESIGNATIONS ──────────────────────────────────────────
      case 'designations': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM designations WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE designations SET code=${v.designationCode}, name=${v.designationName}, level=${v.level||null}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM designations WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM designations ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM designations WHERE code=${v.designationCode}`;
            if (existing.length) return res.status(409).json({ error: 'Designation Code already exists.' });
            await sql`INSERT INTO designations (id, code, name, level, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.designationCode}, ${v.designationName}, ${v.level||null}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── EMPLOYEES ─────────────────────────────────────────────
      case 'employees': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM employees WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE employees SET code=${v.employeeId}, name=${(v.firstName||'')+' '+(v.lastName||'')}, department_id=${v.departmentId||null}, designation_id=${v.designationId||null}, status=${v.status||'Active'}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM employees WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM employees ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM employees WHERE code=${v.employeeId}`;
            if (existing.length) return res.status(409).json({ error: 'Employee ID already exists.' });
            await sql`INSERT INTO employees (id, code, name, department_id, designation_id, status, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.employeeId}, ${(v.firstName||'')+' '+(v.lastName||'')}, ${v.departmentId||null}, ${v.designationId||null}, ${v.status||'Active'}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── WORK ORDERS ───────────────────────────────────────────
      case 'work-orders': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM work_orders WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const w = req.body;
            await sql`UPDATE work_orders SET code=${w.workOrderId}, product_id=${w.productId||null}, status=${w.status||'Draft'}, data=${JSON.stringify(w)}, updated_at=${w.updatedAt} WHERE id=${id}`;
            return res.json(w);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM work_orders WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM work_orders ORDER BY created_at ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const w = req.body;
            const existing = await sql`SELECT id FROM work_orders WHERE code=${w.workOrderId}`;
            if (existing.length) return res.status(409).json({ error: 'Work Order ID already exists.' });
            await sql`INSERT INTO work_orders (id, code, product_id, status, data, created_at, updated_at) VALUES (${w.id}, ${w.workOrderId}, ${w.productId||null}, ${w.status||'Draft'}, ${JSON.stringify(w)}, ${w.createdAt}, ${w.updatedAt})`;
            return res.status(201).json(w);
          }
        }
        break;
      }

      // ── UNIT TYPES ────────────────────────────────────────────
      case 'unit-types': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM unit_types WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE unit_types SET code=${v.unitTypeId}, name=${v.unitTypeName}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM unit_types WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM unit_types ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM unit_types WHERE code=${v.unitTypeId}`;
            if (existing.length) return res.status(409).json({ error: 'Unit Type ID already exists.' });
            await sql`INSERT INTO unit_types (id, code, name, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.unitTypeId}, ${v.unitTypeName}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── UOM ───────────────────────────────────────────────────
      case 'uom': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM uom WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE uom SET code=${v.unitId}, name=${v.unitName}, short_code=${v.unitShortCode}, unit_type_id=${v.unitTypeId||null}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM uom WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM uom ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const [existId, existCode] = await Promise.all([
              sql`SELECT id FROM uom WHERE code=${v.unitId}`,
              sql`SELECT id FROM uom WHERE short_code=${v.unitShortCode}`,
            ]);
            if (existId.length) return res.status(409).json({ error: 'Unit ID already exists.' });
            if (existCode.length) return res.status(409).json({ error: 'Short Code already exists.' });
            await sql`INSERT INTO uom (id, code, name, short_code, unit_type_id, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.unitId}, ${v.unitName}, ${v.unitShortCode}, ${v.unitTypeId||null}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── WORK ORDER TYPES ──────────────────────────────────────
      case 'work-order-types': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM work_order_types WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE work_order_types SET code=${v.typeId}, name=${v.typeName}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM work_order_types WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM work_order_types ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM work_order_types WHERE code=${v.typeId}`;
            if (existing.length) return res.status(409).json({ error: 'Type ID already exists.' });
            await sql`INSERT INTO work_order_types (id, code, name, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.typeId}, ${v.typeName}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── ASSET STRUCTURES ─────────────────────────────────────
      case 'asset-structures': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM asset_structures WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE asset_structures SET code=${v.locationId}, name=${v.locationName}, site=${v.site||null}, warehouse_id=${v.warehouseId||null}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM asset_structures WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM asset_structures ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM asset_structures WHERE code=${v.locationId}`;
            if (existing.length) return res.status(409).json({ error: 'Location ID already exists.' });
            await sql`INSERT INTO asset_structures (id, code, name, site, warehouse_id, data, created_at, updated_at) VALUES (${v.id}, ${v.locationId}, ${v.locationName}, ${v.site||null}, ${v.warehouseId||null}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── ASSETS ────────────────────────────────────────────────
      case 'assets': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM assets WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE assets SET code=${v.assetId}, name=${v.name}, location_id=${v.locationId||null}, asset_type_id=${v.assetTypeId||null}, status=${v.status||'Active'}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM assets WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM assets ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM assets WHERE code=${v.assetId}`;
            if (existing.length) return res.status(409).json({ error: 'Asset ID already exists.' });
            await sql`INSERT INTO assets (id, code, name, location_id, asset_type_id, status, data, created_at, updated_at) VALUES (${v.id}, ${v.assetId}, ${v.name}, ${v.locationId||null}, ${v.assetTypeId||null}, ${v.status||'Active'}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── MAINTENANCE TYPES ─────────────────────────────────────
      case 'maintenance-types': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM maintenance_types WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE maintenance_types SET code=${v.typeId}, name=${v.maintenanceName}, priority=${v.priority||null}, is_active=${!v.isDeactivated}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM maintenance_types WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM maintenance_types ORDER BY name ASC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM maintenance_types WHERE code=${v.typeId}`;
            if (existing.length) return res.status(409).json({ error: 'Type ID already exists.' });
            await sql`INSERT INTO maintenance_types (id, code, name, priority, is_active, data, created_at, updated_at) VALUES (${v.id}, ${v.typeId}, ${v.maintenanceName}, ${v.priority||null}, ${!v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      // ── JOB LIST ──────────────────────────────────────────────
      case 'job-list': {
        if (id) {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM job_list WHERE id=${id}`;
            if (!rows.length) return res.status(404).json({ error: 'Not found' });
            return res.json(rows[0].data);
          }
          if (req.method === 'PUT') {
            const v = req.body;
            await sql`UPDATE job_list SET code=${v.jobId}, asset_id=${v.assetId||null}, maintenance_type_id=${v.maintenanceTypeId||null}, priority=${v.priority||null}, status=${v.status||'Open'}, assigned_to_id=${v.assignedToId||null}, job_date=${v.jobDate||null}, data=${JSON.stringify(v)}, updated_at=${v.updatedAt} WHERE id=${id}`;
            return res.json(v);
          }
          if (req.method === 'DELETE') {
            await sql`DELETE FROM job_list WHERE id=${id}`;
            return res.json({ success: true });
          }
        } else {
          if (req.method === 'GET') {
            const rows = await sql`SELECT data FROM job_list ORDER BY job_date DESC, created_at DESC`;
            return res.json(rows.map(r => r.data));
          }
          if (req.method === 'POST') {
            const v = req.body;
            const existing = await sql`SELECT id FROM job_list WHERE code=${v.jobId}`;
            if (existing.length) return res.status(409).json({ error: 'Job ID already exists.' });
            await sql`INSERT INTO job_list (id, code, asset_id, maintenance_type_id, priority, status, assigned_to_id, job_date, data, created_at, updated_at) VALUES (${v.id}, ${v.jobId}, ${v.assetId||null}, ${v.maintenanceTypeId||null}, ${v.priority||null}, ${v.status||'Open'}, ${v.assignedToId||null}, ${v.jobDate||null}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})`;
            return res.status(201).json(v);
          }
        }
        break;
      }

      default:
        return res.status(404).json({ error: `Unknown resource: ${resource}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
