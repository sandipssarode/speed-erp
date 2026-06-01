import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import {
  Save, X, Plus, Trash2, FileText, ChevronRight, AlertCircle, CheckCircle,
  Edit2, Upload, XCircle, ChevronLeft, List, Printer, Paperclip, Search,
  Lock, RefreshCw,
} from "lucide-react";

// ─── Master Data ──────────────────────────────────────────────────────────────
const SERIES_OPTIONS   = ["PQ-2526", "PQ-IMP-2526"];
const UNIT_OPTIONS     = ["VATVA PLANT", "ANKLESHWAR", "HEAD OFFICE"];
const CURRENCY_OPTIONS = ["INR", "USD", "EUR", "GBP"];
const UOM_OPTIONS      = ["KGS", "MTR", "NOS", "LTR", "SQM", "TON", "SET", "PKT"];
const DISC_TYPE_OPT    = ["Fixed Amount", "Percentage"];
const TERM_TYPE_OPT    = ["Payment", "Delivery", "Legal", "Quality", "Other"];

const VENDOR_MASTER = [
  { code: "VND-0014", name: "STAR INDUSTRIES",        contact: "Mr. Satish Chaudhary", phone: "+91 98200 11234", email: "satish@starindustries.in",  currency: "INR" },
  { code: "VND-0029", name: "PRIME STEEL",            contact: "Ms. Rekha Iyer",       phone: "+91 98110 55678", email: "rekha@primesteel.co.in",    currency: "INR" },
  { code: "VND-0037", name: "ADITYA STEEL & ALLOYS",  contact: "Mr. Arun Mehta",       phone: "+91 90990 33412", email: "arun@adityasteel.in",       currency: "INR" },
];

const ITEM_MASTER = [
  { code: "RM-0042", description: "MS Flat Bar 40x6mm IS2062 E250 Grade", uom: "KGS" },
  { code: "RM-0071", description: "MS Round Bar Ø25mm IS2062",            uom: "KGS" },
  { code: "RM-0088", description: "HR Sheet 2mm IS513",                   uom: "KGS" },
  { code: "CONS-01", description: "Nitrile Safety Gloves (M)",            uom: "PAIR" },
  { code: "SVC-001", description: "Annual Maintenance Contract",          uom: "NOS" },
];

