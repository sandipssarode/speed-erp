import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Save, X, Copy, Printer, Paperclip, Plus, Trash2, FileText,
  ChevronRight, AlertCircle, CheckCircle, Edit2, Upload, XCircle,
  ChevronLeft, List,
} from "lucide-react";

// ─── Master Data ─────────────────────────────────────────────────────────────
const SERIES_OPTIONS  = ["PR", "PR-IMP", "PR-SC"];
const UNIT_OPTIONS    = ["VATVA PLANT", "ANKLESHWAR", "HEAD OFFICE"];
const TYPE_OPTIONS    = ["Regular", "Sub-contracting", "Import", "Others"];
const PR_CATEGORIES   = ["Raw Material", "Capital Goods", "Consumables", "Spare Parts", "Services"];
const UOM_OPTIONS     = ["KGS", "MTR", "NOS", "LTR", "SQM", "TON", "SET", "PKT"];

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_PRS = [
  {
    id: "pr1001",
    year: "25-26", series: "PR", number: "PR/25-26/0001",
    date: "2026-04-05", unit: "VATVA PLANT", type: "Regular",
    reference: "SO-2024-0412", basedOn: "WO-APR-001",
    budgetCode: "BDG-RM-2526", prCategory: "Raw Material",
    status: "Open",
    createdAt: "2026-04-05T09:15:00.000Z", updatedAt: "2026-04-05T09:15:00.000Z",
    createdBy: "Ramesh Patil", updatedBy: "Ramesh Patil",
    attachments: [
      { id: "a1", name: "Material_Spec_SS304.pdf", size: 204800, type: "application/pdf" },
    ],
    items: [
      { id: "i1", itemCode: "RM-PLATE-67", description: "Plate SS 304 4MM", qty: "500", uom: "KGS",
        preferredVendor: "STAR INDUSTRIES", budgetaryRate: "72.50",
        remark: "PLATE SIZE: 1500 X 6000 MM. IS 2062 Grade A",
        deliveryQty: "500", deliveryDate: "2026-04-20" },
      { id: "i2", itemCode: "RM-0071", description: "MS Round Bar Ø25mm", qty: "200", uom: "KGS",
        preferredVendor: "PRIME STEEL", budgetaryRate: "58.00",
        remark: "IS 2062 E250 Grade",
        deliveryQty: "200", deliveryDate: "2026-04-20" },
      { id: "i3", itemCode: "RM-PIPE-12", description: "SS 316L Seamless Pipe 2 inch SCH 40", qty: "120", uom: "MTR",
        preferredVendor: "ADITYA STEEL & ALLOYS", budgetaryRate: "1850.00",
        remark: "ASTM A312 TP316L. Mill test certificate required.",
        deliveryQty: "120", deliveryDate: "2026-04-25" },
    ],
  },
  {
    id: "pr1002",
    year: "25-26", series: "PR", number: "PR/25-26/0002",
    date: "2026-04-12", unit: "ANKLESHWAR", type: "Regular",
    reference: "MR-ANK-0088", basedOn: "",
    budgetCode: "BDG-CS-2526", prCategory: "Consumables",
    status: "Open",
    createdAt: "2026-04-12T10:30:00.000Z", updatedAt: "2026-04-12T11:00:00.000Z",
    createdBy: "Anita Sharma", updatedBy: "Anita Sharma",
    attachments: [],
    items: [
      { id: "i4", itemCode: "CS-GLOVES-01", description: "Safety Hand Gloves — Nitrile (Size M)", qty: "200", uom: "NOS",
        preferredVendor: "SAFETY ZONE SUPPLIERS", budgetaryRate: "45.00",
        remark: "IS 4770 certified. Blue colour only.",
        deliveryQty: "200", deliveryDate: "2026-04-18" },
      { id: "i5", itemCode: "CS-HELMET-02", description: "Industrial Safety Helmet — White", qty: "50", uom: "NOS",
        preferredVendor: "SAFEGUARD EQUIPMENTS", budgetaryRate: "285.00",
        remark: "IS 2925 certified. Ratchet type suspension.",
        deliveryQty: "50", deliveryDate: "2026-04-18" },
      { id: "i6", itemCode: "CS-GOGGLE-03", description: "Safety Goggles — Anti Fog", qty: "80", uom: "NOS",
        preferredVendor: "SAFETY ZONE SUPPLIERS", budgetaryRate: "120.00",
        remark: "UV protection + anti-scratch coating required.",
        deliveryQty: "80", deliveryDate: "2026-04-22" },
      { id: "i7", itemCode: "CS-TAPE-05", description: "PTFE Thread Seal Tape 12mm x 10m", qty: "500", uom: "NOS",
        preferredVendor: "", budgetaryRate: "18.00",
        remark: "",
        deliveryQty: "500", deliveryDate: "2026-04-18" },
    ],
  },
  {
    id: "pr1003",
    year: "25-26", series: "PR-IMP", number: "PR-IMP/25-26/0001",
    date: "2026-04-18", unit: "VATVA PLANT", type: "Import",
    reference: "PO-EXP-2024-09", basedOn: "WO-IMP-003",
    budgetCode: "BDG-IMP-2526", prCategory: "Raw Material",
    status: "Open",
    createdAt: "2026-04-18T14:00:00.000Z", updatedAt: "2026-04-18T14:00:00.000Z",
    createdBy: "Ramesh Patil", updatedBy: "Ramesh Patil",
    attachments: [
      { id: "a2", name: "Import_Tech_Spec_Bearings.pdf", size: 512000, type: "application/pdf" },
      { id: "a3", name: "Approved_Vendor_List_Import.xlsx", size: 98304, type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
    ],
    items: [
      { id: "i8", itemCode: "IMP-BRG-6205", description: "Deep Groove Ball Bearing 6205-2RS", qty: "150", uom: "NOS",
        preferredVendor: "INDO GULF IMPEX", budgetaryRate: "320.00",
        remark: "SKF or FAG make preferred. 2RS (double rubber sealed).",
        deliveryQty: "150", deliveryDate: "2026-05-30" },
      { id: "i9", itemCode: "IMP-SEAL-TC40", description: "Oil Seal TC 40x55x10 NBR", qty: "200", uom: "NOS",
        preferredVendor: "INDO GULF IMPEX", budgetaryRate: "185.00",
        remark: "NOK or Freudenberg make. High temp NBR compound.",
        deliveryQty: "200", deliveryDate: "2026-05-30" },
      { id: "i10", itemCode: "IMP-BOLT-M20", description: "Hex Bolt M20 x 80mm Grade 10.9 Zinc Plated", qty: "500", uom: "NOS",
        preferredVendor: "INDO GULF IMPEX", budgetaryRate: "42.00",
        remark: "DIN 933 full thread. Certificate of conformity required.",
        deliveryQty: "500", deliveryDate: "2026-06-05" },
    ],
  },
  {
    id: "pr1004",
    year: "25-26", series: "PR-SC", number: "PR-SC/25-26/0001",
    date: "2026-05-02", unit: "VATVA PLANT", type: "Sub-contracting",
    reference: "JW-MAY-011", basedOn: "BOM-FG-0234",
    budgetCode: "", prCategory: "Services",
    status: "Open",
    createdAt: "2026-05-02T08:45:00.000Z", updatedAt: "2026-05-02T09:10:00.000Z",
    createdBy: "Anita Sharma", updatedBy: "Anita Sharma",
    attachments: [
      { id: "a4", name: "Jobwork_Drawing_Rev2.pdf", size: 1048576, type: "application/pdf" },
    ],
    items: [
      { id: "i11", itemCode: "JW-TURN-001", description: "CNC Turning — SS 316 Spindle Ø60 x 250mm", qty: "40", uom: "NOS",
        preferredVendor: "PRECISION MACHINING CO.", budgetaryRate: "950.00",
        remark: "Drawing No: SPD-CNC-2024-Rev2. Ra ≤ 1.6 µm finish required.",
        deliveryQty: "40", deliveryDate: "2026-05-20" },
      { id: "i12", itemCode: "JW-WELD-002", description: "Fabrication & Welding — MS Frame Assembly", qty: "10", uom: "NOS",
        preferredVendor: "SWIFTLOGIX FABRICATORS", budgetaryRate: "4500.00",
        remark: "IS 816 welding standard. Weld test report mandatory.",
        deliveryQty: "10", deliveryDate: "2026-05-25" },
      { id: "i13", itemCode: "JW-COAT-003", description: "Powder Coating — Epoxy Grey RAL 7035", qty: "50", uom: "NOS",
        preferredVendor: "COLORCOAT INDUSTRIES", budgetaryRate: "380.00",
        remark: "Min 80 micron DFT. Salt spray test 500 hrs.",
        deliveryQty: "50", deliveryDate: "2026-05-28" },
    ],
  },
  {
    id: "pr1005",
    year: "25-26", series: "PR", number: "PR/25-26/0003",
    date: "2026-05-15", unit: "HEAD OFFICE", type: "Others",
    reference: "", basedOn: "",
    budgetCode: "BDG-CAP-2526", prCategory: "Capital Goods",
    status: "Open",
    createdAt: "2026-05-15T11:20:00.000Z", updatedAt: "2026-05-15T11:20:00.000Z",
    createdBy: "Ramesh Patil", updatedBy: "Ramesh Patil",
    attachments: [],
    items: [
      { id: "i14", itemCode: "CG-LAPTOP-01", description: "Laptop — Dell Latitude 5540 i7 16GB 512SSD", qty: "5", uom: "NOS",
        preferredVendor: "TECHNOCRAFT TRADING CO.", budgetaryRate: "95000.00",
        remark: "Win 11 Pro. Pre-installed with MS Office 365.",
        deliveryQty: "5", deliveryDate: "2026-05-28" },
      { id: "i15", itemCode: "CG-CHAIR-02", description: "Ergonomic Office Chair — High Back Mesh", qty: "10", uom: "NOS",
        preferredVendor: "", budgetaryRate: "12500.00",
        remark: "Adjustable lumbar support. 5-year warranty.",
        deliveryQty: "10", deliveryDate: "2026-06-05" },
    ],
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function getFinancialYear() {
  const now   = new Date();
  const yr    = now.getFullYear();
  const month = now.getMonth() + 1;
  const from  = month >= 4 ? yr       : yr - 1;
  const to    = month >= 4 ? yr + 1   : yr;
  return `${String(from).slice(2)}-${String(to).slice(2)}`;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function nextPRNumber(series, allPRs) {
  const count = allPRs.filter((p) => p.series === series).length + 1;
  return `${series}/${getFinancialYear()}/${String(count).padStart(4, "0")}`;
}

function emptyItem() {
  return {
    id: Date.now() + Math.random(),
    itemCode: "", description: "", qty: "", uom: "",
    preferredVendor: "", budgetaryRate: "", remark: "",
    deliveryQty: "", deliveryDate: "",
  };
}

function emptyForm() {
  return {
    id: "", year: getFinancialYear(), series: "PR", number: "",
    date: todayISO(), unit: "", type: "Regular",
    reference: "", basedOn: "", budgetCode: "", prCategory: "",
    items: [], attachments: [], status: "Open",
    createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.series)  e.series  = "Series is a required field.";
  if (!form.date)    e.date    = "Date is a required field.";
  if (!form.unit)    e.unit    = "Unit is a required field.";
  if (!form.type)    e.type    = "Type is a required field.";
  if (form.items.length === 0)
    e.items = "At least one line item is required before saving.";

  form.items.forEach((item, i) => {
    if (!item.itemCode?.trim())    e[`ic_${i}`]  = "Item Code is a required field.";
    if (!item.description?.trim()) e[`desc_${i}`] = "Item Description is a required field.";
    if (!item.uom)                 e[`uom_${i}`]  = "UOM is a required field.";
    if (!item.qty || Number(item.qty) <= 0)
      e[`qty_${i}`] = "Required Qty must be greater than zero.";
    if (item.deliveryDate && item.deliveryDate < form.date)
      e[`dd_${i}`] = "Delivery Date cannot be before PR Date.";
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
      {error && (
        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <AlertCircle size={11} className="shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-blue-400"}
  ${disabled
    ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
    : "bg-white border-gray-300 hover:border-gray-400"}`;

function TInput({ value, onChange, disabled, placeholder, type = "text", error, min }) {
  return (
    <input type={type} value={value ?? ""} onChange={onChange}
      disabled={disabled} placeholder={placeholder} min={min}
      className={inputCls(disabled, error)} />
  );
}

function TSelect({ value, onChange, disabled, options, placeholder, error }) {
  return (
    <select value={value ?? ""} onChange={onChange} disabled={disabled}
      className={inputCls(disabled, error)}>
      <option value="">{placeholder || "— Select —"}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// Inline cell input for grids
const cellCls = (err) =>
  `w-full px-1.5 py-1 text-xs border-0 outline-none bg-transparent focus:bg-white focus:ring-1 focus:ring-blue-300 rounded
  ${err ? "bg-red-50 ring-1 ring-red-300" : ""}`;

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border
      ${isErr ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {toast.msg}
    </div>
  );
}

// ─── Stock Footer Data ────────────────────────────────────────────────────────
const STOCK_FIELDS = [
  { label: "Free Stock",                     unit: "KGS" },
  { label: "Reserved Stock",                 unit: "KGS" },
  { label: "Pending Stock",                  unit: "KGS" },
  { label: "Pending QC Qty",                 unit: "KGS" },
  { label: "Last PO Rate",                   unit: "INR / KGS" },
  { label: "Pending Indent Qty (Authorized)",   unit: "KGS" },
  { label: "Pending Indent Qty (Unauthorized)", unit: "KGS" },
  { label: "Pending PO Qty (Authorized)",    unit: "KGS" },
  { label: "Pending PO Qty (Unauthorized)",  unit: "KGS" },
  { label: "Purchase UOM",                   unit: "from Item Master" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PurchaseRequisition() {
  const navigate = useNavigate();

  const [mode,          setMode]          = useState("new");   // new | view | edit
  const [form,          setForm]          = useState(emptyForm());
  const [errors,        setErrors]        = useState({});
  const [activeTab,     setActiveTab]     = useState("items");
  const [toast,         setToast]         = useState(null);
  const [showAttach,    setShowAttach]    = useState(false);
  const [commonDelDate, setCommonDelDate] = useState("");
  const [allPRs,        setAllPRs]        = useState([]);
  const [currentIdx,    setCurrentIdx]    = useState(-1);
  const [showList,      setShowList]      = useState(false);
  const fileRef = useRef(null);

  const isReadOnly = mode === "view";

  // Seed + load on mount
  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
    if (stored.length === 0) {
      localStorage.setItem("purchase_requisitions", JSON.stringify(SEED_PRS));
      stored = SEED_PRS;
    }
    setAllPRs(stored);
    // Open the most recent PR
    setForm(stored[stored.length - 1]);
    setCurrentIdx(stored.length - 1);
    setMode("view");
  }, []);

  // Keep allPRs in sync after saves
  const reloadList = () => {
    const stored = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
    setAllPRs(stored);
    return stored;
  };

  // Navigate to a specific PR by index
  const goTo = (idx) => {
    const list = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
    if (idx < 0 || idx >= list.length) return;
    setForm(list[idx]);
    setCurrentIdx(idx);
    setMode("view");
    setErrors({});
    setShowList(false);
    setActiveTab("items");
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Field updater ──
  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => { const e = { ...p }; delete e[key]; return e; });
  };

  // ── Item CRUD ──
  const addItem = () => {
    setForm((p) => ({ ...p, items: [...p.items, emptyItem()] }));
    if (errors.items) setErrors((p) => { const e = { ...p }; delete e.items; return e; });
  };

  const updItem = (i, key, value) => {
    setForm((p) => {
      const items = [...p.items];
      items[i] = { ...items[i], [key]: value };
      return { ...p, items };
    });
    const errKey = { itemCode: `ic_${i}`, description: `desc_${i}`, qty: `qty_${i}`, uom: `uom_${i}`, deliveryDate: `dd_${i}` }[key];
    if (errKey && errors[errKey]) setErrors((p) => { const e = { ...p }; delete e[errKey]; return e; });
  };

  const delItem = (i) => {
    if (!window.confirm("Remove this item line?")) return;
    setForm((p) => ({ ...p, items: p.items.filter((_, x) => x !== i) }));
  };

  // ── Apply common delivery date ──
  const applyCommonDate = () => {
    if (!commonDelDate) return;
    setForm((p) => ({
      ...p,
      items: p.items.map((item) => ({ ...item, deliveryDate: commonDelDate })),
    }));
  };

  // ── Save ──
  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (Object.values(errs).some((_, k) => ["items"].includes(Object.keys(errs)[k])))
        setActiveTab("items");
      showToast("Please correct the highlighted fields and try again.", "error");
      return;
    }

    const all  = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
    const now  = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const uname = user.name || user.fullName || "System";

    let saved;
    if (!form.id) {
      const number = nextPRNumber(form.series, all);
      saved = { ...form, id: Date.now().toString(), number, createdAt: now, updatedAt: now, createdBy: uname, updatedBy: uname };
      all.push(saved);
    } else {
      saved = { ...form, updatedAt: now, updatedBy: uname };
      const idx = all.findIndex((p) => p.id === form.id);
      if (idx !== -1) all[idx] = saved; else all.push(saved);
    }

    localStorage.setItem("purchase_requisitions", JSON.stringify(all));
    const updated = reloadList();
    const newIdx  = updated.findIndex((p) => p.id === saved.id);
    setForm(saved);
    setCurrentIdx(newIdx !== -1 ? newIdx : updated.length - 1);
    setMode("view");
    setErrors({});
    showToast(`Purchase Requisition ${saved.number} saved successfully.`);
  };

  // ── Cancel / Discard ──
  const handleCancel = () => {
    if (mode === "new") {
      if (form.items.length > 0 || form.unit || form.reference) {
        if (!window.confirm("Discard all unsaved changes?")) return;
      }
      // Go back to last viewed PR if any exists
      const list = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
      if (list.length > 0) {
        const idx = currentIdx >= 0 ? Math.min(currentIdx, list.length - 1) : list.length - 1;
        setForm(list[idx]);
        setCurrentIdx(idx);
        setMode("view");
      } else {
        setForm(emptyForm());
        setMode("view");
      }
      setErrors({});
      return;
    }
    if (mode === "edit") {
      const all   = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
      const saved = all.find((p) => p.id === form.id);
      if (saved) setForm(saved);
      setMode("view");
      setErrors({});
    }
  };

  // ── Copy Requisition ──
  const handleCopy = () => {
    if (!window.confirm("Copy this Purchase Requisition into a new document? A new PR will be created.")) return;
    const copy = {
      ...form, id: "", number: "",
      date: todayISO(), createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
      attachments: [],
      items: form.items.map((it) => ({ ...it, id: Date.now() + Math.random(), deliveryDate: "", deliveryQty: "" })),
    };
    setForm(copy);
    setCurrentIdx(-1);
    setMode("new");
    setErrors({});
    showToast("Requisition copied — review and save as a new PR.");
  };

  // ── Print ──
  const handlePrint = () => {
    if (!form.number) { showToast("Please save the PR before printing.", "error"); return; }
    window.print();
  };

  // ── Attachments ──
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const added = files.map((f) => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, type: f.type }));
    setForm((p) => ({ ...p, attachments: [...(p.attachments || []), ...added] }));
    e.target.value = "";
    showToast(`${files.length} file(s) attached.`);
  };

  const removeAttachment = (id) => {
    setForm((p) => ({ ...p, attachments: (p.attachments || []).filter((a) => a.id !== id) }));
  };

  const itemErrors = Object.keys(errors).some((k) => k.startsWith("ic_") || k.startsWith("desc_") || k.startsWith("qty_") || k.startsWith("uom_") || k.startsWith("dd_") || k === "items");

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Purchase</span>
          <ChevronRight size={12} />
          <span>Transaction</span>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Purchase Requisition</span>
          {form.number && (
            <>
              <ChevronRight size={12} />
              <span className="text-blue-600 font-medium">{form.number}</span>
            </>
          )}
        </div>

        {/* ── Toast ── */}
        <Toast toast={toast} />

        {/* ── Action Toolbar ── */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">

          {/* Save / Discard — visible in new/edit mode */}
          {(mode === "new" || mode === "edit") && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                <Save size={13} /> Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
              >
                <X size={13} /> Cancel
              </button>
            </>
          )}

          {/* Edit — visible in view mode */}
          {mode === "view" && (
            <button
              onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium"
            >
              <Edit2 size={13} /> Edit
            </button>
          )}

          {/* New PR */}
          {mode === "view" && (
            <button
              onClick={() => { setForm(emptyForm()); setCurrentIdx(-1); setMode("new"); setErrors({}); setActiveTab("items"); setShowList(false); }}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"
            >
              <Plus size={13} /> New PR
            </button>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"
          >
            <Copy size={13} /> Copy Requisition
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"
          >
            <Printer size={13} /> Format / Print
          </button>

          <button
            onClick={() => setShowAttach((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors
              ${showAttach ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            <Paperclip size={13} /> Attachments
            {(form.attachments?.length > 0) && (
              <span className="bg-blue-100 text-blue-600 text-xs px-1.5 rounded-full">{form.attachments.length}</span>
            )}
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* ── PR Navigator ── */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goTo(currentIdx - 1)}
              disabled={currentIdx <= 0 || mode !== "view"}
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous PR"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => goTo(currentIdx + 1)}
              disabled={currentIdx >= allPRs.length - 1 || mode !== "view"}
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next PR"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => setShowList((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded font-medium transition-colors
                ${showList ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}
              title="All PRs"
            >
              <List size={13} />
              {allPRs.length > 0 && (
                <span className="text-gray-400">{currentIdx >= 0 ? `${currentIdx + 1} / ${allPRs.length}` : `${allPRs.length}`}</span>
              )}
            </button>
          </div>

          {/* Meta info */}
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
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Paperclip size={14} /> Attachments
              </h3>
              {!isReadOnly && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    <Upload size={13} /> Upload File
                  </button>
                  <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                </>
              )}
            </div>
            {(!form.attachments || form.attachments.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                No attachments yet.{!isReadOnly && " Click Upload File to add specifications, approvals, or emails."}
              </p>
            ) : (
              <div className="space-y-1">
                {form.attachments.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
                    <FileText size={13} className="text-gray-400 shrink-0" />
                    <span className="flex-1">{a.name}</span>
                    <span className="text-gray-400">{a.size ? `${(a.size / 1024).toFixed(1)} KB` : ""}</span>
                    {!isReadOnly && (
                      <button onClick={() => removeAttachment(a.id)} className="text-red-400 hover:text-red-600">
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PR List Panel ── */}
        {showList && (
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <List size={13} /> All Purchase Requisitions
                <span className="text-gray-400 font-normal normal-case">({allPRs.length} records)</span>
              </h3>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PR Number","Date","Unit","Type","PR Category","Series","Items","Status",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPRs.map((pr, i) => (
                    <tr
                      key={pr.id}
                      onClick={() => goTo(i)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-blue-50/40
                        ${i === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}
                    >
                      <td className="px-3 py-2 font-mono font-semibold text-blue-600">{pr.number}</td>
                      <td className="px-3 py-2 text-gray-600">{pr.date ? new Date(pr.date).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pr.unit || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pr.type || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pr.prCategory || "—"}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{pr.series}</span>
                      </td>
                      <td className="px-3 py-2 text-center text-gray-600">{pr.items?.length || 0}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs">{pr.status}</span>
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
          <span className="font-bold text-base tracking-wide">
            {form.number || "New Purchase Requisition"}
          </span>
          {form.unit && <span className="text-blue-200 text-sm">| {form.unit}</span>}
          <div className="ml-auto flex items-center gap-2">
            {(mode === "new" || mode === "edit") && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                {mode === "new" ? "New Record" : "Editing"}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border
              ${form.status === "Open"
                ? "bg-green-400/20 text-green-100 border-green-300/30"
                : "bg-blue-400/20 text-blue-100 border-blue-300/30"}`}>
              {form.status || "Open"}
            </span>
          </div>
        </div>

        {/* ── Header Details ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Header Details
          </div>
          <div className="p-4 space-y-3">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Year" required>
                <TInput value={form.year} disabled placeholder="24-25" />
              </Field>
              <Field label="Series" required error={errors.series}>
                <TSelect
                  value={form.series}
                  onChange={(e) => setField("series", e.target.value)}
                  disabled={isReadOnly}
                  options={SERIES_OPTIONS}
                  error={errors.series}
                />
              </Field>
              <Field label="Number" required>
                <TInput value={form.number} disabled placeholder="Auto-generated on Save" />
              </Field>
              <Field label="Date" required error={errors.date}>
                <TInput
                  type="date"
                  value={form.date}
                  onChange={(e) => setField("date", e.target.value)}
                  disabled={isReadOnly}
                  error={errors.date}
                />
              </Field>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Unit" required error={errors.unit}>
                <TSelect
                  value={form.unit}
                  onChange={(e) => setField("unit", e.target.value)}
                  disabled={isReadOnly}
                  options={UNIT_OPTIONS}
                  placeholder="— Select Unit —"
                  error={errors.unit}
                />
              </Field>
              <Field label="Type" required error={errors.type}>
                <TSelect
                  value={form.type}
                  onChange={(e) => setField("type", e.target.value)}
                  disabled={isReadOnly}
                  options={TYPE_OPTIONS}
                  error={errors.type}
                />
              </Field>
              <Field label="Reference">
                <TInput
                  value={form.reference}
                  onChange={(e) => setField("reference", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Project No / SO No"
                />
              </Field>
              <Field label="Based On">
                <TInput
                  value={form.basedOn}
                  onChange={(e) => setField("basedOn", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Indent / Work Order ref."
                />
              </Field>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Budget Code">
                <TInput
                  value={form.budgetCode}
                  onChange={(e) => setField("budgetCode", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Lookup budget master"
                />
              </Field>
              <Field label="PR Category">
                <TSelect
                  value={form.prCategory}
                  onChange={(e) => setField("prCategory", e.target.value)}
                  disabled={isReadOnly}
                  options={PR_CATEGORIES}
                  placeholder="— Select —"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Body Tabs: Items + Delivery Schedule ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50">
            {[
              { id: "items",    label: "Items",             hasErr: itemErrors },
              { id: "delivery", label: "Delivery Schedule", hasErr: false },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                {tab.label}
                {tab.hasErr && <AlertCircle size={12} className="text-red-400" />}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* ════ ITEMS TAB ════ */}
            {activeTab === "items" && (
              <div className="space-y-3">
                {errors.items && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.items}
                  </p>
                )}

                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          { label: "Sr",               w: "w-10"  },
                          { label: "Item Code *",       w: "w-32"  },
                          { label: "Description *",     w: ""      },
                          { label: "Qty *",             w: "w-20"  },
                          { label: "UOM *",             w: "w-24"  },
                          { label: "Preferred Vendor",  w: "w-40"  },
                          { label: "Budgetary Rate",    w: "w-28"  },
                          { label: "Remark",            w: ""      },
                          { label: "",                  w: "w-10"  },
                        ].map((h) => (
                          <th key={h.label}
                            className={`${h.w} px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap`}>
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono text-xs">{i + 1}</td>

                          <td className="px-1 py-1">
                            <input
                              value={row.itemCode}
                              onChange={(e) => updItem(i, "itemCode", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="Item Code"
                              className={cellCls(errors[`ic_${i}`])}
                            />
                            {errors[`ic_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`ic_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <input
                              value={row.description}
                              onChange={(e) => updItem(i, "description", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="Item description"
                              className={cellCls(errors[`desc_${i}`])}
                            />
                            {errors[`desc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`desc_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              value={row.qty}
                              onChange={(e) => updItem(i, "qty", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="0"
                              className={`${cellCls(errors[`qty_${i}`])} text-right`}
                            />
                            {errors[`qty_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`qty_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <select
                              value={row.uom}
                              onChange={(e) => updItem(i, "uom", e.target.value)}
                              disabled={isReadOnly}
                              className={cellCls(errors[`uom_${i}`])}
                            >
                              <option value="">UOM</option>
                              {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                            {errors[`uom_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`uom_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <input
                              value={row.preferredVendor}
                              onChange={(e) => updItem(i, "preferredVendor", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="Vendor name"
                              className={cellCls(false)}
                            />
                          </td>

                          <td className="px-1 py-1">
                            <input
                              type="number"
                              min="0"
                              value={row.budgetaryRate}
                              onChange={(e) => updItem(i, "budgetaryRate", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="0.00"
                              className={`${cellCls(false)} text-right`}
                            />
                          </td>

                          <td className="px-1 py-1">
                            <input
                              value={row.remark}
                              onChange={(e) => updItem(i, "remark", e.target.value)}
                              disabled={isReadOnly}
                              placeholder="e.g. PLATE SIZE: 1500 X 6000"
                              className={cellCls(false)}
                            />
                          </td>

                          <td className="px-2 py-1 text-center">
                            {!isReadOnly && (
                              <button
                                onClick={() => delItem(i)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Empty hint row */}
                      {!isReadOnly && (
                        <tr>
                          <td className="px-2 py-1.5 text-center text-gray-300 text-xs">{form.items.length + 1}</td>
                          <td colSpan={8} className="px-2 py-1.5 text-xs text-gray-300 italic">
                            Empty row — click + Add Item to insert
                          </td>
                        </tr>
                      )}

                      {form.items.length === 0 && isReadOnly && (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                            No items added.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                )}
              </div>
            )}

            {/* ════ DELIVERY SCHEDULE TAB ════ */}
            {activeTab === "delivery" && (
              <div className="space-y-3">

                {/* Set Common Delivery Date */}
                {!isReadOnly && (
                  <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded p-3 text-xs flex-wrap">
                    <label className="text-gray-500 font-medium whitespace-nowrap">
                      Set Common Delivery Date:
                    </label>
                    <input
                      type="date"
                      value={commonDelDate}
                      min={form.date}
                      onChange={(e) => setCommonDelDate(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <button
                      onClick={applyCommonDate}
                      className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
                    >
                      Apply to All
                    </button>
                    <span className="text-gray-400">— applies selected date to all item lines</span>
                  </div>
                )}

                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {[
                          { label: "Sr.",             w: "w-10"  },
                          { label: "Item Code",       w: "w-32"  },
                          { label: "Name",            w: ""      },
                          { label: "Qty",             w: "w-20"  },
                          { label: "UOM",             w: "w-20"  },
                          { label: "Delivery Qty",    w: "w-28"  },
                          { label: "Delivery Date *", w: "w-36"  },
                        ].map((h) => (
                          <th key={h.label}
                            className={`${h.w} px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap`}>
                            {h.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-gray-400 text-sm">
                            Add items in the Items tab first.
                          </td>
                        </tr>
                      ) : (
                        form.items.map((row, i) => (
                          <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                            <td className="px-2 py-1.5 text-center text-gray-400 font-mono">{i + 1}</td>

                            {/* Display-only columns */}
                            <td className="px-2 py-1.5 text-gray-500 bg-gray-50/60 font-mono text-xs">
                              {row.itemCode || "—"}
                            </td>
                            <td className="px-2 py-1.5 text-gray-600 bg-gray-50/60">
                              {row.description || "—"}
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-500 bg-gray-50/60">
                              {row.qty || "—"}
                            </td>
                            <td className="px-2 py-1.5 text-gray-500 bg-gray-50/60">
                              {row.uom || "—"}
                            </td>

                            {/* Editable: Delivery Qty */}
                            <td className="px-1 py-1">
                              <input
                                type="number"
                                min="0"
                                value={row.deliveryQty}
                                onChange={(e) => updItem(i, "deliveryQty", e.target.value)}
                                disabled={isReadOnly}
                                placeholder="0"
                                className={`${cellCls(false)} text-right`}
                              />
                            </td>

                            {/* Editable: Delivery Date */}
                            <td className="px-1 py-1">
                              <input
                                type="date"
                                min={form.date}
                                value={row.deliveryDate}
                                onChange={(e) => updItem(i, "deliveryDate", e.target.value)}
                                disabled={isReadOnly}
                                className={cellCls(errors[`dd_${i}`])}
                              />
                              {errors[`dd_${i}`] && (
                                <p className="text-xs text-red-500 mt-0.5">{errors[`dd_${i}`]}</p>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer: Stock & Pending Summary ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            Stock &amp; Pending Summary
            <span className="text-gray-400 font-normal normal-case">— Auto-fetched, Read-Only</span>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {STOCK_FIELDS.map((s) => (
              <div key={s.label} className="bg-gray-50 border border-gray-200 rounded p-3">
                <div className="text-xs text-gray-400 mb-1 leading-tight">{s.label}</div>
                <div className="text-sm font-semibold text-gray-700">—</div>
                <div className="text-xs text-gray-400 mt-1">{s.unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form-level error summary ── */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">
                Please correct the highlighted fields and try again.
              </p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {Object.keys(errors).length > 6 && (
                  <li>...and {Object.keys(errors).length - 6} more error(s)</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* ── Footer note ── */}
        <p className="text-xs text-gray-400 pb-2">
          Fields marked <span className="text-red-400 font-medium">*</span> are mandatory.
          Blue-bordered fields have lookup or auto-generation enabled.
        </p>

      </div>
    </Layout>
  );
}
