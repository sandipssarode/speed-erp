import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Plus, Trash2, Edit2, FileText, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft, ChevronDown, Package,
} from "lucide-react";
import { SEED_CATEGORIES } from "./ProductList";

// ─────────────────────────────────────────────────────────────
// MASTER DATA
// ─────────────────────────────────────────────────────────────
const UOM_OPTIONS = ["NOS", "KG", "MT", "LTR", "BOX", "PAIR", "SET", "MTR", "SQM", "PKT", "BAG", "RLL", "DZN", "GRM", "TON"];
const TAX_OPTIONS  = ["GST 5%", "GST 12%", "GST 18%", "GST 28%", "IGST 5%", "IGST 12%", "IGST 18%", "IGST 28%", "Nil Rated", "Exempt"];
const COST_METHODS = ["Standard Price", "Average Cost (AVCO)", "First In First Out (FIFO)"];
const INVOICING_POLICIES = ["Ordered Quantities", "Delivered Quantities"];
const ATTRIBUTE_OPTIONS = ["Colour", "Size", "Grade", "Material", "Thickness", "Weight", "Voltage", "Capacity", "Dimension", "Finish"];

const INCOME_ACCOUNTS = [
  "400010 — Domestic Sales",
  "400020 — Export Sales",
  "400030 — Service Revenue",
  "400040 — Other Income",
];
const EXPENSE_ACCOUNTS = [
  "500010 — Raw Material Consumed",
  "500020 — Finished Goods COGS",
  "500030 — Consumables Expense",
  "500040 — WIP / Semi-Finished",
  "600010 — Service Cost",
  "600020 — Admin & Overhead",
];

// ─────────────────────────────────────────────────────────────
// EMPTY FORM
// ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  id: "", code: "", name: "", productImageUrl: "",
  isSold: true, isPurchase: true, isService: false, isStocked: false, isManufactured: false,
  invoicingPolicy: "Ordered Quantities",
  salesPrice: "", taxes: [], cost: "",
  categoryCode: "", categoryName: "", costMethod: "",
  catExpenseAccount: "", catIncomeAccount: "",
  stockUOM: "", internalNotes: "",
  variants: [],
  optionalProducts: [], accessoryProducts: [], alternativeProducts: [],
  conversions: [],
  purchaseDescription: "",
  incomeAccount: "", expenseAccount: "",
  isActive: true,
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.code.trim()) e.code = "Product Code is a required field.";
  if (!form.name.trim()) e.name = "Product Name is a required field.";
  else if (form.name.length > 128) e.name = "Product Name cannot exceed 128 characters.";
  if (!form.isSold && !form.isPurchase) e.typeFlags = "At least one of Sold or Purchase must be enabled for this product.";
  if (!form.invoicingPolicy) e.invoicingPolicy = "Invoicing Policy is a required field.";
  if (!form.salesPrice || isNaN(Number(form.salesPrice))) e.salesPrice = "Sales Price is a required field.";
  if (!form.categoryCode.trim()) e.categoryCode = "Category Code is a required field.";
  if (!form.categoryName.trim()) e.categoryName = "Category Name is a required field.";
  if (!form.costMethod) e.costMethod = "Inventory Valuation / Cost Method is a required field.";
  if (!form.stockUOM) e.stockUOM = "Stock Unit of Measure is a required field.";

  form.conversions.forEach((cv, i) => {
    if (!cv.purchaseUOM) e[`cv_uom_${i}`] = "Purchase UOM must be selected when a conversion is defined.";
    const q = Number(cv.qtyPurchase);
    if (!cv.qtyPurchase || isNaN(q) || q <= 0)
      e[`cv_qty_${i}`] = "Conversion Quantity must be greater than zero.";
  });

  return e;
}

// ─────────────────────────────────────────────────────────────
// AUTO CODE GENERATOR
// ─────────────────────────────────────────────────────────────
function generateCode(name, products) {
  const prefix = "P";
  const nums = products.filter((p) => /^P\d+$/.test(p.code)).map((p) => parseInt(p.code.slice(1)) || 0);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES
// ─────────────────────────────────────────────────────────────
const inputBase = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-brand-600"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={11} className="shrink-0" />{error}</p>}
    </div>
  );
}

