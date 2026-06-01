import { getDb, setCors, ensureSchema } from './_db.js';

const SEED_VENDORS = [
  { id: "1001", code: "A001", name: "Aditya Steel & Alloys Pvt Ltd", group: "Manufacturer", currency: "INR", isManufacturer: true, isAgentDealer: false, isServiceJobwork: false, ledgerBalance: 245000, creditLimit: "500000", creditDays: "45", isDeactivated: false, reference: "ASA-2021", corporateAddress: "Plot No. 14, MIDC Industrial Area, Phase II", corporateCountry: "India", corporateState: "Maharashtra", corporateCity: "Pune", corporatePinCode: "411019", phone: "9823456780", email: "accounts@adityasteel.com", website: "https://adityasteel.com", shipFromSameAsVendor: true, shipFromAddress: "Plot No. 14, MIDC Industrial Area, Phase II", shipFromCountry: "India", shipFromState: "Maharashtra", shipFromCity: "Pune", shipFromPinCode: "411019", billToSameAsShipFrom: false, billToAddress: "Office No. 301, Bund Garden Road", billToCountry: "India", billToState: "Maharashtra", billToCity: "Pune", billToPinCode: "411001", industry: "Manufacturing", segment: "Large Enterprise", buyer: "Ramesh Patil", gstRegistrationStatus: "Registered", gstRegistrationNo: "27AABCA1234A1Z5", panNo: "AABCA1234A", gstRegistrationDate: "2017-08-15", markAsRCM: false, arnNo: "", msmeCategory: "", msmeNo: "", contactPersons: [{ id: "c1", name: "Suresh Aditya", designation: "Managing Director", email: "suresh@adityasteel.com", mobile: "9823456781", landline: "020-27456780", department: "Management" }], terms: [{ id: "t1", line: 1, term: "Payment Terms", description: "Payment within 45 days from invoice date via NEFT/RTGS." }], deductionOnPurchaseBill: false, lcApplicable: false, bgApplicable: false, coaCode: "L001", accountReceivable: "A001", accountPayable: "L001", benfName: "Aditya Steel & Alloys Pvt Ltd", benfEmail: "payments@adityasteel.com", benfMobile: "9823456780", banks: [{ id: "b1", bankName: "State Bank of India", branch: "MIDC Pune", city: "Pune", accountNo: "32145678901", ifscCode: "SBIN0012345", swiftCode: "", accountType: "Current" }], remark: "Preferred vendor for structural steel.", createdAt: "2024-01-10T09:30:00.000Z", updatedAt: "2025-03-15T11:20:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-01-10T09:30:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "1002", code: "T001", name: "Technocraft Trading Co.", group: "Trader", currency: "INR", isManufacturer: false, isAgentDealer: true, isServiceJobwork: false, ledgerBalance: 87500, creditLimit: "200000", creditDays: "30", isDeactivated: false, reference: "TTC-022", corporateAddress: "Shop No. 7, Gala Complex, LBS Road", corporateCountry: "India", corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400086", phone: "9867543210", email: "info@technocraft.in", website: "", shipFromSameAsVendor: false, shipFromAddress: "Warehouse No. 3, Turbhe MIDC", shipFromCountry: "India", shipFromState: "Maharashtra", shipFromCity: "Navi Mumbai", shipFromPinCode: "400705", billToSameAsShipFrom: false, billToAddress: "Shop No. 7, Gala Complex, LBS Road", billToCountry: "India", billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400086", industry: "Trading", segment: "SME", buyer: "Anita Sharma", gstRegistrationStatus: "Registered", gstRegistrationNo: "27AACCT5678B1Z3", panNo: "AACCT5678B", gstRegistrationDate: "2018-03-22", markAsRCM: false, arnNo: "", msmeCategory: "Small", msmeNo: "UDYAM-MH-27-0012345", contactPersons: [], terms: [], deductionOnPurchaseBill: true, lcApplicable: false, bgApplicable: false, coaCode: "L002", accountReceivable: "A002", accountPayable: "L002", benfName: "Technocraft Trading Co.", benfEmail: "nikhil@technocraft.in", benfMobile: "9867543211", banks: [], remark: "Reliable trader for electronic components.", createdAt: "2024-02-05T10:00:00.000Z", updatedAt: "2024-12-10T14:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-02-05T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "1003", code: "S001", name: "SwiftLogix Services LLP", group: "Service Provider", currency: "INR", isManufacturer: false, isAgentDealer: false, isServiceJobwork: true, ledgerBalance: 32000, creditLimit: "100000", creditDays: "15", isDeactivated: false, reference: "", corporateAddress: "B-204, Solitaire Corporate Park, Chakala", corporateCountry: "India", corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400093", phone: "9112345678", email: "billing@swiftlogix.in", website: "", shipFromSameAsVendor: true, shipFromAddress: "B-204, Solitaire Corporate Park, Chakala", shipFromCountry: "India", shipFromState: "Maharashtra", shipFromCity: "Mumbai", shipFromPinCode: "400093", billToSameAsShipFrom: true, billToAddress: "B-204, Solitaire Corporate Park, Chakala", billToCountry: "India", billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400093", industry: "Logistics", segment: "SME", buyer: "Ramesh Patil", gstRegistrationStatus: "Registered", gstRegistrationNo: "27AALLS1234C1Z7", panNo: "AALLS1234C", gstRegistrationDate: "2019-06-01", markAsRCM: true, arnNo: "", msmeCategory: "Micro", msmeNo: "UDYAM-MH-27-0023456", contactPersons: [], terms: [], deductionOnPurchaseBill: false, lcApplicable: false, bgApplicable: false, coaCode: "L003", accountReceivable: "", accountPayable: "L003", benfName: "SwiftLogix Services LLP", benfEmail: "billing@swiftlogix.in", benfMobile: "9112345678", banks: [], remark: "Handles all courier and freight forwarding.", createdAt: "2024-03-20T08:45:00.000Z", updatedAt: "2025-01-08T16:30:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-03-20T08:45:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
];

const SEED_CUSTOMERS = [
  { id: "2001", code: "C001", name: "Infosys BPO Solutions Ltd", group: "Corporate", currency: "INR", ledgerBalance: 325000, creditLimit: "1000000", creditDays: "60", isDeactivated: false, reference: "IBS-2022", corporateAddress: "Plot No. 44, Electronics City Phase I", corporateCountry: "India", corporateState: "Karnataka", corporateCity: "Bengaluru", corporatePinCode: "560100", phone: "9845012345", email: "accounts@infosysbpo.com", website: "https://infosys.com", shipToSameAsCorporate: true, shipToAddress: "Plot No. 44, Electronics City Phase I", shipToCountry: "India", shipToState: "Karnataka", shipToCity: "Bengaluru", shipToPinCode: "560100", shipToPhone: "", shipToEmail: "", billToSameAsShipTo: false, billToAddress: "EDC House, 3rd Floor, Rajiv Gandhi Nagar", billToCountry: "India", billToState: "Karnataka", billToCity: "Bengaluru", billToPinCode: "560029", billToGstNo: "29AACCI1234B1Z3", billToPanNo: "AACCI1234B", industry: "IT & Technology", segment: "Large Enterprise", salesperson: "Arjun Mehta", gstRegistrationNo: "29AACCI1234B1Z3", panNo: "AACCI1234B", gstRegistrationDate: "2017-07-01", markAsRCM: false, gstRegistrationStatus: "Registered", arnNo: "", contactPersons: [], terms: [], deductionApplicable: true, deductionCode: "L001", lcApplicable: false, bgApplicable: false, accountReceivable: "A001", accountPayable: "", benfName: "Infosys BPO Solutions Ltd", benfEmail: "payments@infosysbpo.com", benfMobile: "9845012345", banks: [], remark: "Preferred IT services customer.", createdAt: "2024-01-15T09:00:00.000Z", updatedAt: "2025-04-10T11:30:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-01-15T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "2002", code: "T001", name: "Tata Motors Ltd", group: "OEM", currency: "INR", ledgerBalance: 780000, creditLimit: "5000000", creditDays: "45", isDeactivated: false, reference: "TML-PNQ", corporateAddress: "Bombay House, 24 Homi Mody Street, Fort", corporateCountry: "India", corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400001", phone: "9820011111", email: "procurement@tatamotors.com", website: "https://tatamotors.com", shipToSameAsCorporate: false, shipToAddress: "Pimpri Works, MIDC Pimpri", shipToCountry: "India", shipToState: "Maharashtra", shipToCity: "Pune", shipToPinCode: "411018", shipToPhone: "9820011112", shipToEmail: "", billToSameAsShipTo: false, billToAddress: "Bombay House, 24 Homi Mody Street, Fort", billToCountry: "India", billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400001", billToGstNo: "27AAACT2727Q1ZV", billToPanNo: "AAACT2727Q", industry: "Manufacturing", segment: "Large Enterprise", salesperson: "Priya Sharma", gstRegistrationNo: "27AAACT2727Q1ZV", panNo: "AAACT2727Q", gstRegistrationDate: "2017-08-10", markAsRCM: false, gstRegistrationStatus: "Registered", arnNo: "", contactPersons: [], terms: [], deductionApplicable: true, deductionCode: "L001", lcApplicable: false, bgApplicable: true, accountReceivable: "A001", accountPayable: "", benfName: "Tata Motors Ltd", benfEmail: "", benfMobile: "", banks: [], remark: "Strategic OEM customer.", createdAt: "2023-11-20T10:00:00.000Z", updatedAt: "2025-05-01T09:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2023-11-20T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
];

const SEED_CATEGORIES = [
  { id: "cat1", code: "RM",   name: "Raw Material",   costMethod: "AVCO",     expenseAccount: "500010 — Raw Material Consumed",  incomeAccount: "400010 — Domestic Sales" },
  { id: "cat2", code: "FG",   name: "Finished Goods", costMethod: "FIFO",     expenseAccount: "500020 — Finished Goods COGS",    incomeAccount: "400010 — Domestic Sales" },
  { id: "cat3", code: "CONS", name: "Consumables",    costMethod: "Standard", expenseAccount: "500030 — Consumables Expense",    incomeAccount: "" },
  { id: "cat4", code: "SVC",  name: "Services",       costMethod: "Standard", expenseAccount: "600010 — Service Cost",           incomeAccount: "400030 — Service Revenue" },
  { id: "cat5", code: "SEMI", name: "Semi-Finished",  costMethod: "AVCO",     expenseAccount: "500040 — WIP / Semi-Finished",    incomeAccount: "400020 — Export Sales" },
];

const SEED_PRODUCTS = [
  { id: "3001", code: "P001", name: "MS Steel Rod 10mm", isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: true, invoicingPolicy: "Delivered Quantities", salesPrice: "75", taxes: ["GST 18%"], cost: "62", categoryCode: "RM", categoryName: "Raw Material", costMethod: "AVCO", catExpenseAccount: "500010 — Raw Material Consumed", catIncomeAccount: "400010 — Domestic Sales", stockUOM: "KG", internalNotes: "Store in dry area. Min dispatch qty: 100 KG.", variants: [{ id: "v1", attribute: "Grade", values: "Fe415, Fe500, Fe500D" }], optionalProducts: [], accessoryProducts: [], alternativeProducts: ["P005"], conversions: [{ id: "cv1", qtyStock: "1000", qtyPurchase: "1", purchaseUOM: "MT" }], purchaseDescription: "MS Steel Rod 10mm dia, conforming to IS:1786.", incomeAccount: "400010 — Domestic Sales", expenseAccount: "500010 — Raw Material Consumed", isActive: true, createdAt: "2024-01-10T09:00:00.000Z", updatedAt: "2025-03-01T10:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-01-10T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "3002", code: "P002", name: "HP EliteBook 840 G9", isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: false, invoicingPolicy: "Ordered Quantities", salesPrice: "95000", taxes: ["GST 18%"], cost: "82000", categoryCode: "FG", categoryName: "Finished Goods", costMethod: "FIFO", catExpenseAccount: "500020 — Finished Goods COGS", catIncomeAccount: "400010 — Domestic Sales", stockUOM: "NOS", internalNotes: "Handle with care. Serial number tracking mandatory.", variants: [], optionalProducts: ["P003"], accessoryProducts: [], alternativeProducts: [], conversions: [], purchaseDescription: "HP EliteBook 840 G9 — Core i7, 16GB RAM, 512GB SSD, Win 11 Pro.", incomeAccount: "400010 — Domestic Sales", expenseAccount: "500020 — Finished Goods COGS", isActive: true, createdAt: "2024-02-01T10:00:00.000Z", updatedAt: "2025-02-20T14:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-02-01T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "3003", code: "P003", name: "AMC & On-Site Support", isSold: true, isPurchase: false, isService: true, isStocked: false, isManufactured: false, invoicingPolicy: "Ordered Quantities", salesPrice: "18000", taxes: ["GST 18%"], cost: "8000", categoryCode: "SVC", categoryName: "Services", costMethod: "Standard", catExpenseAccount: "600010 — Service Cost", catIncomeAccount: "400030 — Service Revenue", stockUOM: "NOS", internalNotes: "Annual maintenance contract. SLA: 8x5, 4-hour response.", variants: [], optionalProducts: [], accessoryProducts: [], alternativeProducts: [], conversions: [], purchaseDescription: "", incomeAccount: "400030 — Service Revenue", expenseAccount: "600010 — Service Cost", isActive: true, createdAt: "2024-03-05T09:00:00.000Z", updatedAt: "2024-12-01T11:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-03-05T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "3004", code: "P004", name: "Nitrile Safety Gloves (M)", isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: false, invoicingPolicy: "Delivered Quantities", salesPrice: "45", taxes: ["GST 12%"], cost: "32", categoryCode: "CONS", categoryName: "Consumables", costMethod: "Standard", catExpenseAccount: "500030 — Consumables Expense", catIncomeAccount: "", stockUOM: "PAIR", internalNotes: "ISI marked. Check expiry on each box.", variants: [{ id: "v2", attribute: "Size", values: "S, M, L, XL" }], optionalProducts: [], accessoryProducts: [], alternativeProducts: [], conversions: [{ id: "cv2", qtyStock: "100", qtyPurchase: "1", purchaseUOM: "BOX" }], purchaseDescription: "Nitrile Safety Gloves, ISI certified. 100 pairs per box.", incomeAccount: "", expenseAccount: "500030 — Consumables Expense", isActive: true, createdAt: "2024-04-10T09:00:00.000Z", updatedAt: "2025-01-10T09:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2024-04-10T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
  { id: "3005", code: "P005", name: "TMT Bar 12mm Fe500", isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: false, invoicingPolicy: "Delivered Quantities", salesPrice: "68", taxes: ["GST 18%"], cost: "56", categoryCode: "RM", categoryName: "Raw Material", costMethod: "AVCO", catExpenseAccount: "500010 — Raw Material Consumed", catIncomeAccount: "400010 — Domestic Sales", stockUOM: "KG", internalNotes: "Discontinued — replaced by P001.", variants: [], optionalProducts: [], accessoryProducts: [], alternativeProducts: ["P001"], conversions: [{ id: "cv3", qtyStock: "1000", qtyPurchase: "1", purchaseUOM: "MT" }], purchaseDescription: "TMT Bar 12mm dia, IS:1786 Grade Fe500.", incomeAccount: "400010 — Domestic Sales", expenseAccount: "500010 — Raw Material Consumed", isActive: false, createdAt: "2023-06-01T09:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [{ timestamp: "2023-06-01T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }] },
];

const SEED_USERS = [
  { id: "u001", code: "U001", name: "Admin User", email: "admin@speedinnovations.in", password: "Admin@123", role: "Admin", department: "IT", mobile: "9800000001", isActive: true, displayName: "Admin", emailAddress: "admin@speedinnovations.in", smtpServer: "", smtpPort: "587", smtpSSL: false, ccEmails: "", outlookEmail: false, fixLoginPC: "", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z", createdBy: "System", updatedBy: "System", changelog: [] },
  { id: "u002", code: "U002", name: "Arjun Mehta", email: "arjun.mehta@speedinnovations.in", password: "User@123", role: "User", department: "Sales", mobile: "9800000002", isActive: true, displayName: "Arjun M", emailAddress: "arjun.mehta@speedinnovations.in", smtpServer: "", smtpPort: "587", smtpSSL: false, ccEmails: "", outlookEmail: false, fixLoginPC: "", createdAt: "2024-01-05T00:00:00.000Z", updatedAt: "2024-01-05T00:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [] },
  { id: "u003", code: "U003", name: "Priya Sharma", email: "priya.sharma@speedinnovations.in", password: "User@123", role: "Manager", department: "Purchase", mobile: "9800000003", isActive: true, displayName: "Priya S", emailAddress: "priya.sharma@speedinnovations.in", smtpServer: "", smtpPort: "587", smtpSSL: false, ccEmails: "", outlookEmail: false, fixLoginPC: "", createdAt: "2024-01-06T00:00:00.000Z", updatedAt: "2024-01-06T00:00:00.000Z", createdBy: "Admin", updatedBy: "Admin", changelog: [] },
];

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const sql = getDb();
  try {
    await ensureSchema(sql);

    // Seed vendors
    const vendorCount = await sql`SELECT COUNT(*) FROM vendors`;
    if (Number(vendorCount[0].count) === 0) {
      for (const v of SEED_VENDORS) {
        await sql`INSERT INTO vendors (id, code, name, is_deactivated, data, created_at, updated_at)
          VALUES (${v.id}, ${v.code}, ${v.name}, ${v.isDeactivated}, ${JSON.stringify(v)}, ${v.createdAt}, ${v.updatedAt})
          ON CONFLICT (id) DO NOTHING`;
      }
    }

    // Seed customers
    const custCount = await sql`SELECT COUNT(*) FROM customers`;
    if (Number(custCount[0].count) === 0) {
      for (const c of SEED_CUSTOMERS) {
        await sql`INSERT INTO customers (id, code, name, is_deactivated, data, created_at, updated_at)
          VALUES (${c.id}, ${c.code}, ${c.name}, ${c.isDeactivated}, ${JSON.stringify(c)}, ${c.createdAt}, ${c.updatedAt})
          ON CONFLICT (id) DO NOTHING`;
      }
    }

    // Seed product categories
    const catCount = await sql`SELECT COUNT(*) FROM product_categories`;
    if (Number(catCount[0].count) === 0) {
      for (const c of SEED_CATEGORIES) {
        await sql`INSERT INTO product_categories (id, code, name, cost_method, expense_account, income_account)
          VALUES (${c.id}, ${c.code}, ${c.name}, ${c.costMethod}, ${c.expenseAccount}, ${c.incomeAccount})
          ON CONFLICT (id) DO NOTHING`;
      }
    }

    // Seed products
    const prodCount = await sql`SELECT COUNT(*) FROM products`;
    if (Number(prodCount[0].count) === 0) {
      for (const p of SEED_PRODUCTS) {
        await sql`INSERT INTO products (id, code, name, category_code, stock_uom, sales_price, is_active, data, created_at, updated_at)
          VALUES (${p.id}, ${p.code}, ${p.name}, ${p.categoryCode}, ${p.stockUOM}, ${Number(p.salesPrice)}, ${p.isActive}, ${JSON.stringify(p)}, ${p.createdAt}, ${p.updatedAt})
          ON CONFLICT (id) DO NOTHING`;
      }
    }

    // Seed users
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    if (Number(userCount[0].count) === 0) {
      for (const u of SEED_USERS) {
        await sql`INSERT INTO users (id, code, name, email, password, role, department, is_active, data, created_at, updated_at)
          VALUES (${u.id}, ${u.code}, ${u.name}, ${u.email}, ${u.password}, ${u.role}, ${u.department}, ${u.isActive}, ${JSON.stringify(u)}, ${u.createdAt}, ${u.updatedAt})
          ON CONFLICT (id) DO NOTHING`;
      }
    }

    return res.json({
      success: true,
      message: 'Database initialised successfully. All tables created and seed data inserted.',
      defaultLogin: { email: 'admin@speedinnovations.in', password: 'Admin@123' }
    });
  } catch (err) {
    console.error('Init error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
