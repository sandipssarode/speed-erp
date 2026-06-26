import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight, Package } from "lucide-react";
import { api } from "../../lib/api.js";

// ─── Seed Categories ──────────────────────────────────────────
export const SEED_CATEGORIES = [
  { id: "cat1", code: "RM",   name: "Raw Material",    costMethod: "AVCO",     expenseAccount: "500010 — Raw Material Consumed",   incomeAccount: "400010 — Domestic Sales" },
  { id: "cat2", code: "FG",   name: "Finished Goods",  costMethod: "FIFO",     expenseAccount: "500020 — Finished Goods COGS",     incomeAccount: "400010 — Domestic Sales" },
  { id: "cat3", code: "CONS", name: "Consumables",     costMethod: "Standard", expenseAccount: "500030 — Consumables Expense",     incomeAccount: "" },
  { id: "cat4", code: "SVC",  name: "Services",        costMethod: "Standard", expenseAccount: "600010 — Service Cost",            incomeAccount: "400030 — Service Revenue" },
  { id: "cat5", code: "SEMI", name: "Semi-Finished",   costMethod: "AVCO",     expenseAccount: "500040 — WIP / Semi-Finished",     incomeAccount: "400020 — Export Sales" },
];

// ─── Seed Products ────────────────────────────────────────────
const SEED_PRODUCTS = [
  {
    id: "3001", code: "P001", name: "MS Steel Rod 10mm",
    isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: true,
    invoicingPolicy: "Delivered Quantities",
    salesPrice: "75", taxes: ["GST 18%"], cost: "62",
    categoryCode: "RM", categoryName: "Raw Material", costMethod: "AVCO",
    catExpenseAccount: "500010 — Raw Material Consumed", catIncomeAccount: "400010 — Domestic Sales",
    stockUOM: "KG", internalNotes: "Store in covered, dry area. Avoid contact with moisture. Minimum dispatch quantity: 100 KG.",
    variants: [{ id: "v1", attribute: "Grade", values: "Fe415, Fe500, Fe500D" }],
    optionalProducts: [], accessoryProducts: [], alternativeProducts: ["P005"],
    conversions: [{ id: "cv1", qtyStock: "1000", qtyPurchase: "1", purchaseUOM: "MT" }],
    purchaseDescription: "MS Steel Rod 10mm dia, conforming to IS:1786. Grade as per PO. Mill test certificate required.",
    incomeAccount: "400010 — Domestic Sales", expenseAccount: "500010 — Raw Material Consumed",
    isActive: true,
    createdAt: "2024-01-10T09:00:00.000Z", updatedAt: "2025-03-01T10:00:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [{ timestamp: "2024-01-10T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }],
  },
  {
    id: "3002", code: "P002", name: "HP EliteBook 840 G9",
    isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: false,
    invoicingPolicy: "Ordered Quantities",
    salesPrice: "95000", taxes: ["GST 18%"], cost: "82000",
    categoryCode: "FG", categoryName: "Finished Goods", costMethod: "FIFO",
    catExpenseAccount: "500020 — Finished Goods COGS", catIncomeAccount: "400010 — Domestic Sales",
    stockUOM: "NOS", internalNotes: "Handle with care. Keep in original anti-static packaging. Serial number tracking mandatory on each unit.",
    variants: [],
    optionalProducts: ["P003"], accessoryProducts: [], alternativeProducts: [],
    conversions: [],
    purchaseDescription: "HP EliteBook 840 G9 — Core i7, 16GB RAM, 512GB SSD, Win 11 Pro. Part No: 5P6N3EA#ACJ. Warranty card mandatory.",
    incomeAccount: "400010 — Domestic Sales", expenseAccount: "500020 — Finished Goods COGS",
    isActive: true,
    createdAt: "2024-02-01T10:00:00.000Z", updatedAt: "2025-02-20T14:00:00.000Z",
    createdBy: "Admin", updatedBy: "Priya Sharma",
    changelog: [
      { timestamp: "2024-02-01T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-02-20T14:00:00.000Z", user: "Priya Sharma", action: "Updated", changes: "Price updated" },
    ],
  },
  {
    id: "3003", code: "P003", name: "AMC & On-Site Support",
    isSold: true, isPurchase: false, isService: true, isStocked: false, isManufactured: false,
    invoicingPolicy: "Ordered Quantities",
    salesPrice: "18000", taxes: ["GST 18%"], cost: "8000",
    categoryCode: "SVC", categoryName: "Services", costMethod: "Standard",
    catExpenseAccount: "600010 — Service Cost", catIncomeAccount: "400030 — Service Revenue",
    stockUOM: "NOS", internalNotes: "Annual maintenance contract. Billed annually. SLA: 8x5, 4-hour response time.",
    variants: [],
    optionalProducts: [], accessoryProducts: [], alternativeProducts: [],
    conversions: [],
    purchaseDescription: "",
    incomeAccount: "400030 — Service Revenue", expenseAccount: "600010 — Service Cost",
    isActive: true,
    createdAt: "2024-03-05T09:00:00.000Z", updatedAt: "2024-12-01T11:00:00.000Z",
    createdBy: "Admin", updatedBy: "Arjun Mehta",
    changelog: [
      { timestamp: "2024-03-05T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2024-12-01T11:00:00.000Z", user: "Arjun Mehta", action: "Updated", changes: "Price revised" },
    ],
  },
  {
    id: "3004", code: "P004", name: "Nitrile Safety Gloves (M)",
    isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: false,
    invoicingPolicy: "Delivered Quantities",
    salesPrice: "45", taxes: ["GST 12%"], cost: "32",
    categoryCode: "CONS", categoryName: "Consumables", costMethod: "Standard",
    catExpenseAccount: "500030 — Consumables Expense", catIncomeAccount: "",
    stockUOM: "PAIR", internalNotes: "ISI marked. Check expiry on each box. Store away from UV light and heat.",
    variants: [{ id: "v2", attribute: "Size", values: "S, M, L, XL" }],
    optionalProducts: [], accessoryProducts: [], alternativeProducts: [],
    conversions: [{ id: "cv2", qtyStock: "100", qtyPurchase: "1", purchaseUOM: "BOX" }],
    purchaseDescription: "Nitrile Safety Gloves, ISI certified. 100 pairs per box. Size as per PO.",
    incomeAccount: "", expenseAccount: "500030 — Consumables Expense",
    isActive: true,
    createdAt: "2024-04-10T09:00:00.000Z", updatedAt: "2025-01-10T09:00:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [{ timestamp: "2024-04-10T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" }],
  },
  {
    id: "3005", code: "P005", name: "TMT Bar 12mm Fe500",
    isSold: true, isPurchase: true, isService: false, isStocked: true, isManufactured: false,
    invoicingPolicy: "Delivered Quantities",
    salesPrice: "68", taxes: ["GST 18%"], cost: "56",
    categoryCode: "RM", categoryName: "Raw Material", costMethod: "AVCO",
    catExpenseAccount: "500010 — Raw Material Consumed", catIncomeAccount: "400010 — Domestic Sales",
    stockUOM: "KG", internalNotes: "Discontinued — replaced by P001 MS Steel Rod. Do not create new orders.",
    variants: [{ id: "v3", attribute: "Grade", values: "Fe415, Fe500" }],
    optionalProducts: [], accessoryProducts: [], alternativeProducts: ["P001"],
    conversions: [{ id: "cv3", qtyStock: "1000", qtyPurchase: "1", purchaseUOM: "MT" }],
    purchaseDescription: "TMT Bar 12mm dia, IS:1786 Grade Fe500. Mill test certificate mandatory.",
    incomeAccount: "400010 — Domestic Sales", expenseAccount: "500010 — Raw Material Consumed",
    isActive: false,
    createdAt: "2023-06-01T09:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [
      { timestamp: "2023-06-01T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-01-01T00:00:00.000Z", user: "Admin", action: "Updated", changes: "Deactivated — product discontinued" },
    ],
  },
];