function TInput({ value, onChange, disabled, placeholder, maxLength, error, type = "text" }) {
  return <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled}
    placeholder={placeholder} maxLength={maxLength} className={inputBase(disabled, error)} />;
}

function TSelect({ value, onChange, disabled, options, placeholder, error }) {
  return (
    <select value={value ?? ""} onChange={onChange} disabled={disabled} className={inputBase(disabled, error)}>
      <option value="">{placeholder || "Select..."}</option>
      {options.map((o) => typeof o === "string"
        ? <option key={o} value={o}>{o}</option>
        : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}

function TTextarea({ value, onChange, disabled, rows = 3, placeholder }) {
  return <textarea value={value ?? ""} onChange={onChange} disabled={disabled}
    rows={rows} placeholder={placeholder} className={`${inputBase(disabled)} resize-none`} />;
}

function TCheckbox({ checked, onChange, disabled, label }) {
  return (
    <label className={`flex items-center gap-2 text-sm select-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input type="checkbox" checked={!!checked} onChange={onChange} disabled={disabled}
        className="w-3.5 h-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-600 focus:ring-1" />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

// Multi-select dropdown for taxes
function TaxMultiSelect({ selected, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => !disabled && setOpen(!open)} disabled={disabled}
        className={`${inputBase(disabled)} text-left flex items-center justify-between`}>
        <span className={selected.length === 0 ? "text-gray-400 text-sm" : "text-gray-800 text-sm truncate"}>
          {selected.length === 0 ? "Select taxes..." : selected.join(", ")}
        </span>
        <ChevronDown size={13} className="text-gray-400 shrink-0 ml-1" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded shadow-lg p-2 space-y-0.5 max-h-48 overflow-y-auto">
          {TAX_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(opt)}
                onChange={(e) => { if (e.target.checked) onChange([...selected, opt]); else onChange(selected.filter((x) => x !== opt)); }}
                className="w-3.5 h-3.5 text-brand-600" />
              {opt}
            </label>
          ))}
          <button onClick={() => setOpen(false)} className="w-full text-xs text-brand-600 text-center py-1.5 hover:bg-brand-50 rounded mt-1 border-t border-gray-100">Done</button>
        </div>
      )}
    </div>
  );
}

// Product tag selector for optional/accessory/alternative products
function ProductTagSelect({ selected, onChange, allProducts, disabled, placeholder }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const suggestions = allProducts.filter((p) =>
    !selected.includes(p.code) &&
    (p.code.toLowerCase().includes(query.toLowerCase()) || p.name.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="relative" ref={ref}>
      <div className="flex flex-wrap gap-1 min-h-[34px] px-2 py-1 border border-gray-300 rounded bg-white hover:border-gray-400">
        {selected.map((code) => {
          const p = allProducts.find((x) => x.code === code);
          return (
            <span key={code} className="inline-flex items-center gap-1 bg-brand-50 text-brand-600 text-xs px-2 py-0.5 rounded border border-blue-200">
              <span className="font-mono">{code}</span>{p ? ` — ${p.name}` : ""}
              {!disabled && <button type="button" onClick={() => onChange(selected.filter((c) => c !== code))} className="hover:text-red-500 ml-0.5 font-bold">×</button>}
            </span>
          );
        })}
        {!disabled && (
          <input value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[100px] text-sm outline-none bg-transparent py-0.5 px-1" />
        )}
      </div>
      {open && !disabled && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded shadow-lg max-h-44 overflow-y-auto">
          {suggestions.slice(0, 10).map((p) => (
            <button key={p.code} type="button"
              onClick={() => { onChange([...selected, p.code]); setQuery(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-brand-50 flex items-center gap-2.5 border-b border-gray-50">
              <span className="font-mono text-xs text-brand-600 w-14 shrink-0">{p.code}</span>
              <span className="text-gray-700">{p.name}</span>
              <span className="ml-auto text-xs text-gray-400">{p.stockUOM}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ADD CATEGORY MODAL
// ─────────────────────────────────────────────────────────────
function CategoryModal({ onSave, onClose, categories }) {
  const [cat, setCat] = useState({ code: "", name: "", costMethod: "", expenseAccount: "", incomeAccount: "" });
  const [errs, setErrs] = useState({});

  const setF = (k, v) => {
    setCat((p) => ({ ...p, [k]: v }));
    if (errs[k]) setErrs((p) => { const e = { ...p }; delete e[k]; return e; });
  };

  const save = () => {
    const e = {};
    if (!cat.code.trim()) e.code = "Category Code is required.";
    else if (categories.some((c) => c.code === cat.code.trim().toUpperCase())) e.code = "Category Code already exists. Please enter a unique code.";
    if (!cat.name.trim()) e.name = "Category Name is required.";
    if (!cat.costMethod) e.costMethod = "Inventory Valuation / Cost Method is required.";
    if (Object.keys(e).length) { setErrs(e); return; }

    const newCat = { id: Date.now().toString(), code: cat.code.trim().toUpperCase(), name: cat.name.trim(), costMethod: cat.costMethod, expenseAccount: cat.expenseAccount, incomeAccount: cat.incomeAccount };
    api.post("/api/product-categories", newCat).catch(console.error);
    onSave(newCat);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-[500px] max-w-full mx-4">
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-800">Add New Product Category</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded"><X size={16} /></button>
        </div>
        <div className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category Code" required error={errs.code}>
              <TInput value={cat.code} onChange={(e) => setF("code", e.target.value.toUpperCase())} placeholder="e.g. RM, FG, CONS" error={errs.code} />
            </Field>
            <Field label="Category Name" required error={errs.name}>
              <TInput value={cat.name} onChange={(e) => setF("name", e.target.value)} placeholder="e.g. Raw Material" error={errs.name} />
            </Field>
          </div>
          <Field label="Inventory Valuation / Cost Method" required error={errs.costMethod}>
            <TSelect value={cat.costMethod} onChange={(e) => setF("costMethod", e.target.value)} options={COST_METHODS} placeholder="Select Method" error={errs.costMethod} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Expense Account">
              <TSelect value={cat.expenseAccount} onChange={(e) => setF("expenseAccount", e.target.value)} options={EXPENSE_ACCOUNTS} placeholder="Select Account" />
            </Field>
            <Field label="Income Account">
              <TSelect value={cat.incomeAccount} onChange={(e) => setF("incomeAccount", e.target.value)} options={INCOME_ACCOUNTS} placeholder="Select Account" />
            </Field>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1.5 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50">Cancel</button>
          <button onClick={save} className="px-4 py-1.5 text-sm bg-brand-600 hover:bg-brand-700 text-white rounded flex items-center gap-1.5"><Save size={13} /> Save Category</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    Promise.all([
      api.get("/api/product-categories"),
      api.get("/api/products"),
    ]).then(([cats, prods]) => {
      setAllCategories(cats.length ? cats : []);
      setAllProducts(prods);
      if (!isNew && id) {
        const found = prods.find((p) => p.id === id);
        if (found) setForm(found);
        else navigate("/products");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && mode === "new" && !prev.code)
        next.code = generateCode(value, allProducts);
      return next;
    });
    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  const selectCategory = (cat) => {
    setForm((prev) => ({
      ...prev,
      categoryCode: cat.code,
      categoryName: cat.name,
      costMethod: cat.costMethod,
      catExpenseAccount: cat.expenseAccount,
      catIncomeAccount: cat.incomeAccount,
    }));
    ["categoryCode", "categoryName", "costMethod"].forEach((k) => {
      setErrors((prev) => { const e = { ...prev }; delete e[k]; return e; });
    });
  };

  // ── Save ──
  const handleSave = async () => {
    const errs = validate(form);
    if (form.code && allProducts.some((p) => p.code === form.code && p.id !== (isNew ? null : id)))
      errs.code = "Product Code already exists. Please enter a unique code.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const keys = Object.keys(errs);
      if (keys.some((k) => ["code","name","typeFlags","salesPrice","categoryCode","categoryName","costMethod","stockUOM"].includes(k))) setActiveTab("general");
      else if (keys.some((k) => k === "invoicingPolicy" || k.startsWith("cv_"))) setActiveTab("sales");
      showToast("Please correct the highlighted fields and try again.", "error");
      return;
    }

    const now = new Date().toISOString();
    const userName = user.name || user.fullName || "System";
    const changeEntry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };

    try {
      let saved;
      if (isNew) {
        const payload = { ...form, id: Date.now().toString(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [changeEntry] };
        saved = await api.post("/api/products", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/products/${id}`, payload);
      }
      setForm(saved);
      setAllProducts((prev) => isNew ? [...prev, saved] : prev.map((p) => p.id === saved.id ? saved : p));
      setMode("view");
      setErrors({});
      showToast("Product saved successfully.");
      if (isNew) navigate(`/products/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save product.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/products"); return; }
    try {
      const found = await api.get(`/api/products/${id}`);
      setForm(found);
    } catch { /* keep current form */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete product "${form.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/products/${id}`);
      navigate("/products");
    } catch (err) {
      showToast(err.message || "Failed to delete product.", "error");
    }
  };

  // Sub-table helpers — Variants
  const addVariant  = () => setForm((p) => ({ ...p, variants: [...p.variants, { id: Date.now(), attribute: "", values: "" }] }));
  const updVariant  = (i, k, v) => setForm((p) => { const a = [...p.variants]; a[i] = { ...a[i], [k]: v }; return { ...p, variants: a }; });
  const delVariant  = (i) => setForm((p) => ({ ...p, variants: p.variants.filter((_, x) => x !== i) }));

  // Sub-table helpers — Conversions
  const addConv  = () => setForm((p) => ({ ...p, conversions: [...p.conversions, { id: Date.now(), qtyStock: "", qtyPurchase: "", purchaseUOM: "" }] }));
  const updConv  = (i, k, v) => setForm((p) => { const a = [...p.conversions]; a[i] = { ...a[i], [k]: v }; return { ...p, conversions: a }; });
  const delConv  = (i) => setForm((p) => ({ ...p, conversions: p.conversions.filter((_, x) => x !== i) }));

  const TABS = [
    { id: "general",  label: "General Information" },
    { id: "variants", label: "Attributes & Variants" },
    { id: "sales",    label: "Sales" },
    { id: "accounting", label: "Accounting" },
  ];

  const tabHasError = (tabId) => {
    const keys = Object.keys(errors);
    if (tabId === "general") return keys.some((k) => ["code","name","typeFlags","salesPrice","categoryCode","categoryName","costMethod","stockUOM"].includes(k));
    if (tabId === "sales") return keys.some((k) => k === "invoicingPolicy" || k.startsWith("cv_"));
    return false;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* Category Modal */}
        {showCategoryModal && (
          <CategoryModal
            categories={allCategories}
            onClose={() => setShowCategoryModal(false)}
            onSave={(newCat) => {
              const updated = [...allCategories, newCat];
              setAllCategories(updated);
              selectCategory(newCat);
              setShowCategoryModal(false);
              showToast(`Category "${newCat.code} — ${newCat.name}" created and selected.`);
            }}
          />
        )}

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Master</span><ChevronRight size={12} />
          <button onClick={() => navigate("/products")} className="hover:text-brand-500 transition-colors">Product Master</button>
          {form.code && <><ChevronRight size={12} /><span className="text-brand-600 font-medium">{form.code}</span></>}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${
            toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* ── ACTION TOOLBAR ── */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <button onClick={() => navigate("/products")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <ArrowLeft size={13} /> Back
          </button>
          {mode === "view" && (
            <button onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium">
              <Edit2 size={13} /> Edit
            </button>
          )}
          {(mode === "new" || mode === "edit") && (
            <>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                <Save size={13} /> Save
              </button>
              <button onClick={handleDiscard}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium">
                <X size={13} /> Discard
              </button>
            </>
          )}
          {mode === "view" && !isNew && (
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium">
              <Trash2 size={13} /> Delete
            </button>
          )}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setShowChangelog(!showChangelog)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${
              showChangelog ? "border-blue-300 bg-blue-50 text-brand-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}>
            <FileText size={13} /> Changelog
          </button>
          {form.updatedAt && (
            <div className="ml-auto text-xs text-gray-400 text-right">
              <span>Updated: {new Date(form.updatedAt).toLocaleString()}</span>
              <span className="ml-2">by {form.updatedBy}</span>
            </div>
          )}
        </div>

        {/* ── CHANGELOG PANEL ── */}
        {showChangelog && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText size={14} /> Audit Log — {form.name || "New Product"}</h3>
            {!form.changelog?.length ? (
              <p className="text-xs text-gray-400 py-4 text-center">No changes recorded yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-gray-500 font-medium">Date & Time</th>
                  <th className="text-left pb-2 text-gray-500 font-medium">User</th>
                  <th className="text-left pb-2 text-gray-500 font-medium">Action</th>
                  <th className="text-left pb-2 text-gray-500 font-medium">Details</th>
                </tr></thead>
                <tbody>
                  {form.changelog.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td>
                      <td className="py-1.5 text-gray-600">{c.user}</td>
                      <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-brand-600"}`}>{c.action}</span></td>
                      <td className="py-1.5 text-gray-600">{c.changes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── HEADER SECTION ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-gradient-to-r from-brand-900 to-brand-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center shrink-0">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-bold text-base tracking-wide">{form.code || "NEW PRODUCT"}</span>
            <span className="text-blue-200 text-sm truncate">{form.name || "—"}</span>
            <div className="ml-auto flex items-center gap-2">
              {(mode === "new" || mode === "edit") && (
                <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                  {mode === "new" ? "New Record" : "Editing"}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                form.isActive ? "bg-green-400/20 text-green-100 border-green-300/30" : "bg-red-400/20 text-red-100 border-red-300/30"
              }`}>{form.isActive ? "Active" : "Inactive"}</span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Row 1: Code, Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Product Code" required error={errors.code}>
                <TInput value={form.code} onChange={(e) => setField("code", e.target.value.toUpperCase())}
                  disabled={isReadOnly} placeholder="Auto / Manual e.g. P001" error={errors.code} />
              </Field>
              <Field label="Product Name" required error={errors.name} className="col-span-2">
                <TInput value={form.name} onChange={(e) => setField("name", e.target.value)}
                  disabled={isReadOnly} placeholder="Full product name (max 128 chars)" maxLength={128} error={errors.name} />
              </Field>
            </div>

            {/* Row 2: Type checkboxes + Deactivate */}
            <div className="flex items-center gap-6 pt-1 border-t border-gray-100 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Type:</span>
              <TCheckbox checked={form.isSold} onChange={(e) => setField("isSold", e.target.checked)} disabled={isReadOnly} label="Sold" />
              <TCheckbox checked={form.isPurchase} onChange={(e) => setField("isPurchase", e.target.checked)} disabled={isReadOnly} label="Purchase" />
              <TCheckbox checked={form.isService} onChange={(e) => setField("isService", e.target.checked)} disabled={isReadOnly} label="Service" />
              <TCheckbox checked={form.isStocked} onChange={(e) => setField("isStocked", e.target.checked)} disabled={isReadOnly} label="Stocked" />
              <TCheckbox checked={form.isManufactured} onChange={(e) => setField("isManufactured", e.target.checked)} disabled={isReadOnly} label="Manufactured" />
              <div className="ml-auto">
                <TCheckbox checked={!form.isActive} onChange={(e) => setField("isActive", !e.target.checked)} disabled={isReadOnly} label="Deactivate Product" />
              </div>
            </div>
            {errors.typeFlags && (
              <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.typeFlags}</p>
            )}
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id ? "border-brand-600 text-brand-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                {tab.label}
                {tabHasError(tab.id) && <AlertCircle size={12} className="text-red-400" />}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* ══════════ GENERAL INFORMATION ══════════ */}
            {activeTab === "general" && (
              <div className="space-y-5">

                {/* Pricing + Category side by side */}
                <div className="grid grid-cols-2 gap-5 items-start">

                  {/* LEFT: Pricing */}
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pricing</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Sales Price (₹)" required error={errors.salesPrice}>
                        <TInput value={form.salesPrice} onChange={(e) => setField("salesPrice", e.target.value)}
                          disabled={isReadOnly} placeholder="0.00" type="number" error={errors.salesPrice} />
                      </Field>
                      <Field label="Cost (₹)">
                        <TInput value={form.cost} onChange={(e) => setField("cost", e.target.value)}
                          disabled={isReadOnly} placeholder="0.00" type="number" />
                      </Field>
                    </div>
                    <Field label="Taxes Applied">
                      <TaxMultiSelect selected={form.taxes} onChange={(v) => setField("taxes", v)} disabled={isReadOnly} />
                    </Field>
                    {form.salesPrice && form.taxes.length > 0 && (
                      <p className="text-xs text-gray-400">
                        Price incl. tax ≈ ₹{(Number(form.salesPrice) * (1 + form.taxes.reduce((s, t) => {
                          const m = t.match(/(\d+)%/); return s + (m ? Number(m[1]) / 100 : 0);
                        }, 0))).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>

                  {/* RIGHT: Product Category */}
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Product Category</p>
                      {!isReadOnly && (
                        <button onClick={() => setShowCategoryModal(true)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded">
                          <Plus size={11} /> Add New
                        </button>
                      )}
                    </div>
                    <Field label="Select Category" required error={errors.categoryCode}>
                      <TSelect
                        value={form.categoryCode}
                        onChange={(e) => {
                          const cat = allCategories.find((c) => c.code === e.target.value);
                          if (cat) selectCategory(cat);
                          else setField("categoryCode", "");
                        }}
                        disabled={isReadOnly}
                        options={allCategories.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                        placeholder="Select Category"
                        error={errors.categoryCode}
                      />
                    </Field>
                    {form.categoryCode && (
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Category Name" required error={errors.categoryName}>
                          <TInput value={form.categoryName} onChange={(e) => setField("categoryName", e.target.value)}
                            disabled={isReadOnly} placeholder="Category Name" error={errors.categoryName} />
                        </Field>
                        <Field label="Cost Method" required error={errors.costMethod}>
                          <TSelect value={form.costMethod} onChange={(e) => setField("costMethod", e.target.value)}
                            disabled={isReadOnly} options={COST_METHODS} placeholder="Select Method" error={errors.costMethod} />
                        </Field>
                        <Field label="Expense Account">
                          <TSelect value={form.catExpenseAccount} onChange={(e) => setField("catExpenseAccount", e.target.value)}
                            disabled={isReadOnly} options={EXPENSE_ACCOUNTS} placeholder="From CoA Master" />
                        </Field>
                        <Field label="Income Account">
                          <TSelect value={form.catIncomeAccount} onChange={(e) => setField("catIncomeAccount", e.target.value)}
                            disabled={isReadOnly} options={INCOME_ACCOUNTS} placeholder="From CoA Master" />
                        </Field>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock UOM */}
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Stock Unit of Measure</p>
                  <div className="max-w-xs">
                    <Field label="Stock UOM" required error={errors.stockUOM}>
                      <TSelect value={form.stockUOM} onChange={(e) => setField("stockUOM", e.target.value)}
                        disabled={isReadOnly} options={UOM_OPTIONS} placeholder="Select UOM" error={errors.stockUOM} />
                    </Field>
                    {form.stockUOM && (
                      <p className="text-xs text-gray-400 mt-1">All stock quantities, SO lines, and PO lines default to <strong>{form.stockUOM}</strong>.</p>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Internal Notes</p>
                  <TTextarea value={form.internalNotes} onChange={(e) => setField("internalNotes", e.target.value)}
                    disabled={isReadOnly} rows={4}
                    placeholder="QC notes, storage instructions, handling guidelines — never printed on customer/vendor documents." />
                </div>
              </div>
            )}

            {/* ══════════ ATTRIBUTES & VARIANTS ══════════ */}
            {activeTab === "variants" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Product Variants</p>
                    <p className="text-xs text-gray-400 mt-0.5">Each unique combination of attribute values creates one product variant record.</p>
                  </div>
                  {!isReadOnly && (
                    <button onClick={addVariant} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded">
                      <Plus size={13} /> Add Attribute
                    </button>
                  )}
                </div>

                {form.variants.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No attributes defined.{!isReadOnly && ' Click "Add Attribute" to define product variants.'}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <th className="px-3 py-2 text-left w-8">#</th>
                          <th className="px-3 py-2 text-left w-52">Attribute</th>
                          <th className="px-3 py-2 text-left">Values <span className="normal-case font-normal text-gray-400">(comma-separated)</span></th>
                          {!isReadOnly && <th className="px-3 py-2 w-8"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v, i) => (
                          <tr key={v.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 min-w-[180px]">
                              <TSelect value={v.attribute} onChange={(e) => updVariant(i, "attribute", e.target.value)}
                                disabled={isReadOnly} options={ATTRIBUTE_OPTIONS} placeholder="Select Attribute" />
                            </td>
                            <td className="px-3 py-2">
                              <TInput value={v.values} onChange={(e) => updVariant(i, "values", e.target.value)}
                                disabled={isReadOnly} placeholder="e.g. Red, Blue, Green" />
                            </td>
                            {!isReadOnly && (
                              <td className="px-3 py-2">
                                <button onClick={() => delVariant(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {form.variants.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded p-3">
                    <p className="text-xs text-blue-700 font-medium">
                      {form.variants.filter((v) => v.attribute && v.values).map((v) => v.values.split(",").map((x) => x.trim()).filter(Boolean).length)
                        .reduce((a, b) => a * b, 1)} variant(s) will be created from {form.variants.filter((v) => v.attribute && v.values).length} attribute(s).
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ SALES ══════════ */}
            {activeTab === "sales" && (
              <div className="space-y-5">

                {/* Invoicing Policy */}
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Invoicing</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Field label="Invoicing Policy" required error={errors.invoicingPolicy}>
                      <TSelect value={form.invoicingPolicy} onChange={(e) => setField("invoicingPolicy", e.target.value)}
                        disabled={isReadOnly} options={INVOICING_POLICIES} placeholder="Select Policy" error={errors.invoicingPolicy} />
                    </Field>
                  </div>
                </div>

                {/* Upsell & Cross-sell */}
                <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Upsell & Cross-Sell</p>
                  <Field label="Optional Products" className="">
                    <ProductTagSelect selected={form.optionalProducts}
                      onChange={(v) => setField("optionalProducts", v)}
                      allProducts={allProducts.filter((p) => p.id !== form.id)}
                      disabled={isReadOnly} placeholder="Search and add products..." />
                    <p className="text-xs text-gray-400 mt-1">Recommended as add-on / upsell on quotations and eCommerce cart.</p>
                  </Field>
                  <Field label="Accessory Products">
                    <ProductTagSelect selected={form.accessoryProducts}
                      onChange={(v) => setField("accessoryProducts", v)}
                      allProducts={allProducts.filter((p) => p.id !== form.id)}
                      disabled={isReadOnly} placeholder="Search and add products..." />
                    <p className="text-xs text-gray-400 mt-1">Complementary accessories shown at checkout.</p>
                  </Field>
                  <Field label="Alternative Products">
                    <ProductTagSelect selected={form.alternativeProducts}
                      onChange={(v) => setField("alternativeProducts", v)}
                      allProducts={allProducts.filter((p) => p.id !== form.id)}
                      disabled={isReadOnly} placeholder="Search and add products..." />
                    <p className="text-xs text-gray-400 mt-1">Substitute products shown when this item is out of stock.</p>
                  </Field>
                </div>

                {/* UOM Conversions */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">UOM Conversions</p>
                      <p className="text-xs text-gray-400 mt-0.5">Define conversion when Purchase UOM differs from Stock UOM.</p>
                    </div>
                    {!isReadOnly && (
                      <button onClick={addConv} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded">
                        <Plus size={13} /> Add Conversion
                      </button>
                    )}
                  </div>

                  {form.conversions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      No conversions defined.{!isReadOnly && ' Add one if Purchase UOM differs from Stock UOM.'}
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded overflow-x-auto">
                      <table className="w-full text-sm min-w-[600px]">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <th className="px-3 py-2 text-left w-8">#</th>
                            <th className="px-3 py-2 text-left">Qty (Purchase UOM) <span className="text-red-400 normal-case font-normal">*</span></th>
                            <th className="px-3 py-2 text-left">Purchase UOM <span className="text-red-400 normal-case font-normal">*</span></th>
                            <th className="px-3 py-2 text-left">= Qty (Stock UOM)</th>
                            <th className="px-3 py-2 text-left">Stock UOM</th>
                            {!isReadOnly && <th className="px-3 py-2 w-8"></th>}
                          </tr>
                        </thead>
                        <tbody>
                          {form.conversions.map((cv, i) => (
                            <tr key={cv.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                              <td className="px-3 py-2 min-w-[130px]">
                                <TInput value={cv.qtyPurchase} onChange={(e) => updConv(i, "qtyPurchase", e.target.value)}
                                  disabled={isReadOnly} placeholder="e.g. 1" type="number" error={errors[`cv_qty_${i}`]} />
                                {errors[`cv_qty_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`cv_qty_${i}`]}</p>}
                              </td>
                              <td className="px-3 py-2 min-w-[140px]">
                                <TSelect value={cv.purchaseUOM} onChange={(e) => updConv(i, "purchaseUOM", e.target.value)}
                                  disabled={isReadOnly} options={UOM_OPTIONS} placeholder="Select UOM" error={errors[`cv_uom_${i}`]} />
                                {errors[`cv_uom_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`cv_uom_${i}`]}</p>}
                              </td>
                              <td className="px-3 py-2 min-w-[130px]">
                                <TInput value={cv.qtyStock} onChange={(e) => updConv(i, "qtyStock", e.target.value)}
                                  disabled={isReadOnly} placeholder="e.g. 1000" type="number" />
                              </td>
                              <td className="px-3 py-2 min-w-[100px]">
                                <div className={`${inputBase(true)} text-xs font-medium text-gray-600`}>{form.stockUOM || "—"}</div>
                              </td>
                              {!isReadOnly && (
                                <td className="px-3 py-2">
                                  <button onClick={() => delConv(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Purchase Description */}
                <div className="bg-gray-50 border border-gray-200 rounded p-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Purchase Description</p>
                  <TTextarea value={form.purchaseDescription} onChange={(e) => setField("purchaseDescription", e.target.value)}
                    disabled={isReadOnly} rows={4}
                    placeholder="Description printed on RFQ and PO lines — vendor-specific specs, drawing references, part numbers." />
                </div>
              </div>
            )}

            {/* ══════════ ACCOUNTING ══════════ */}
            {activeTab === "accounting" && (
              <div className="max-w-2xl space-y-5">
                <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Cost & Revenue Accounts</p>
                  <p className="text-xs text-gray-400">Product-level accounts override category-level defaults. Leave blank to inherit from category.</p>

                  <Field label="Income Account">
                    <TSelect value={form.incomeAccount} onChange={(e) => setField("incomeAccount", e.target.value)}
                      disabled={isReadOnly} options={INCOME_ACCOUNTS} placeholder={form.catIncomeAccount ? `From Category: ${form.catIncomeAccount}` : "Select Revenue Account"} />
                    <p className="text-xs text-gray-400 mt-1">Revenue GL account used on customer invoices for this product. Must be of type Revenue.</p>
                  </Field>

                  <Field label="Expense Account">
                    <TSelect value={form.expenseAccount} onChange={(e) => setField("expenseAccount", e.target.value)}
                      disabled={isReadOnly} options={EXPENSE_ACCOUNTS} placeholder={form.catExpenseAccount ? `From Category: ${form.catExpenseAccount}` : "Select Expense / COGS Account"} />
                    <p className="text-xs text-gray-400 mt-1">COGS or expense ledger used when this product appears on vendor bills. Must be of type Expense or COGS.</p>
                  </Field>
                </div>

                {(form.categoryCode) && (
                  <div className="bg-blue-50 border border-blue-100 rounded p-3 space-y-1">
                    <p className="text-xs font-semibold text-blue-700">Inherited from Category: {form.categoryCode} — {form.categoryName}</p>
                    <p className="text-xs text-brand-600">Income: {form.catIncomeAccount || "Not set"}</p>
                    <p className="text-xs text-brand-600">Expense: {form.catExpenseAccount || "Not set"}</p>
                    <p className="text-xs text-brand-600">Cost Method: {form.costMethod || "Not set"}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Form-level error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {Object.keys(errors).length > 6 && <li>...and {Object.keys(errors).length - 6} more error(s)</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Metadata */}
        {form.createdAt && (
          <div className="text-xs text-gray-400 flex items-center gap-4 px-1 pb-2">
            <span>Created: {new Date(form.createdAt).toLocaleString()} by {form.createdBy}</span>
            <span>|</span>
            <span>Last Updated: {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}</span>
          </div>
        )}
      </div>
    </Layout>
  );
}


