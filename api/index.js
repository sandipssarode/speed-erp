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

      default:
        return res.status(404).json({ error: `Unknown resource: ${resource}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