// Type badge helpers
const TYPE_BADGES = [
  { key: "isSold",         label: "Sold",   color: "bg-blue-50 text-brand-600 border-blue-200" },
  { key: "isPurchase",     label: "Purch",  color: "bg-purple-50 text-purple-600 border-purple-200" },
  { key: "isService",      label: "SVC",    color: "bg-teal-50 text-teal-600 border-teal-200" },
  { key: "isStocked",      label: "Stock",  color: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "isManufactured", label: "Mfg",    color: "bg-green-50 text-green-700 border-green-200" },
];

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    api.get("/api/products")
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(products.map((p) => p.categoryCode).filter(Boolean))];

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.code?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.stockUOM?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && p.isActive) ||
      (filterStatus === "inactive" && !p.isActive);
    const matchCat = filterCategory === "all" || p.categoryCode === filterCategory;
    const matchType =
      filterType === "all" ||
      (filterType === "sold" && p.isSold) ||
      (filterType === "purchase" && p.isPurchase) ||
      (filterType === "service" && p.isService) ||
      (filterType === "stocked" && p.isStocked) ||
      (filterType === "manufactured" && p.isManufactured);
    return matchSearch && matchStatus && matchCat && matchType;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <span>Master</span>
              <ChevronRight size={12} />
              <span className="text-gray-600 font-medium">Product Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Product Master</h1>
          </div>
          <button
            onClick={() => navigate("/products/new")}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New Product
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Name, Category, UOM..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600">
            <option value="all">All Types</option>
            <option value="sold">Sold</option>
            <option value="purchase">Purchase</option>
            <option value="service">Service</option>
            <option value="stocked">Stocked</option>
            <option value="manufactured">Manufactured</option>
          </select>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600">
            <option value="all">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} of {products.length} record(s)</span>
        </div>

        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading products...</p>}
        {/* Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">UOM</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Sales Price</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                    <Package size={28} className="mx-auto mb-2 text-gray-300" />
                    {products.length === 0
                      ? 'No products yet. Click "Add New Product" to get started.'
                      : "No products match your search or filters."}
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-600">{p.code}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{p.categoryCode}</span>
                      <span className="ml-1.5 text-gray-500 text-xs">{p.categoryName}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 text-xs font-medium">{p.stockUOM}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-800">
                      ₹{Number(p.salesPrice || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1 flex-wrap">
                        {TYPE_BADGES.filter((b) => p[b.key]).map((b) => (
                          <span key={b.key} className={`text-xs px-1.5 py-0.5 rounded border font-medium ${b.color}`}>{b.label}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        p.isActive ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => navigate(`/products/${p.id}`)}
                          className="p-1.5 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded" title="Edit">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right px-1">Showing {filtered.length} product(s)</p>
        )}
      </div>
    </Layout>
  );
}