const BUYER_MASTER = [
  { code: "EDP-001", name: "Prakash Mehta" },
  { code: "EDP-002", name: "Sunita Sharma" },
  { code: "EDP-003", name: "Rajesh Patel" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function getFinancialYear() {
  const now = new Date(); const yr = now.getFullYear(); const m = now.getMonth() + 1;
  const from = m >= 4 ? yr : yr - 1; const to = m >= 4 ? yr + 1 : yr;
  return `${String(from).slice(2)}-${String(to).slice(2)}`;
}
function todayISO() { return new Date().toISOString().split("T")[0]; }
function nextPQNumber(series, allPQs) {
  const count = allPQs.filter((p) => p.series === series).length + 1;
  return `${series}/${String(count).padStart(4, "0")}`;
}
const uid = () => String(Date.now()) + String(Math.random()).slice(2, 6);

function calcLandedRate(basicRate, discType, discValue) {
  const rate = parseFloat(basicRate) || 0;
  const dv   = parseFloat(discValue) || 0;
  if (!discType || !dv) return rate;
  if (discType === "Fixed Amount") return Math.max(0, rate - dv);
  if (discType === "Percentage")   return rate * (1 - dv / 100);
  return rate;
}

function fmtNum(v, dec = 2) {
  return (parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

const emptyItem = () => ({
  id: uid(), inquiryRef: "", vendorItemCode: "", itemCode: "", description: "",
  qty: "", uom: "", basicRate: "", rateUom: "",
  discType: "", discValue: "", landedRate: "",
});

const emptyTerm = () => ({ id: uid(), term: "", description: "", termType: "" });

function emptyForm() {
  return {
    id: "", year: getFinancialYear(), series: "PQ-2526", number: "",
    unit: "", vendorCode: "", vendorName: "", currency: "INR", exRate: "1",
    quotationDate: todayISO(), revisionNo: "0", revisionDate: "",
    validity: "30", contactPerson: "", buyerCode: "", buyerName: "",
    comparedQuotation: false,
    items: [], terms: [], remark: "",
    attachments: [],
    status: "Open",
    createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  };
}

// ─── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_PQS = [
  {
    id: "pq1001", year: "25-26", series: "PQ-2526", number: "PQ-2526/0001",
    unit: "VATVA PLANT", vendorCode: "VND-0014", vendorName: "STAR INDUSTRIES",
    currency: "INR", exRate: "1", quotationDate: "2026-01-20",
    revisionNo: "0", revisionDate: "", validity: "30",
    contactPerson: "Mr. Satish Chaudhary", buyerCode: "EDP-001", buyerName: "Prakash Mehta",
    comparedQuotation: false, status: "Open", remark: "Rates firm for 30 days.",
    items: [
      { id: "i1", inquiryRef: "PI-2526/0001", vendorItemCode: "MSF-40X6", itemCode: "RM-0042", description: "MS Flat Bar 40x6mm IS2062 E250 Grade", qty: "500", uom: "KGS", basicRate: "73.00", rateUom: "KGS", discType: "Percentage", discValue: "2", landedRate: "71.54" },
      { id: "i2", inquiryRef: "PI-2526/0001", vendorItemCode: "MSRB-25",  itemCode: "RM-0071", description: "MS Round Bar Ø25mm IS2062",            qty: "250", uom: "KGS", basicRate: "60.00", rateUom: "KGS", discType: "",           discValue: "",  landedRate: "60.00" },
    ],
    terms: [
      { id: "t1", term: "Payment",  description: "Payment within 30 days from invoice date.",                        termType: "Payment"  },
      { id: "t2", term: "Delivery", description: "Delivery at our works. Transportation charges on vendor account.", termType: "Delivery" },
    ],
    attachments: [],
    createdAt: "2026-01-20T09:00:00Z", updatedAt: "2026-01-20T09:00:00Z", createdBy: "Prakash Mehta", updatedBy: "Prakash Mehta",
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.unit)          e.unit          = "Unit is a required field. Please select a Business Unit / Plant.";
  if (!form.vendorCode)    e.vendorCode    = "Vendor Code is a required field. Please select a vendor.";
  if (!form.quotationDate) e.quotationDate = "Quotation Date is a required field.";
  if (!form.buyerCode)     e.buyerCode     = "Buyer is a required field. Please select a Buyer.";
  if (form.currency !== "INR" && (!form.exRate || parseFloat(form.exRate) <= 0))
    e.exRate = "Exchange Rate is required when a foreign currency is selected.";
  if (form.validity && parseFloat(form.validity) <= 0)
    e.validity = "Validity must be a positive number of days.";
  if (form.items.length === 0)
    e.items = "At least one Item line with a Basic Rate must be entered before saving the Purchase Quotation.";

  form.items.forEach((it, i) => {
    if (!it.itemCode?.trim())                                     e[`ic_${i}`]   = "Item Code is a required field. Please select an item for each line.";
    if (!it.qty || parseFloat(it.qty) <= 0)                      e[`qty_${i}`]  = "Quantity must be greater than zero for each item line.";
    if (!it.uom)                                                  e[`uom_${i}`]  = "Unit of Measure (UoM) is a required field for each item line.";
    if (!it.basicRate && it.basicRate !== 0)                      e[`rate_${i}`] = "Basic Rate is a required field. Please enter the vendor's quoted rate for each item line.";
    if (it.basicRate !== "" && parseFloat(it.basicRate) < 0)     e[`rate_${i}`] = "Basic Rate must be zero or a positive number.";
    if (it.discValue && !it.discType)
      e[`disctype_${i}`] = "Please select a Discount Type (Fixed Amount or Percentage) before entering a Discount Value.";
    if (it.discValue && parseFloat(it.discValue) < 0)
      e[`discval_${i}`] = "Discount Value must be zero or a positive number.";
    if (it.discType === "Percentage" && parseFloat(it.discValue) > 100)
      e[`discval_${i}`] = "Discount Value (%) cannot exceed 100.";
  });

  form.terms.forEach((t, i) => {
    if (!t.term?.trim())        e[`term_${i}`]     = "Term Name is required when adding a Terms & Conditions row.";
    if (!t.description?.trim()) e[`termdesc_${i}`] = "Term Description is a required field when a Term is entered in the Terms and Conditions grid.";
  });

  return e;
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
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

const inputCls = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error   ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-blue-400"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

function TInput({ value, onChange, disabled, placeholder, type = "text", error, min, rows, maxLength }) {
  const cls = inputCls(disabled, error);
  if (rows) return <textarea value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} rows={rows} className={cls} />;
  return <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} min={min} maxLength={maxLength} className={cls} />;
}

function TSelect({ value, onChange, disabled, options, placeholder, error }) {
  return (
    <select value={value ?? ""} onChange={onChange} disabled={disabled} className={inputCls(disabled, error)}>
      <option value="">{placeholder || "— Select —"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const cellCls = (err) =>
  `w-full px-1.5 py-1 text-xs border-0 outline-none bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-300 rounded
  ${err ? "bg-red-50 ring-1 ring-red-300" : ""}`;

function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${isErr ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PurchaseQuotation() {
  const [mode,       setMode]       = useState("new");
  const [form,       setForm]       = useState(emptyForm());
  const [errors,     setErrors]     = useState({});
  const [activeTab,  setActiveTab]  = useState("items");
  const [toast,      setToast]      = useState(null);
  const [showAttach, setShowAttach] = useState(false);
  const [showList,   setShowList]   = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQ,    setSearchQ]    = useState("");
  const [allPQs,     setAllPQs]     = useState([]);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const fileRef = useRef(null);
  const isReadOnly = mode === "view";

  // ── Load ──
  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
    if (stored.length === 0) {
      localStorage.setItem("purchase_quotations", JSON.stringify(SEED_PQS));
      stored = SEED_PQS;
    }
    setAllPQs(stored);
    setForm(stored[stored.length - 1]);
    setCurrentIdx(stored.length - 1);
    setMode("view");
  }, []);

  const reloadList = () => {
    const s = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
    setAllPQs(s); return s;
  };

  const goTo = (idx) => {
    const list = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
    if (idx < 0 || idx >= list.length) return;
    setForm(list[idx]); setCurrentIdx(idx); setMode("view"); setErrors({});
    setShowList(false); setShowSearch(false); setActiveTab("items");
  };

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const setField = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => { const e = { ...p }; delete e[key]; return e; });
  };

  // ── Vendor auto-fill ──
  const handleVendorSelect = (code) => {
    const vm = VENDOR_MASTER.find((v) => v.code === code);
    setForm((p) => ({
      ...p,
      vendorCode:    code,
      vendorName:    vm?.name        || "",
      currency:      vm?.currency    || "INR",
      contactPerson: vm?.contact     || p.contactPerson,
      exRate:        (vm?.currency && vm.currency !== "INR") ? p.exRate : "1",
    }));
    if (errors.vendorCode) setErrors((p) => { const e = { ...p }; delete e.vendorCode; return e; });
  };

  // ── Buyer auto-fill ──
  const handleBuyerSelect = (code) => {
    const bm = BUYER_MASTER.find((b) => b.code === code);
    setForm((p) => ({ ...p, buyerCode: code, buyerName: bm?.name || "" }));
    if (errors.buyerCode) setErrors((p) => { const e = { ...p }; delete e.buyerCode; return e; });
  };

  // ── Items ──
  const addItem = () => {
    setForm((p) => ({ ...p, items: [...p.items, emptyItem()] }));
    if (errors.items) setErrors((p) => { const e = { ...p }; delete e.items; return e; });
  };

  const updItem = (i, k, v) => {
    setForm((p) => {
      const items = [...p.items];
      const row   = { ...items[i], [k]: v };

      // Auto-fill from Item master when Item Code changes
      if (k === "itemCode") {
        const im = ITEM_MASTER.find((it) => it.code === v);
        if (im) { row.description = im.description; row.uom = im.uom; row.rateUom = im.uom; }
      }

      // Recalculate landed rate on relevant changes
      if (["basicRate", "discType", "discValue"].includes(k)) {
        const br = k === "basicRate"  ? v : row.basicRate;
        const dt = k === "discType"   ? v : row.discType;
        const dv = k === "discValue"  ? v : row.discValue;
        row.landedRate = fmtNum(calcLandedRate(br, dt, dv));
      }

      items[i] = row;
      return { ...p, items };
    });
  };

  const delItem = (i) => {
    if (!window.confirm("Remove this item line?")) return;
    setForm((p) => ({ ...p, items: p.items.filter((_, x) => x !== i) }));
  };

  // ── Terms ──
  const addTerm  = () => setForm((p) => ({ ...p, terms: [...p.terms, emptyTerm()] }));
  const updTerm  = (i, k, v) => setForm((p) => { const terms = [...p.terms]; terms[i] = { ...terms[i], [k]: v }; return { ...p, terms }; });
  const delTerm  = (i) => { if (!window.confirm("Remove this term?")) return; setForm((p) => ({ ...p, terms: p.terms.filter((_, x) => x !== i) })); };

  // ── Save ──
  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const keys = Object.keys(errs);
      if (keys.some((k) => k.startsWith("ic_") || k.startsWith("qty_") || k.startsWith("uom_") || k.startsWith("rate_") || k.startsWith("disctype_") || k.startsWith("discval_") || k === "items"))
        setActiveTab("items");
      else if (keys.some((k) => k.startsWith("term")))
        setActiveTab("terms");
      showToast("Please correct the highlighted fields and try again.", "error"); return;
    }

    const all   = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
    const now   = new Date().toISOString();
    const user  = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const uname = user.name || user.fullName || "System";

    let saved;
    if (!form.id) {
      const number = nextPQNumber(form.series, all);
      saved = { ...form, id: uid(), number, createdAt: now, updatedAt: now, createdBy: uname, updatedBy: uname };
      all.push(saved);
    } else {
      saved = { ...form, updatedAt: now, updatedBy: uname };
      const idx = all.findIndex((p) => p.id === form.id);
      if (idx !== -1) all[idx] = saved; else all.push(saved);
    }

    localStorage.setItem("purchase_quotations", JSON.stringify(all));
    const updated = reloadList();
    const ni = updated.findIndex((p) => p.id === saved.id);
    setForm(saved); setCurrentIdx(ni !== -1 ? ni : updated.length - 1);
    setMode("view"); setErrors({});
    showToast(`Purchase Quotation ${saved.number} saved successfully.`);
  };

  const handleCancel = () => {
    if (mode === "new") {
      if (form.items.length > 0 || form.vendorCode || form.unit) {
        if (!window.confirm("Discard all unsaved changes?")) return;
      }
      const list = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
      if (list.length > 0) {
        const i = currentIdx >= 0 ? Math.min(currentIdx, list.length - 1) : list.length - 1;
        setForm(list[i]); setCurrentIdx(i); setMode("view");
      } else { setForm(emptyForm()); setMode("view"); }
      setErrors({}); return;
    }
    if (mode === "edit") {
      const all   = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
      const saved = all.find((p) => p.id === form.id);
      if (saved) setForm(saved);
      setMode("view"); setErrors({});
    }
  };

  const handleDelete = () => {
    if (!form.id) return;
    if (form.comparedQuotation) { showToast("Cannot delete this quotation. It has already been included in a completed Quotation Comparison.", "error"); return; }
    if (!window.confirm(`Permanently delete quotation ${form.number}? This cannot be undone.`)) return;
    const all     = JSON.parse(localStorage.getItem("purchase_quotations") || "[]");
    const updated = all.filter((p) => p.id !== form.id);
    localStorage.setItem("purchase_quotations", JSON.stringify(updated));
    const list = reloadList();
    if (list.length > 0) { setForm(list[list.length - 1]); setCurrentIdx(list.length - 1); setMode("view"); }
    else { setForm(emptyForm()); setCurrentIdx(-1); setMode("new"); }
    showToast("Purchase Quotation deleted.");
  };

  // ── Attachments ──
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const added = files.map((f) => ({ id: uid(), name: f.name, size: f.size, type: f.type }));
    setForm((p) => ({ ...p, attachments: [...(p.attachments || []), ...added] }));
    e.target.value = "";
    showToast(`${files.length} file(s) attached.`);
  };
  const removeAttachment = (id) => setForm((p) => ({ ...p, attachments: (p.attachments || []).filter((a) => a.id !== id) }));

  // ── Search filter ──
  const filteredPQs = allPQs.filter((pq) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return pq.number?.toLowerCase().includes(q) || pq.vendorName?.toLowerCase().includes(q) || pq.buyerName?.toLowerCase().includes(q) || pq.unit?.toLowerCase().includes(q);
  });

  const hasItemErr = Object.keys(errors).some((k) => k.startsWith("ic_") || k.startsWith("qty_") || k.startsWith("uom_") || k.startsWith("rate_") || k.startsWith("disctype_") || k.startsWith("discval_") || k === "items");
  const hasTermErr = Object.keys(errors).some((k) => k.startsWith("term"));

  // ──────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Purchase</span><ChevronRight size={12} /><span>Transaction</span><ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Purchase Quotation</span>
          {form.number && <><ChevronRight size={12} /><span className="text-blue-600 font-medium">{form.number}</span></>}
        </div>

        <Toast toast={toast} />

        {/* ── Action Toolbar ── */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">

          {(mode === "new" || mode === "edit") && (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                <Save size={13} /> Save
              </button>
              <button onClick={handleCancel} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium">
                <X size={13} /> Cancel
              </button>
            </>
          )}

          {mode === "view" && (
            <>
              <button onClick={() => setMode("edit")} disabled={form.comparedQuotation}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => { setForm(emptyForm()); setCurrentIdx(-1); setMode("new"); setErrors({}); setActiveTab("items"); setShowList(false); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
                <Plus size={13} /> New PQ
              </button>
              <button onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded font-medium">
                <Trash2 size={13} /> Delete
              </button>
            </>
          )}

          <div className="w-px h-5 bg-gray-200" />

          <button onClick={() => { if (!form.number) { showToast("Please save the PQ before printing.", "error"); return; } window.print(); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Printer size={13} /> Print
          </button>

          <button onClick={() => setShowAttach((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${showAttach ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Paperclip size={13} /> Attachments
            {(form.attachments?.length > 0) && <span className="bg-blue-100 text-blue-600 text-xs px-1.5 rounded-full">{form.attachments.length}</span>}
          </button>

          <button onClick={() => { const s = reloadList(); if (currentIdx >= 0 && currentIdx < s.length) { setForm(s[currentIdx]); showToast("Refreshed."); } }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <RefreshCw size={13} /> Refresh
          </button>

          <button onClick={() => setShowSearch((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${showSearch ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Search size={13} /> Search
          </button>

          <div className="w-px h-5 bg-gray-200" />

          <div className="flex items-center gap-1">
            <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx <= 0 || mode !== "view"} title="Previous"
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx >= allPQs.length - 1 || mode !== "view"} title="Next"
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={13} />
            </button>
            <button onClick={() => setShowList((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded font-medium transition-colors ${showList ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
              <List size={13} />
              {allPQs.length > 0 && <span className="text-gray-400">{currentIdx >= 0 ? `${currentIdx + 1} / ${allPQs.length}` : allPQs.length}</span>}
            </button>
          </div>

          {form.updatedAt && (
            <div className="ml-auto text-xs text-gray-400 text-right">
              <span>Updated: {new Date(form.updatedAt).toLocaleString()}</span>
              {form.updatedBy && <span className="ml-2">by {form.updatedBy}</span>}
            </div>
          )}
        </div>

        {/* ── Attachments Panel ── */}
        {showAttach && (
          <div className="bg-white border border-gray-200 rounded p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Paperclip size={14} /> File Attachments</h3>
              {!isReadOnly && <>
                <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded">
                  <Upload size={13} /> Upload File
                </button>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
              </>}
            </div>
            {(!form.attachments || form.attachments.length === 0)
              ? <p className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">No attachments yet.{!isReadOnly && " Upload vendor quote PDFs, price lists, or technical datasheets."}</p>
              : <div className="space-y-1">
                  {form.attachments.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                      <FileText size={13} className="text-gray-400 shrink-0" />
                      <span className="flex-1">{a.name}</span>
                      <span className="text-gray-400">{a.size ? `${(a.size / 1024).toFixed(1)} KB` : ""}</span>
                      {!isReadOnly && <button onClick={() => removeAttachment(a.id)} className="text-red-400 hover:text-red-600"><XCircle size={14} /></button>}
                    </div>
                  ))}
                </div>
            }
          </div>
        )}

        {/* ── Search Panel ── */}
        {showSearch && (
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Search size={13} /> Search Purchase Quotations <span className="text-gray-400 font-normal normal-case">({filteredPQs.length} results)</span>
              </h3>
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search by PQ number, vendor, buyer, unit…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PQ Number","Date","Vendor","Unit","Buyer","Items","Currency",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPQs.map((pq) => {
                    const idx = allPQs.findIndex((p) => p.id === pq.id);
                    return (
                      <tr key={pq.id} onClick={() => { goTo(idx); setShowSearch(false); setSearchQ(""); }}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/40 ${idx === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                        <td className="px-3 py-2 font-mono font-semibold text-blue-600">{pq.number}</td>
                        <td className="px-3 py-2 text-gray-600">{pq.quotationDate ? new Date(pq.quotationDate).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{pq.vendorName || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{pq.unit || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{pq.buyerName || "—"}</td>
                        <td className="px-3 py-2 text-center">{pq.items?.length || 0}</td>
                        <td className="px-3 py-2 text-gray-600">{pq.currency}</td>
                        <td className="px-3 py-2 text-blue-500 font-medium">Open →</td>
                      </tr>
                    );
                  })}
                  {filteredPQs.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No records found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── List Panel ── */}
        {showList && (
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <List size={13} /> All Purchase Quotations <span className="text-gray-400 font-normal normal-case">({allPQs.length} records)</span>
              </h3>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PQ Number","Date","Vendor","Unit","Buyer","Items","Currency","Compared",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPQs.map((pq, i) => (
                    <tr key={pq.id} onClick={() => goTo(i)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/40 ${i === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                      <td className="px-3 py-2 font-mono font-semibold text-blue-600">{pq.number}</td>
                      <td className="px-3 py-2 text-gray-600">{pq.quotationDate ? new Date(pq.quotationDate).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pq.vendorName || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pq.unit || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pq.buyerName || "—"}</td>
                      <td className="px-3 py-2 text-center">{pq.items?.length || 0}</td>
                      <td className="px-3 py-2 text-gray-600">{pq.currency}</td>
                      <td className="px-3 py-2">
                        {pq.comparedQuotation
                          ? <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-full text-xs">Yes</span>
                          : <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-3 py-2 text-blue-500 font-medium">Open →</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Status Banner ── */}
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded px-5 py-3 flex items-center gap-4 text-white shadow-sm">
          <FileText size={16} className="text-blue-200 shrink-0" />
          <span className="font-bold text-base tracking-wide">{form.number || "New Purchase Quotation"}</span>
          {form.unit       && <span className="text-blue-200 text-sm">| {form.unit}</span>}
          {form.vendorName && <span className="text-blue-200 text-sm">| {form.vendorName}</span>}
          <div className="ml-auto flex items-center gap-2">
            {form.comparedQuotation && (
              <span className="bg-blue-300/30 text-blue-100 border border-blue-300/30 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <CheckCircle size={10} /> Compared
              </span>
            )}
            {(mode === "new" || mode === "edit") && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                {mode === "new" ? "New Record" : "Editing"}
              </span>
            )}
          </div>
        </div>

        {/* ── Header Details ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Header Details</div>
          <div className="p-4 space-y-3">

            {/* Row 1: Year / Series / Number / Quotation Date */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Year">
                <TInput value={form.year} disabled />
              </Field>
              <Field label="Series">
                <TSelect value={form.series} onChange={(e) => setField("series", e.target.value)}
                  disabled={isReadOnly || !!form.id} options={SERIES_OPTIONS} />
              </Field>
              <Field label="Quotation No">
                <TInput value={form.number} disabled placeholder="Auto-generated on Save" />
              </Field>
              <Field label="Quotation Date" required error={errors.quotationDate}>
                <TInput type="date" value={form.quotationDate} onChange={(e) => setField("quotationDate", e.target.value)}
                  disabled={isReadOnly} error={errors.quotationDate} />
              </Field>
            </div>

            {/* Row 2: Unit / Revision No / Revision Date / Validity */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Unit" required error={errors.unit}>
                <TSelect value={form.unit} onChange={(e) => setField("unit", e.target.value)}
                  disabled={isReadOnly} options={UNIT_OPTIONS} placeholder="— Select Unit —" error={errors.unit} />
              </Field>
              <Field label="Revision No">
                <TInput value={form.revisionNo} disabled />
              </Field>
              <Field label="Revision Date">
                <TInput type="date" value={form.revisionDate} disabled placeholder="Auto-populated" />
              </Field>
              <Field label="Validity (Days)">
                <TInput type="number" min="1" value={form.validity}
                  onChange={(e) => setField("validity", e.target.value)}
                  disabled={isReadOnly} placeholder="30" error={errors.validity} />
              </Field>
            </div>

            {/* Row 3: Vendor Code / Vendor Name / Currency / Ex Rate */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Vendor Code" required error={errors.vendorCode}>
                <select value={form.vendorCode} onChange={(e) => handleVendorSelect(e.target.value)}
                  disabled={isReadOnly} className={inputCls(isReadOnly, errors.vendorCode)}>
                  <option value="">— Select Vendor —</option>
                  {VENDOR_MASTER.map((v) => <option key={v.code} value={v.code}>{v.code} — {v.name}</option>)}
                </select>
                {errors.vendorCode && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={11} />{errors.vendorCode}</p>}
              </Field>
              <Field label="Vendor Name">
                <TInput value={form.vendorName} disabled placeholder="Auto-filled from vendor master" />
              </Field>
              <Field label="Currency">
                <TSelect value={form.currency} onChange={(e) => setField("currency", e.target.value)}
                  disabled={isReadOnly} options={CURRENCY_OPTIONS} />
              </Field>
              <Field label="Ex Rate" error={errors.exRate}>
                <TInput type="number" min="0" value={form.exRate}
                  onChange={(e) => setField("exRate", e.target.value)}
                  disabled={isReadOnly || form.currency === "INR"}
                  placeholder="1" error={errors.exRate} />
              </Field>
            </div>

            {/* Row 4: Buyer Code / Buyer Name / Contact Person / Compared Quotation */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Buyer Code" required error={errors.buyerCode}>
                <select value={form.buyerCode} onChange={(e) => handleBuyerSelect(e.target.value)}
                  disabled={isReadOnly} className={inputCls(isReadOnly, errors.buyerCode)}>
                  <option value="">— Select Buyer —</option>
                  {BUYER_MASTER.map((b) => <option key={b.code} value={b.code}>{b.code} — {b.name}</option>)}
                </select>
                {errors.buyerCode && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={11} />{errors.buyerCode}</p>}
              </Field>
              <Field label="Buyer Name">
                <TInput value={form.buyerName} disabled placeholder="Auto-filled from buyer master" />
              </Field>
              <Field label="Contact Person">
                <TInput value={form.contactPerson} onChange={(e) => setField("contactPerson", e.target.value)}
                  disabled={isReadOnly} placeholder="Vendor contact who submitted quote" />
              </Field>
              <div className="flex flex-col justify-end pb-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-not-allowed select-none">
                  <input type="checkbox" checked={form.comparedQuotation} disabled className="rounded" />
                  <Lock size={11} className="text-blue-400" /> Compared Quotation
                </label>
                <p className="text-xs text-gray-400 mt-1">Auto-set when included in a Quotation Comparison.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body Tabs ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {[
              { id: "items", label: "Item Details",       hasErr: hasItemErr },
              { id: "terms", label: "Terms & Conditions", hasErr: hasTermErr },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors
                  ${activeTab === t.id ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                {t.label}{t.hasErr && <AlertCircle size={12} className="text-red-400" />}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* ══ ITEM DETAILS ══ */}
            {activeTab === "items" && (
              <div className="space-y-3">
                {errors.items && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{errors.items}</p>}
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[1300px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          { label: "Sr",              w: "w-8"  },
                          { label: "Inq. Ref",        w: "w-28" },
                          { label: "Vendor Item Code",w: "w-28" },
                          { label: "Item Code *",     w: "w-28" },
                          { label: "Description",     w: ""     },
                          { label: "Qty *",           w: "w-20" },
                          { label: "UoM *",           w: "w-20" },
                          { label: "Basic Rate *",    w: "w-24" },
                          { label: "Rate UoM",        w: "w-20" },
                          { label: "Disc Type",       w: "w-28" },
                          { label: "Disc Value",      w: "w-20" },
                          { label: "Landed Rate",     w: "w-24" },
                          { label: "",                w: "w-8"  },
                        ].map((h) => (
                          <th key={h.label} className={`${h.w} px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap`}>{h.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono">{i + 1}</td>
                          <td className="px-1 py-1">
                            <input value={row.inquiryRef} onChange={(e) => updItem(i, "inquiryRef", e.target.value)}
                              disabled={isReadOnly} placeholder="e.g. PI-2526/0001" className={cellCls(false)} />
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.vendorItemCode} onChange={(e) => updItem(i, "vendorItemCode", e.target.value)}
                              disabled={isReadOnly} placeholder="Vendor code" className={cellCls(false)} />
                          </td>
                          <td className="px-1 py-1">
                            <select value={row.itemCode} onChange={(e) => updItem(i, "itemCode", e.target.value)}
                              disabled={isReadOnly} className={cellCls(errors[`ic_${i}`])}>
                              <option value="">— Item —</option>
                              {ITEM_MASTER.map((it) => <option key={it.code} value={it.code}>{it.code}</option>)}
                            </select>
                            {errors[`ic_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`ic_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.description} onChange={(e) => updItem(i, "description", e.target.value)}
                              disabled={isReadOnly} placeholder="Item description" className={cellCls(false)} />
                          </td>
                          <td className="px-1 py-1">
                            <input type="number" min="0" value={row.qty} onChange={(e) => updItem(i, "qty", e.target.value)}
                              disabled={isReadOnly} placeholder="0" className={`${cellCls(errors[`qty_${i}`])} text-right`} />
                            {errors[`qty_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`qty_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <select value={row.uom} onChange={(e) => updItem(i, "uom", e.target.value)}
                              disabled={isReadOnly} className={cellCls(errors[`uom_${i}`])}>
                              <option value="">UoM</option>
                              {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                            {errors[`uom_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`uom_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input type="number" min="0" value={row.basicRate} onChange={(e) => updItem(i, "basicRate", e.target.value)}
                              disabled={isReadOnly} placeholder="0.00" className={`${cellCls(errors[`rate_${i}`])} text-right`} />
                            {errors[`rate_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`rate_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <select value={row.rateUom} onChange={(e) => updItem(i, "rateUom", e.target.value)}
                              disabled={isReadOnly} className={cellCls(false)}>
                              <option value="">UoM</option>
                              {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="px-1 py-1">
                            <select value={row.discType} onChange={(e) => updItem(i, "discType", e.target.value)}
                              disabled={isReadOnly} className={cellCls(errors[`disctype_${i}`])}>
                              <option value="">None</option>
                              {DISC_TYPE_OPT.map((d) => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {errors[`disctype_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`disctype_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input type="number" min="0" value={row.discValue} onChange={(e) => updItem(i, "discValue", e.target.value)}
                              disabled={isReadOnly || !row.discType} placeholder="0"
                              className={`${cellCls(errors[`discval_${i}`])} text-right`} />
                            {errors[`discval_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`discval_${i}`]}</p>}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono text-gray-700 bg-gray-50/70 text-xs whitespace-nowrap">
                            {row.basicRate ? fmtNum(calcLandedRate(row.basicRate, row.discType, row.discValue)) : "—"}
                          </td>
                          <td className="px-2 py-1 text-center">
                            {!isReadOnly && <button onClick={() => delItem(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>}
                          </td>
                        </tr>
                      ))}
                      {!isReadOnly && (
                        <tr>
                          <td className="px-2 py-1.5 text-center text-gray-300">{form.items.length + 1}</td>
                          <td colSpan={12} className="px-2 py-1.5 text-xs text-gray-300 italic">Click + Add Item to insert a new line</td>
                        </tr>
                      )}
                      {form.items.length === 0 && isReadOnly && (
                        <tr><td colSpan={13} className="py-8 text-center text-gray-400 text-sm">No items added.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Item totals summary */}
                {form.items.length > 0 && (
                  <div className="flex justify-end">
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-xs space-y-1 min-w-[260px]">
                      {form.items.map((row, i) => (
                        <div key={row.id} className="flex justify-between gap-6 text-gray-600">
                          <span className="truncate max-w-[150px]">{row.itemCode || `Line ${i + 1}`} × {row.qty || 0} {row.uom}</span>
                          <span className="font-mono">
                            {row.basicRate
                              ? `₹ ${fmtNum((parseFloat(calcLandedRate(row.basicRate, row.discType, row.discValue)) * (parseFloat(row.qty) || 0)))}`
                              : "—"}
                          </span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-1 flex justify-between font-semibold text-gray-800">
                        <span>Total (Landed)</span>
                        <span className="font-mono">
                          ₹ {fmtNum(form.items.reduce((s, row) =>
                            s + calcLandedRate(row.basicRate, row.discType, row.discValue) * (parseFloat(row.qty) || 0), 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {!isReadOnly && (
                  <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={13} /> Add Item
                  </button>
                )}
              </div>
            )}

            {/* ══ TERMS & CONDITIONS ══ */}
            {activeTab === "terms" && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Line","Term *","Description *","Term Type",""].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.terms.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono w-10">{i + 1}</td>
                          <td className="px-1 py-1 w-36">
                            <input value={row.term} onChange={(e) => updTerm(i, "term", e.target.value)}
                              disabled={isReadOnly} placeholder="e.g. Payment" className={cellCls(errors[`term_${i}`])} />
                            {errors[`term_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`term_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.description} onChange={(e) => updTerm(i, "description", e.target.value)}
                              disabled={isReadOnly} placeholder="Full clause text as stated by vendor" className={cellCls(errors[`termdesc_${i}`])} />
                            {errors[`termdesc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`termdesc_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1 w-28">
                            <select value={row.termType} onChange={(e) => updTerm(i, "termType", e.target.value)}
                              disabled={isReadOnly} className={cellCls(false)}>
                              <option value="">— Type —</option>
                              {TERM_TYPE_OPT.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-1 text-center w-10">
                            {!isReadOnly && <button onClick={() => delTerm(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>}
                          </td>
                        </tr>
                      ))}
                      {form.terms.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No terms added.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {!isReadOnly && (
                  <button onClick={addTerm} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={13} /> Add Term
                  </button>
                )}

                <div className="pt-2">
                  <Field label="Remark (internal — not printed on any external document)">
                    <TInput value={form.remark} onChange={(e) => setField("remark", e.target.value)}
                      disabled={isReadOnly} placeholder="Internal notes about vendor quotes and negotiation points…" rows={3} />
                  </Field>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Error Summary ── */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {Object.keys(errors).length > 6 && <li>…and {Object.keys(errors).length - 6} more error(s)</li>}
              </ul>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 pb-2">Fields marked <span className="text-red-400 font-medium">*</span> are mandatory.</p>
      </div>
    </Layout>
  );
}
