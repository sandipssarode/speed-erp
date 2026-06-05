import { useState, useEffect, useRef } from "react";
import Layout from "../../components/Layout";
import {
  Save, X, Plus, Trash2, FileText, ChevronRight, AlertCircle, CheckCircle,
  Edit2, Upload, XCircle, ChevronLeft, List, Printer, Paperclip, Search,
  Clock, Lock, RefreshCw, Mail, TrendingUp, CheckSquare,
} from "lucide-react";

// ─── Master Data ──────────────────────────────────────────────────────────────
const SERIES_OPTIONS       = ["PO", "PO-IMP", "PO-SC"];
const UNIT_OPTIONS         = ["VATVA PLANT", "ANKLESHWAR", "HEAD OFFICE"];
const PO_TYPE_OPTIONS      = ["Regular", "Sub-Contract", "Import", "Others"];
const CATEGORY_OPTIONS     = ["Raw Material", "Capital Goods", "Consumables", "Spare Parts", "Services", "Packing"];
const UOM_OPTIONS          = ["KGS", "MTR", "NOS", "LTR", "SQM", "TON", "SET", "PKT"];
const CURRENCY_OPTIONS     = ["INR", "USD", "EUR", "GBP"];
const INCOTERMS_OPTIONS    = ["EXW", "FOB", "CIF", "DDP", "DAP", "FCA"];
const TERM_TYPE_OPTIONS    = ["Payment", "Delivery", "Legal", "Other"];
const DISC_TYPE_OPTIONS    = ["", "%", "Flat"];
const MILESTONE_TYPE_OPTIONS = ["%", "Flat", "Date"];
const GST_OPTIONS          = ["0", "5", "12", "18", "28"];
const TAX_GROUP_OPTIONS    = ["GST Standard", "GST Exempt", "GST Zero Rated", "RCM"];
const TERMS_TEMPLATE_OPTIONS = ["Standard Purchase", "Import Purchase", "Service Contract"];
const TERMS_TEMPLATES = {
  "Standard Purchase": [
    { term: "Payment",  description: "Payment within 30 days from invoice date via NEFT/RTGS.", termType: "Payment" },
    { term: "Delivery", description: "Delivery at our works. Transportation charges on vendor account.", termType: "Delivery" },
    { term: "Quality",  description: "Material to conform to applicable IS/BS standards. Test certificates mandatory.", termType: "Other" },
    { term: "Warranty", description: "Vendor warrants material against defects for 12 months from date of receipt.", termType: "Legal" },
  ],
  "Import Purchase": [
    { term: "Payment",    description: "Payment via LC at sight or TT within 60 days of BL date.", termType: "Payment" },
    { term: "Delivery",   description: "CIF destination port as per agreed Incoterms.", termType: "Delivery" },
    { term: "Inspection", description: "Pre-shipment inspection by third party at seller's cost.", termType: "Other" },
    { term: "Documents",  description: "Shipping documents: BL, Invoice, Packing List, COO, Test Certificate.", termType: "Legal" },
  ],
  "Service Contract": [
    { term: "Payment",     description: "Payment within 15 days from receipt of service completion certificate.", termType: "Payment" },
    { term: "SLA",         description: "Services to be delivered as per agreed SLA. Penalty applicable for delays.", termType: "Other" },
    { term: "Termination", description: "Either party may terminate with 30 days written notice.", termType: "Legal" },
  ],
};

const UNIT_STATE = {
  "VATVA PLANT": "Gujarat",
  "ANKLESHWAR": "Gujarat",
  "HEAD OFFICE": "Gujarat",
};

const VENDOR_MASTER = [
  { code: "VND-0014", name: "STAR INDUSTRIES",       contact: "Mr. Satish Chaudhary", email: "satish@starindustries.in",  phone: "+91 98200 11234", gstNo: "24AAACS1234A1ZX", state: "Gujarat",     gstStatus: "Regular", arnNo: "", currency: "INR" },
  { code: "VND-0029", name: "PRIME STEEL",           contact: "Ms. Rekha Iyer",       email: "rekha@primesteel.co.in",    phone: "+91 98110 55678", gstNo: "24BBBPS5678B2ZY", state: "Gujarat",     gstStatus: "Regular", arnNo: "", currency: "INR" },
  { code: "VND-0037", name: "ADITYA STEEL & ALLOYS", contact: "Mr. Arun Mehta",       email: "arun@adityasteel.in",       phone: "+91 90990 33412", gstNo: "27CCCAS9012C3ZZ", state: "Maharashtra", gstStatus: "Regular", arnNo: "", currency: "INR" },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function getFinancialYear() {
  const now = new Date(); const yr = now.getFullYear(); const m = now.getMonth() + 1;
  const from = m >= 4 ? yr : yr - 1; const to = m >= 4 ? yr + 1 : yr;
  return `${String(from).slice(2)}-${String(to).slice(2)}`;
}
function todayISO() { return new Date().toISOString().split("T")[0]; }
const uid = () => String(Date.now()) + String(Math.random()).slice(2, 8);

function nextPONumber(series, allPOs) {
  const count = allPOs.filter((p) => p.series === series).length + 1;
  return `${series}/${getFinancialYear()}/${String(count).padStart(4, "0")}`;
}

function emptyItem() {
  return {
    id: uid(), itemCode: "", description: "", pQty: "", pUoM: "", sQty: "", sUoM: "KGS",
    rate: "", discType: "", discValue: "", remark: "", vendorItemCode: "",
    drawingNo: "", revNo: "", hsnSACNo: "", gstPct: "18",
  };
}

function emptyTerm()      { return { id: uid(), term: "", description: "", termType: "" }; }
function emptyMilestone() { return { id: uid(), milestone: "", type: "%", typeValue: "", milestoneValue: "" }; }

function emptyForm() {
  return {
    id: "", year: getFinancialYear(), series: "PO", number: "",
    date: todayISO(), unit: "", poType: "Regular", status: "Open",
    highPriority: false, authorized: false, openPOIfReject: false,
    revNo: "0", revDate: "",
    vendorCode: "", vendorName: "", vendorGSTStatus: "", vendorState: "", vendorGSTNo: "", vendorARNNo: "",
    currency: "INR", exRate: "1",
    buyerCode: "", buyer: "",
    contactPerson: "", qtnNo: "", qtnDate: "",
    refSONo: "", reference: "", poCategory: "", budgetCode: "",
    items: [], delivery: [], terms: [], milestones: [],
    incoTerms: "", specialTerms: "",
    remark: "", revisionRemark: "", cancellationRemark: "",
    preparedBy: "", preparedDt: "", authBy: "", authDt: "", cancelBy: "", cancelDt: "",
    checkedBy: "", checkedDt: "",
    history: [], attachments: [],
    createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  };
}

// ─── Calculations ─────────────────────────────────────────────────────────────
function calcLineTotal(item) {
  const rate = parseFloat(item.rate) || 0;
  const qty  = parseFloat(item.pQty) || 0;
  const base = rate * qty;
  if (!item.discType || !item.discValue) return base;
  const dv = parseFloat(item.discValue) || 0;
  if (item.discType === "%") return base - (base * dv / 100);
  if (item.discType === "Flat") return base - dv;
  return base;
}

function calcLineDiscount(item) {
  const rate = parseFloat(item.rate) || 0;
  const qty  = parseFloat(item.pQty) || 0;
  const base = rate * qty;
  if (!item.discType || !item.discValue) return 0;
  const dv = parseFloat(item.discValue) || 0;
  if (item.discType === "%") return base * dv / 100;
  if (item.discType === "Flat") return dv;
  return 0;
}

function computeTaxRows(items, vendorState, unitState) {
  const isIGST = vendorState && unitState && vendorState !== unitState;
  const gstGroups = {};
  items.forEach((item) => {
    const pct = parseFloat(item.gstPct) || 0;
    const lineTotal = calcLineTotal(item);
    if (!gstGroups[pct]) gstGroups[pct] = 0;
    gstGroups[pct] += lineTotal;
  });
  const rows = [];
  Object.entries(gstGroups).forEach(([pct, taxableAmt]) => {
    const p = parseFloat(pct);
    if (isIGST) {
      rows.push({ taxCode: `IGST@${p}%`, name: `IGST ${p}%`, taxType: "IGST", incExc: "Exc", perVal: p, value: taxableAmt, taxValue: taxableAmt * p / 100, payToVendor: true, currency: "INR" });
    } else {
      const half = p / 2;
      rows.push({ taxCode: `CGST@${half}%`, name: `CGST ${half}%`, taxType: "CGST", incExc: "Exc", perVal: half, value: taxableAmt, taxValue: taxableAmt * half / 100, payToVendor: true, currency: "INR" });
      rows.push({ taxCode: `SGST@${half}%`, name: `SGST ${half}%`, taxType: "SGST", incExc: "Exc", perVal: half, value: taxableAmt, taxValue: taxableAmt * half / 100, payToVendor: true, currency: "INR" });
    }
  });
  return rows;
}

function computeMilestoneValue(m, totalPOValue) {
  const tv = parseFloat(m.typeValue) || 0;
  if (m.type === "%")    return (tv / 100) * totalPOValue;
  if (m.type === "Flat") return tv;
  return 0;
}

function fmtAmt(v) {
  return (parseFloat(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_POS = [
  {
    id: "po1001",
    year: "25-26", series: "PO", number: "PO/25-26/0001",
    date: "2026-02-10", unit: "VATVA PLANT", poType: "Regular", status: "Open",
    highPriority: false, authorized: false, openPOIfReject: false,
    revNo: "0", revDate: "",
    vendorCode: "VND-0014", vendorName: "STAR INDUSTRIES",
    vendorGSTStatus: "Regular", vendorState: "Gujarat",
    vendorGSTNo: "24AAACS1234A1ZX", vendorARNNo: "",
    currency: "INR", exRate: "1",
    buyerCode: "EDP-001", buyer: "Prakash Mehta",
    contactPerson: "Mr. Satish Chaudhary",
    qtnNo: "QT-2526/001", qtnDate: "2026-01-20",
    refSONo: "", reference: "PR/25-26/0001",
    poCategory: "Raw Material", budgetCode: "BDG-RM-2526",
    items: [
      { id: "pi1", itemCode: "RM-0042", description: "MS Flat Bar 40x6mm IS2062 E250 Grade", pQty: "500", pUoM: "KGS", sQty: "", sUoM: "KGS", rate: "72.50", discType: "%", discValue: "2", remark: "As per IS2062 E250 spec", vendorItemCode: "MSF-40X6", drawingNo: "", revNo: "0", hsnSACNo: "72082700", gstPct: "18" },
      { id: "pi2", itemCode: "RM-0071", description: "MS Round Bar Ø25mm IS2062",            pQty: "250", pUoM: "KGS", sQty: "", sUoM: "KGS", rate: "58.00", discType: "",  discValue: "",  remark: "IS 2062 E250 Grade",   vendorItemCode: "MSRB-25",  drawingNo: "", revNo: "0", hsnSACNo: "72141000", gstPct: "18" },
    ],
    delivery: [
      { itemCode: "RM-0042", description: "MS Flat Bar 40x6mm IS2062 E250 Grade", pQty: "500", pUoM: "KGS", deliveryPQty: "500", deliveryDate: "2026-03-01", lastCommittedDate: "" },
      { itemCode: "RM-0071", description: "MS Round Bar Ø25mm IS2062",            pQty: "250", pUoM: "KGS", deliveryPQty: "250", deliveryDate: "2026-03-01", lastCommittedDate: "" },
    ],
    terms: [
      { id: "tm1", term: "Payment",  description: "Payment within 30 days from invoice date.", termType: "Payment"  },
      { id: "tm2", term: "Delivery", description: "Delivery at our works. Transportation charges on vendor account.", termType: "Delivery" },
    ],
    milestones: [
      { id: "ml1", milestone: "Advance", type: "%", typeValue: "30", milestoneValue: "" },
    ],
    incoTerms: "EXW",
    specialTerms: "All material to be supplied as per IS specifications. Mill test certificate is mandatory.",
    remark: "Urgent requirement for production.", revisionRemark: "", cancellationRemark: "",
    preparedBy: "Prakash Mehta", preparedDt: "2026-02-10",
    authBy: "", authDt: "", cancelBy: "", cancelDt: "",
    checkedBy: "", checkedDt: "",
    history: [
      { docNo: "PO/25-26/0001", docDate: "2026-02-10", unit: "VATVA PLANT", docType: "PO", docStatus: "Open", reference: "PR/25-26/0001", basicValue: 50750, discountValue: 725, taxValue: 9004.5, totalValue: 59029.5, currency: "INR", preparedBy: "Prakash Mehta", preparedDt: "2026-02-10", authBy: "", authDt: "", cancelBy: "", cancelDt: "" },
    ],
    attachments: [],
    createdAt: "2026-02-10T09:00:00Z", updatedAt: "2026-02-10T09:00:00Z",
    createdBy: "Prakash Mehta", updatedBy: "Prakash Mehta",
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.series)            e.series    = "Series is required";
  if (!form.unit)              e.unit      = "Unit is required";
  if (!form.poType)            e.poType    = "PO Type is required";
  if (!form.vendorCode)        e.vendorCode = "Vendor is required";
  if (!form.buyer)             e.buyer     = "Buyer is required";
  if (form.items.length === 0) e.items     = "At least one item line must be added before saving.";

  form.items.forEach((item, i) => {
    if (!item.itemCode?.trim())                                             e[`ic_${i}`]   = "Item Code is required";
    if (!parseFloat(item.pQty) || parseFloat(item.pQty) <= 0)              e[`qty_${i}`]  = "Quantity must be greater than zero";
    if (!parseFloat(item.rate) || parseFloat(item.rate) <= 0)              e[`rate_${i}`] = "Rate must be greater than zero";
    if (!item.hsnSACNo?.trim())                                             e[`hsn_${i}`]  = "HSN/SAC No is required";
    if (item.gstPct === undefined || item.gstPct === null || item.gstPct === "") e[`gst_${i}`]  = "GST % is required";
  });

  form.delivery.forEach((dl, i) => {
    if (!dl.deliveryDate)                                                                e[`dldate_${i}`] = "Delivery date is required";
    if (dl.deliveryDate && form.date && dl.deliveryDate < form.date)                    e[`dldate_${i}`] = "Delivery date cannot be before PO date";
    if (!parseFloat(dl.deliveryPQty) || parseFloat(dl.deliveryPQty) <= 0)              e[`dlqty_${i}`]  = "Delivery qty must be greater than zero";
  });

  form.terms.forEach((t, i) => {
    if (!t.term?.trim())        e[`term_${i}`]     = "Term is required";
    if (!t.description?.trim()) e[`termdesc_${i}`] = "Description is required";
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
  ${error   ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-blue-400"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

function TInput({ value, onChange, disabled, placeholder, type = "text", error, min, rows }) {
  const cls = inputCls(disabled, error);
  if (rows) return <textarea value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} rows={rows} className={cls} />;
  return <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} min={min} className={cls} />;
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
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border
      ${isErr ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
      {toast.msg}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PurchaseOrderList() {
  const [mode,          setMode]          = useState("new");
  const [form,          setForm]          = useState(emptyForm());
  const [errors,        setErrors]        = useState({});
  const [activeTab,     setActiveTab]     = useState("items");
  const [toast,         setToast]         = useState(null);
  const [showAttach,    setShowAttach]    = useState(false);
  const [showList,      setShowList]      = useState(false);
  const [showSearch,    setShowSearch]    = useState(false);
  const [searchQ,       setSearchQ]       = useState("");
  const [allPOs,        setAllPOs]        = useState([]);
  const [currentIdx,    setCurrentIdx]    = useState(-1);
  const [commonDelDate, setCommonDelDate] = useState("");
  const [commonDelDays, setCommonDelDays] = useState("");
  const [deliveryAddr,  setDeliveryAddr]  = useState("");
  const [taxRows,       setTaxRows]       = useState([]);
  const [summary,       setSummary]       = useState({ basicValue: 0, discountValue: 0, taxableAmt: 0, taxValue: 0, roundOff: 0, totalPOValue: 0 });
  const [poLevelDisc,   setPoLevelDisc]   = useState("");
  const [selectedPRNos, setSelectedPRNos] = useState([]);   // PR numbers added to the lookup
  const [checkedItems,  setCheckedItems]  = useState(new Set()); // "prId|itemIdx" keys
  const [prItemQtys,    setPrItemQtys]    = useState({});        // "prId|itemIdx" -> PO qty override
  const [taxGroup,      setTaxGroup]      = useState("");
  const [termsTemplate, setTermsTemplate] = useState("");
  const [searchYear,    setSearchYear]    = useState("all");
  const [searchSeries,  setSearchSeries]  = useState("all");
  const [searchCat,     setSearchCat]     = useState("all");

  const fileRef = useRef(null);
  const isReadOnly   = mode === "view";
  const isAuthorized = form.authorized;

  // ── Load on mount ──
  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem("purchase_orders") || "[]");
    if (stored.length === 0) {
      localStorage.setItem("purchase_orders", JSON.stringify(SEED_POS));
      stored = SEED_POS;
    }
    setAllPOs(stored);
    setForm(stored[stored.length - 1]);
    setCurrentIdx(stored.length - 1);
    setMode("view");
  }, []);

  // ── Live tax + summary recompute ──
  useEffect(() => {
    const vState  = form.vendorState || "";
    const uState  = UNIT_STATE[form.unit] || "";
    const rows    = computeTaxRows(form.items || [], vState, uState);
    setTaxRows(rows);
    const taxVal      = rows.reduce((s, r) => s + r.taxValue, 0);
    const basicValue  = (form.items || []).reduce((s, it) => s + (parseFloat(it.rate) || 0) * (parseFloat(it.pQty) || 0), 0);
    const discValue   = (form.items || []).reduce((s, it) => s + calcLineDiscount(it), 0) + (parseFloat(poLevelDisc) || 0);
    const taxableAmt  = basicValue - discValue;
    const rawTotal    = taxableAmt + taxVal;
    const roundOff    = Math.round(rawTotal) - rawTotal;
    const totalPOValue = rawTotal + roundOff;
    setSummary({ basicValue, discountValue: discValue, taxableAmt, taxValue: taxVal, roundOff, totalPOValue });
  }, [form.items, form.vendorState, form.unit, poLevelDisc]);

  const reloadList = () => {
    const s = JSON.parse(localStorage.getItem("purchase_orders") || "[]");
    setAllPOs(s); return s;
  };

  const goTo = (idx) => {
    const list = JSON.parse(localStorage.getItem("purchase_orders") || "[]");
    if (idx < 0 || idx >= list.length) return;
    setForm(list[idx]); setCurrentIdx(idx); setMode("view"); setErrors({});
    setShowList(false); setShowSearch(false); setActiveTab("items"); setPoLevelDisc("");
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setField = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => { const e = { ...p }; delete e[key]; return e; });
  };

  // ── Vendor auto-fill ──
  const handleVendorSelect = (code) => {
    const vm = VENDOR_MASTER.find((v) => v.code === code);
    if (vm) {
      setForm((p) => ({
        ...p,
        vendorCode:      vm.code,
        vendorName:      vm.name,
        vendorGSTStatus: vm.gstStatus,
        vendorState:     vm.state,
        vendorGSTNo:     vm.gstNo,
        vendorARNNo:     vm.arnNo,
        currency:        vm.currency,
        contactPerson:   vm.contact,
      }));
    } else {
      setField("vendorCode", code);
    }
    if (errors.vendorCode) setErrors((p) => { const e = { ...p }; delete e.vendorCode; return e; });
  };

  // ── Items ──
  const addItem = () => {
    setForm((p) => ({ ...p, items: [...p.items, emptyItem()] }));
    if (errors.items) setErrors((p) => { const e = { ...p }; delete e.items; return e; });
  };

  const updItem = (i, k, v) => {
    setForm((p) => {
      const items = [...p.items];
      items[i] = { ...items[i], [k]: v };
      return { ...p, items };
    });
  };

  const delItem = (i) => {
    if (!window.confirm("Remove this item line?")) return;
    setForm((p) => ({ ...p, items: p.items.filter((_, x) => x !== i) }));
  };

  // ── Delivery ──
  const syncDelivery = () => {
    setForm((p) => {
      const existing = p.delivery || [];
      const newDel = p.items.map((it) => {
        const found = existing.find((d) => d.itemCode === it.itemCode);
        return found
          ? { ...found, description: it.description, pQty: it.pQty, pUoM: it.pUoM }
          : { itemCode: it.itemCode, description: it.description, pQty: it.pQty, pUoM: it.pUoM, deliveryPQty: it.pQty, deliveryDate: "", lastCommittedDate: "" };
      });
      return { ...p, delivery: newDel };
    });
    showToast("Delivery schedule refreshed from items.");
  };

  const updDelivery = (i, k, v) => {
    setForm((p) => {
      const delivery = [...(p.delivery || [])];
      delivery[i] = { ...delivery[i], [k]: v };
      return { ...p, delivery };
    });
  };

  const applyCommonDate = () => {
    if (!commonDelDate) return;
    setForm((p) => ({
      ...p,
      delivery: (p.delivery || []).map((d) => ({ ...d, deliveryDate: commonDelDate })),
    }));
    showToast("Common delivery date applied to all lines.");
  };

  const applyDaysFromPO = () => {
    if (!commonDelDays || !form.date) return;
    const dt = new Date(form.date);
    dt.setDate(dt.getDate() + parseInt(commonDelDays, 10));
    const iso = dt.toISOString().split("T")[0];
    setForm((p) => ({
      ...p,
      delivery: (p.delivery || []).map((d) => ({ ...d, deliveryDate: iso })),
    }));
    showToast(`Delivery date set to ${iso} for all lines.`);
  };

  // ── Terms ──
  const addTerm  = () => setForm((p) => ({ ...p, terms: [...p.terms, emptyTerm()] }));
  const updTerm  = (i, k, v) => setForm((p) => { const terms = [...p.terms]; terms[i] = { ...terms[i], [k]: v }; return { ...p, terms }; });
  const delTerm  = (i) => { if (!window.confirm("Remove this term?")) return; setForm((p) => ({ ...p, terms: p.terms.filter((_, x) => x !== i) })); };

  // ── Milestones ──
  const addMilestone = () => setForm((p) => ({ ...p, milestones: [...p.milestones, emptyMilestone()] }));
  const updMilestone = (i, k, v) => setForm((p) => { const milestones = [...p.milestones]; milestones[i] = { ...milestones[i], [k]: v }; return { ...p, milestones }; });
  const delMilestone = (i) => { if (!window.confirm("Remove this milestone?")) return; setForm((p) => ({ ...p, milestones: p.milestones.filter((_, x) => x !== i) })); };

  // ── PR Reference helpers ──
  const addPRNo = (number) => {
    if (!number || selectedPRNos.includes(number)) return;
    setSelectedPRNos((p) => [...p, number]);
  };

  const removePRNo = (number) => {
    setSelectedPRNos((p) => p.filter((n) => n !== number));
    setCheckedItems((prev) => {
      const prs = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
      const pr  = prs.find((p) => p.number === number);
      if (!pr) return prev;
      const next = new Set(prev);
      (pr.items || []).forEach((_, idx) => next.delete(`${pr.id}|${idx}`));
      return next;
    });
  };

  const toggleItem = (key) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAllItems = (rows, allChecked) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      rows.forEach(({ key }) => allChecked ? next.delete(key) : next.add(key));
      return next;
    });
  };

  const handleCopyToPO = () => {
    if (checkedItems.size === 0) { showToast("Select at least one item line to copy.", "error"); return; }
    if (isAuthorized)            { showToast("This PO is Authorised and cannot be edited.", "error"); return; }

    // Auto-switch to edit/new if currently viewing
    if (mode === "view") setMode("edit");

    const prs = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
    const newLines = [];
    prs.forEach((pr) => {
      if (!selectedPRNos.includes(pr.number)) return;
      (pr.items || []).forEach((it, idx) => {
        if (!checkedItems.has(`${pr.id}|${idx}`)) return;
        newLines.push({
          id: uid(),
          itemCode:      it.itemCode     || "",
          description:   it.description  || "",
          pQty:          prItemQtys[`${pr.id}|${idx}`] || it.qty || "",
          pUoM:          it.uom          || "",
          sQty: "", sUoM: "KGS",
          rate:          it.budgetaryRate || "",
          discType: "", discValue: "",
          remark:        it.remark       || "",
          vendorItemCode: it.preferredVendor ? "" : "",
          drawingNo: "", revNo: "0",
          hsnSACNo: "", gstPct: "18",
        });
      });
    });
    if (newLines.length === 0) { showToast("No matching items found. Make sure the PR is saved.", "error"); return; }
    setForm((p) => ({ ...p, items: [...p.items, ...newLines] }));
    setCheckedItems(new Set());
    showToast(`${newLines.length} item(s) copied to PO Item Details.`);
    setActiveTab("items");
  };

  // ── Save ──
  const handleSave = () => {
    if (isAuthorized) { showToast("This PO is Authorised and cannot be edited.", "error"); return; }
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (Object.keys(errs).some((k) => k.startsWith("ic_") || k.startsWith("qty_") || k.startsWith("rate_") || k.startsWith("hsn_") || k.startsWith("gst_") || k === "items")) setActiveTab("items");
      else if (Object.keys(errs).some((k) => k.startsWith("dldate") || k.startsWith("dlqty"))) setActiveTab("delivery");
      else if (Object.keys(errs).some((k) => k.startsWith("term"))) setActiveTab("terms");
      showToast("Please correct the highlighted fields and try again.", "error");
      return;
    }

    const all   = JSON.parse(localStorage.getItem("purchase_orders") || "[]");
    const now   = new Date().toISOString();
    const user  = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const uname = user.name || user.fullName || "System";

    // Build history entry
    const vState  = form.vendorState || "";
    const uState  = UNIT_STATE[form.unit] || "";
    const savedTaxRows = computeTaxRows(form.items, vState, uState);
    const taxVal  = savedTaxRows.reduce((s, r) => s + r.taxValue, 0);
    const basicVal = form.items.reduce((s, it) => s + (parseFloat(it.rate) || 0) * (parseFloat(it.pQty) || 0), 0);
    const discVal  = form.items.reduce((s, it) => s + calcLineDiscount(it), 0) + (parseFloat(poLevelDisc) || 0);
    const totalVal = basicVal - discVal + taxVal;

    const histEntry = {
      docNo: form.number || "Draft", docDate: form.date, unit: form.unit,
      docType: form.series, docStatus: form.status, reference: form.reference,
      basicValue: basicVal, discountValue: discVal, taxValue: taxVal, totalValue: totalVal,
      currency: form.currency, preparedBy: form.preparedBy, preparedDt: form.preparedDt,
      authBy: form.authBy, authDt: form.authDt, cancelBy: form.cancelBy, cancelDt: form.cancelDt,
    };

    let saved;
    if (!form.id) {
      const number = nextPONumber(form.series, all);
      saved = {
        ...form, id: uid(), number,
        preparedBy: uname, preparedDt: todayISO(),
        history: [{ ...histEntry, docNo: number }],
        createdAt: now, updatedAt: now, createdBy: uname, updatedBy: uname,
      };
      all.push(saved);
    } else {
      const history = [...(form.history || []), histEntry];
      saved = { ...form, history, updatedAt: now, updatedBy: uname };
      const idx = all.findIndex((p) => p.id === form.id);
      if (idx !== -1) all[idx] = saved; else all.push(saved);
    }

    localStorage.setItem("purchase_orders", JSON.stringify(all));
    const updated = reloadList();
    const ni = updated.findIndex((p) => p.id === saved.id);
    setForm(saved); setCurrentIdx(ni !== -1 ? ni : updated.length - 1);
    setMode("view"); setErrors({});
    showToast(`Purchase Order ${saved.number} saved successfully.`);
  };

  // ── Cancel ──
  const handleCancel = () => {
    if (mode === "new") {
      if (form.items.length > 0 || form.unit || form.vendorCode) {
        if (!window.confirm("Discard all unsaved changes?")) return;
      }
      const list = JSON.parse(localStorage.getItem("purchase_orders") || "[]");
      if (list.length > 0) {
        const idx = currentIdx >= 0 ? Math.min(currentIdx, list.length - 1) : list.length - 1;
        setForm(list[idx]); setCurrentIdx(idx); setMode("view");
      } else {
        setForm(emptyForm()); setMode("view");
      }
      setErrors({}); return;
    }
    if (mode === "edit") {
      const all   = JSON.parse(localStorage.getItem("purchase_orders") || "[]");
      const saved = all.find((p) => p.id === form.id);
      if (saved) setForm(saved);
      setMode("view"); setErrors({});
    }
  };

  const handleEdit = () => {
    if (isAuthorized) { showToast("This PO is Authorised and cannot be edited.", "error"); return; }
    setMode("edit");
  };

  const handlePrint = () => {
    if (!form.number) { showToast("Please save the PO before printing.", "error"); return; }
    window.print();
  };

  const handleEmail = () => {
    if (!form.number) { showToast("Please save the PO before emailing.", "error"); return; }
    showToast("PO emailed to vendor.");
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

  // ── Check By ──
  const handleCheckBy = () => {
    const user  = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const uname = user.name || user.fullName || "System";
    setForm((p) => ({ ...p, checkedBy: uname, checkedDt: todayISO() }));
    showToast("PO marked as checked.");
  };

  // ── Search filter ──
  const filteredPOs = allPOs.filter((po) => {
    const q = searchQ.toLowerCase().trim();
    const matchText = !q || (
      po.number?.toLowerCase().includes(q) ||
      po.vendorName?.toLowerCase().includes(q) ||
      po.status?.toLowerCase().includes(q) ||
      po.buyer?.toLowerCase().includes(q) ||
      po.unit?.toLowerCase().includes(q)
    );
    const matchYear   = searchYear   === "all" || po.year        === searchYear;
    const matchSeries = searchSeries === "all" || po.series      === searchSeries;
    const matchCat    = searchCat    === "all" || po.poCategory   === searchCat;
    return matchText && matchYear && matchSeries && matchCat;
  });

  // ── Error badge helpers ──
  const hasItemErr     = Object.keys(errors).some((k) => k.startsWith("ic_") || k.startsWith("qty_") || k.startsWith("rate_") || k.startsWith("hsn_") || k.startsWith("gst_") || k === "items");
  const hasDeliveryErr = Object.keys(errors).some((k) => k.startsWith("dldate") || k.startsWith("dlqty"));
  const hasTermErr     = Object.keys(errors).some((k) => k.startsWith("term"));

  // ── Milestone total check ──
  const milestoneTotalAmt = (form.milestones || []).reduce((s, m) => s + computeMilestoneValue(m, summary.totalPOValue), 0);
  const milestoneMismatch = form.milestones?.length > 0 && Math.abs(milestoneTotalAmt - summary.totalPOValue) > 0.01;

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Purchase</span>
          <ChevronRight size={12} />
          <span>Transaction</span>
          <ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Purchase Order</span>
          {form.number && (
            <>
              <ChevronRight size={12} />
              <span className="text-blue-600 font-medium">{form.number}</span>
            </>
          )}
        </div>

        <Toast toast={toast} />

        {/* ── Action Toolbar ── */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">

          {(mode === "new" || mode === "edit") && (
            <>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                <Save size={13} /> Save
              </button>
              <button onClick={handleCancel}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium">
                <X size={13} /> Cancel
              </button>
            </>
          )}

          {mode === "view" && (
            <>
              <button onClick={handleEdit}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium">
                <Edit2 size={13} /> Edit
              </button>
              <button
                onClick={() => {
                  setForm(emptyForm()); setCurrentIdx(-1); setMode("new");
                  setErrors({}); setActiveTab("items"); setShowList(false); setPoLevelDisc("");
                }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"
              >
                <Plus size={13} /> New PO
              </button>
            </>
          )}

          <div className="w-px h-5 bg-gray-200" />

          <button onClick={() => setShowSearch((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors
              ${showSearch ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Search size={13} /> Search
          </button>

          <button onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Printer size={13} /> Print Preview
          </button>

          <button onClick={handleEmail}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Mail size={13} /> Email PO
          </button>

          <button
            onClick={() => {
              const s = reloadList();
              if (currentIdx >= 0 && currentIdx < s.length) {
                setForm(s[currentIdx]);
                showToast("Refreshed from saved data.");
              }
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <RefreshCw size={13} /> Refresh
          </button>

          <button onClick={() => showToast("Follow Up recorded.")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Clock size={13} /> Follow Up
          </button>

          <button onClick={handleCheckBy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <CheckSquare size={13} /> Check By
          </button>

          <button
            onClick={() => {
              showToast("PO tracking — delivery schedule shown in Delivery Schedule tab.");
              setActiveTab("delivery");
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <TrendingUp size={13} /> Track PO
          </button>

          <button onClick={() => setShowAttach((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors
              ${showAttach ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Paperclip size={13} /> File Attachments
            {(form.attachments?.length > 0) && (
              <span className="bg-blue-100 text-blue-600 text-xs px-1.5 rounded-full">{form.attachments.length}</span>
            )}
          </button>

          <button onClick={() => showToast("Format — select print template before printing.")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <FileText size={13} /> Format
          </button>

          <button
            onClick={() => {
              if (mode !== "view" && (form.items.length > 0 || form.vendorCode)) {
                if (!window.confirm("Exit without saving? Unsaved changes will be lost.")) return;
              }
              window.history.back();
            }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <X size={13} /> Exit
          </button>

          <div className="w-px h-5 bg-gray-200" />

          <div className="flex items-center gap-1">
            <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx <= 0 || mode !== "view"} title="Previous PO"
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx >= allPOs.length - 1 || mode !== "view"} title="Next PO"
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={13} />
            </button>
            <button onClick={() => setShowList((v) => !v)} title="All POs"
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded font-medium transition-colors
                ${showList ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
              <List size={13} />
              {allPOs.length > 0 && (
                <span className="text-gray-400">{currentIdx >= 0 ? `${currentIdx + 1} / ${allPOs.length}` : allPOs.length}</span>
              )}
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
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Paperclip size={14} /> File Attachments
              </h3>
              {!isReadOnly && (
                <>
                  <button onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded">
                    <Upload size={13} /> Upload File
                  </button>
                  <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileChange} />
                </>
              )}
            </div>
            {(!form.attachments || form.attachments.length === 0)
              ? <p className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
                  No attachments yet.{!isReadOnly && " Click Upload File to add drawings, specs, or approvals."}
                </p>
              : (
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
              )
            }
          </div>
        )}

        {/* ── Search Panel ── */}
        {showSearch && (
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Search size={13} /> Search Purchase Orders
                <span className="text-gray-400 font-normal normal-case">({filteredPOs.length} results)</span>
              </h3>
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100 space-y-2">
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search by PO number, vendor, status, buyer, unit…"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
              <div className="flex items-center gap-2 flex-wrap">
                <select value={searchYear} onChange={(e) => setSearchYear(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="all">All Years</option>
                  {[...new Set(allPOs.map(p => p.year).filter(Boolean))].sort().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={searchSeries} onChange={(e) => setSearchSeries(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="all">All Series</option>
                  {SERIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={searchCat} onChange={(e) => setSearchCat(e.target.value)}
                  className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="all">All Categories</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={() => { setSearchQ(""); setSearchYear("all"); setSearchSeries("all"); setSearchCat("all"); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PO Number","Date","Vendor","Unit","Buyer","Total Value","Status",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.map((po) => {
                    const idx = allPOs.findIndex((p) => p.id === po.id);
                    return (
                      <tr key={po.id} onClick={() => { goTo(idx); setShowSearch(false); setSearchQ(""); }}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/40 ${idx === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                        <td className="px-3 py-2 font-mono font-semibold text-blue-600">{po.number}</td>
                        <td className="px-3 py-2 text-gray-600">{po.date ? new Date(po.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{po.vendorName || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{po.unit || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{po.buyer || "—"}</td>
                        <td className="px-3 py-2 text-right font-mono text-gray-700">{fmtAmt(po.history?.[po.history.length-1]?.totalValue || 0)}</td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full">{po.status}</span>
                        </td>
                        <td className="px-3 py-2 text-blue-500 font-medium">Open →</td>
                      </tr>
                    );
                  })}
                  {filteredPOs.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No records found.</td></tr>
                  )}
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
                <List size={13} /> All Purchase Orders
                <span className="text-gray-400 font-normal normal-case">({allPOs.length} records)</span>
              </h3>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PO Number","Date","Vendor","Unit","Buyer","Series","Total Value","Status",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPOs.map((po, i) => (
                    <tr key={po.id} onClick={() => goTo(i)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/40 ${i === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                      <td className="px-3 py-2 font-mono font-semibold text-blue-600">{po.number}</td>
                      <td className="px-3 py-2 text-gray-600">{po.date ? new Date(po.date).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{po.vendorName || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{po.unit || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{po.buyer || "—"}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">{po.series}</span>
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-gray-700">{fmtAmt(po.history?.[po.history.length-1]?.totalValue || 0)}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full">{po.status}</span>
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
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 rounded px-4 py-3 flex items-center gap-2 flex-wrap text-white shadow-sm">
          <FileText size={16} className="text-blue-200 shrink-0" />
          <span className="font-bold text-base tracking-wide">{form.number || "New Purchase Order"}</span>
          {form.unit       && <span className="text-blue-200 text-sm hidden sm:inline">| {form.unit}</span>}
          {form.vendorName && <span className="text-blue-200 text-sm hidden sm:inline">| {form.vendorName}</span>}
          <div className="ml-auto flex items-center gap-2">
            {form.authorized && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <Lock size={10} /> Authorised
              </span>
            )}
            {form.highPriority && (
              <span className="bg-red-400/30 text-red-100 border border-red-300/30 px-2 py-0.5 rounded text-xs font-medium">
                High Priority
              </span>
            )}
            {(mode === "new" || mode === "edit") && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                {mode === "new" ? "New Record" : "Editing"}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border
              ${form.status === "Open"   ? "bg-green-400/20 text-green-100 border-green-300/30"  :
                form.status === "Closed" ? "bg-red-400/20   text-red-100   border-red-300/30"    :
                                           "bg-gray-400/20  text-gray-100  border-gray-300/30"}`}>
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
                <TInput value={form.year} disabled />
              </Field>
              <Field label="Series" required error={errors.series}>
                <TSelect value={form.series} onChange={(e) => setField("series", e.target.value)}
                  disabled={isReadOnly || !!form.id} options={SERIES_OPTIONS} error={errors.series} />
              </Field>
              <Field label="Number" required>
                <TInput value={form.number} disabled placeholder="Auto-generated on Save" />
              </Field>
              <Field label="Date" required>
                <TInput type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} disabled={isReadOnly} />
              </Field>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Field label="Unit" required error={errors.unit}>
                <TSelect value={form.unit} onChange={(e) => setField("unit", e.target.value)}
                  disabled={isReadOnly} options={UNIT_OPTIONS} placeholder="— Select Unit —" error={errors.unit} />
              </Field>
              <Field label="PO Type" required error={errors.poType}>
                <TSelect value={form.poType} onChange={(e) => setField("poType", e.target.value)}
                  disabled={isReadOnly} options={PO_TYPE_OPTIONS} placeholder="— Select Type —" error={errors.poType} />
              </Field>
              <Field label="Status">
                <TInput value={form.status} disabled />
              </Field>
              <Field label="Rev No">
                <TInput value={form.revNo} disabled />
              </Field>
              <Field label="Rev Date">
                <TInput type="date" value={form.revDate} disabled />
              </Field>
            </div>

            {/* Row 3 — Vendor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Vendor" required error={errors.vendorCode}>
                <select value={form.vendorCode} onChange={(e) => handleVendorSelect(e.target.value)}
                  disabled={isReadOnly} className={inputCls(isReadOnly, errors.vendorCode)}>
                  <option value="">— Select Vendor —</option>
                  {VENDOR_MASTER.map((v) => (
                    <option key={v.code} value={v.code}>{v.code} — {v.name}</option>
                  ))}
                </select>
                {errors.vendorCode && (
                  <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                    <AlertCircle size={11} />{errors.vendorCode}
                  </p>
                )}
              </Field>
              <Field label="Vendor Name">
                <TInput value={form.vendorName} disabled placeholder="Auto-filled from vendor" />
              </Field>
              <Field label="Currency" required>
                <TSelect value={form.currency} onChange={(e) => setField("currency", e.target.value)}
                  disabled={isReadOnly} options={CURRENCY_OPTIONS} />
              </Field>
              <Field label="Ex Rate">
                <TInput type="number" min="0" value={form.exRate}
                  onChange={(e) => setField("exRate", e.target.value)} disabled={isReadOnly} placeholder="1" />
              </Field>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Buyer Code">
                <TInput value={form.buyerCode} onChange={(e) => setField("buyerCode", e.target.value)}
                  disabled={isReadOnly} placeholder="e.g. EDP-001" />
              </Field>
              <Field label="Buyer" required error={errors.buyer}>
                <TInput value={form.buyer} onChange={(e) => setField("buyer", e.target.value)}
                  disabled={isReadOnly} placeholder="Buyer name" error={errors.buyer} />
              </Field>
              <Field label="Contact Person">
                <TInput value={form.contactPerson} onChange={(e) => setField("contactPerson", e.target.value)}
                  disabled={isReadOnly} placeholder="Vendor contact person" />
              </Field>
              <Field label="Qtn No">
                <TInput value={form.qtnNo} onChange={(e) => setField("qtnNo", e.target.value)}
                  disabled={isReadOnly} placeholder="Quotation number" />
              </Field>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Qtn Date">
                <TInput type="date" value={form.qtnDate}
                  onChange={(e) => setField("qtnDate", e.target.value)} disabled={isReadOnly} />
              </Field>
              <Field label="Ref SO No">
                <TInput value={form.refSONo} onChange={(e) => setField("refSONo", e.target.value)}
                  disabled={isReadOnly} placeholder="Sales Order reference" />
              </Field>
              <Field label="Reference">
                <TInput value={form.reference} onChange={(e) => setField("reference", e.target.value)}
                  disabled={isReadOnly} placeholder="PR number / project code" />
              </Field>
              <Field label="PO Category">
                <TSelect value={form.poCategory} onChange={(e) => setField("poCategory", e.target.value)}
                  disabled={isReadOnly} options={CATEGORY_OPTIONS} placeholder="— Select Category —" />
              </Field>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Budget Code">
                <TInput value={form.budgetCode} onChange={(e) => setField("budgetCode", e.target.value)}
                  disabled={isReadOnly} placeholder="Budget code" />
              </Field>
              <div className="col-span-3 flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" checked={form.highPriority}
                    onChange={(e) => setField("highPriority", e.target.checked)}
                    disabled={isReadOnly} className="rounded" />
                  High Priority
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" checked={form.authorized}
                    onChange={(e) => {
                      const val = e.target.checked;
                      if (val && !window.confirm("Authorising this PO will lock it for editing. Proceed?")) return;
                      setField("authorized", val);
                      if (val) { setField("authBy", "System"); setField("authDt", todayISO()); }
                      else     { setField("authBy", "");       setField("authDt", ""); }
                    }}
                    disabled={isReadOnly} className="rounded" />
                  <Lock size={11} className="text-amber-500" /> Authorised
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer select-none">
                  <input type="checkbox" checked={form.openPOIfReject}
                    onChange={(e) => setField("openPOIfReject", e.target.checked)}
                    disabled={isReadOnly} className="rounded" />
                  Open PO If Reject
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* ── Body Tabs ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {[
              { id: "prref",     label: "PR Reference",        hasErr: false           },
              { id: "items",     label: "PO Item Details",     hasErr: hasItemErr      },
              { id: "delivery",  label: "Delivery Schedule",   hasErr: hasDeliveryErr  },
              { id: "tax",       label: "Tax & Other Charges", hasErr: false           },
              { id: "terms",     label: "Terms & Conditions",  hasErr: hasTermErr      },
              { id: "milestone", label: "Payment Milestone",   hasErr: false           },
              { id: "history",   label: "PO History",          hasErr: false           },
            ].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors
                  ${activeTab === t.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}>
                {t.label}{t.hasErr && <AlertCircle size={12} className="text-red-400" />}
              </button>
            ))}
          </div>

          <div className="p-4">

            {/* ════ TAB: PR REFERENCE ════ */}
            {activeTab === "prref" && (() => {
              const allPRs  = JSON.parse(localStorage.getItem("purchase_requisitions") || "[]");
              const selPRs  = allPRs.filter((pr) => selectedPRNos.includes(pr.number));
              const rows    = selPRs.flatMap((pr) =>
                (pr.items || []).map((it, idx) => ({ key: `${pr.id}|${idx}`, pr, it, idx }))
              );
              const allChecked = rows.length > 0 && rows.every((r) => checkedItems.has(r.key));

              return (
                <div className="space-y-4">

                  {/* PR Number Lookup */}
                  <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Select Purchase Req. No</p>
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue=""
                        onChange={(e) => { addPRNo(e.target.value); e.target.value = ""; }}
                        className="text-sm border border-gray-300 rounded px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[220px]"
                      >
                        <option value="">— Select PR Number —</option>
                        {allPRs
                          .filter((pr) => !selectedPRNos.includes(pr.number))
                          .map((pr) => (
                            <option key={pr.id} value={pr.number}>
                              {pr.number} — {pr.buyer || pr.buyerCode} ({pr.items?.length || 0} items)
                            </option>
                          ))}
                      </select>
                      <span className="text-xs text-gray-400">Select one or more PR numbers to reference</span>
                    </div>

                    {/* Selected PR tags */}
                    {selectedPRNos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedPRNos.map((no) => (
                          <span key={no} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {no}
                            {!isReadOnly && (
                              <button onClick={() => removePRNo(no)} className="text-blue-400 hover:text-blue-700 leading-none">
                                <X size={11} />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Items table */}
                  <div className="border border-gray-200 rounded overflow-x-auto">
                    <table className="w-full text-xs min-w-[860px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-3 py-2 w-8">
                            {rows.length > 0 && (
                              <input type="checkbox" checked={allChecked}
                                onChange={() => toggleAllItems(rows, allChecked)}
                                className="rounded" />
                            )}
                          </th>
                          {["PR No","Doc","Year","Item Code","Item Description","Req Qty","UoM","Pending Qty","PO Qty"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="py-10 text-center text-gray-400 text-sm">
                              {selectedPRNos.length === 0
                                ? "Select a Purchase Requisition number above to view its items."
                                : "No items found in the selected PR(s)."}
                            </td>
                          </tr>
                        ) : (
                          rows.map(({ key, pr, it }) => (
                            <tr key={key}
                              className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/30 ${checkedItems.has(key) ? "bg-blue-50/40" : ""}`}
                              onClick={() => toggleItem(key)}>
                              <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" checked={checkedItems.has(key)}
                                  onChange={() => toggleItem(key)} className="rounded" />
                              </td>
                              <td className="px-3 py-2 text-blue-600 font-mono font-semibold whitespace-nowrap">{pr.number}</td>
                              <td className="px-3 py-2 text-gray-500 font-mono">{pr.series || pr.number?.split('/')[0] || '—'}</td>
                              <td className="px-3 py-2 text-gray-500">{pr.year}</td>
                              <td className="px-3 py-2 text-gray-700 font-mono">{it.itemCode}</td>
                              <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{it.description}</td>
                              <td className="px-3 py-2 text-right text-gray-700 font-mono">{it.qty}</td>
                              <td className="px-3 py-2 text-gray-500">{it.uom}</td>
                              <td className="px-3 py-2 text-right text-gray-500 font-mono">{it.qty}</td>
                              <td className="px-2 py-1" onClick={(e) => e.stopPropagation()}>
                                <input type="number" min="0" max={it.qty}
                                  value={prItemQtys[key] ?? ""}
                                  onChange={(e) => setPrItemQtys(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder={it.qty}
                                  className="w-20 px-1.5 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-right" />
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Copy button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyToPO}
                      disabled={checkedItems.size === 0 || isAuthorized}
                      className="flex items-center gap-1.5 text-xs px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={13} /> Copy to PO Item Detail
                    </button>
                    {checkedItems.size > 0 && (
                      <span className="text-xs text-gray-500">{checkedItems.size} item(s) selected</span>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ════ TAB: PO ITEM DETAILS ════ */}
            {activeTab === "items" && (
              <div className="space-y-3">
                {errors.items && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} />{errors.items}
                  </p>
                )}

                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[1100px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="w-8  px-2 py-2 text-gray-500 font-semibold uppercase tracking-wide text-center">#</th>
                        <th className="w-32 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">Item Code *</th>
                        <th className="     px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">Description *</th>
                        <th className="w-20 px-2 py-2 text-right text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">PQty *</th>
                        <th className="w-20 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">PUoM *</th>
                        <th className="w-20 px-2 py-2 text-right text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">SQty</th>
                        <th className="w-20 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">SUoM</th>
                        <th className="w-24 px-2 py-2 text-right text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">Rate *</th>
                        <th className="w-24 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">Disc Type</th>
                        <th className="w-20 px-2 py-2 text-right text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">Disc Val</th>
                        <th className="w-28 px-2 py-2 text-right text-gray-500 font-semibold uppercase tracking-wide">Total</th>
                        <th className="w-24 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">HSN/SAC *</th>
                        <th className="w-16 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">GST% *</th>
                        <th className="w-28 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">Vendor Item</th>
                        <th className="w-24 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">Drawing No</th>
                        <th className="w-16 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">Rev No</th>
                        <th className="w-28 px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">Remark</th>
                        <th className="w-8  px-2 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20 align-top">
                          <td className="px-2 py-2 text-center text-gray-400 font-mono">{i + 1}</td>

                          <td className="px-1 py-1">
                            <input value={row.itemCode}
                              onChange={(e) => updItem(i, "itemCode", e.target.value)}
                              disabled={isReadOnly} placeholder="Item Code"
                              className={cellCls(errors[`ic_${i}`])} />
                            {errors[`ic_${i}`] && <p className="text-red-500 mt-0.5">{errors[`ic_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1 min-w-[200px]">
                            <input value={row.description}
                              onChange={(e) => updItem(i, "description", e.target.value)}
                              disabled={isReadOnly} placeholder="Item description"
                              className={cellCls(false)} />
                          </td>

                          <td className="px-1 py-1">
                            <input type="number" min="0" value={row.pQty}
                              onChange={(e) => updItem(i, "pQty", e.target.value)}
                              disabled={isReadOnly} placeholder="0"
                              className={`${cellCls(errors[`qty_${i}`])} text-right`} />
                            {errors[`qty_${i}`] && <p className="text-red-500 mt-0.5">{errors[`qty_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <select value={row.pUoM} onChange={(e) => updItem(i, "pUoM", e.target.value)}
                              disabled={isReadOnly} className={cellCls(false)}>
                              <option value="">—</option>
                              {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>

                          <td className="px-1 py-1">
                            <input value={row.sQty || "—"} disabled placeholder="—"
                              className={`${cellCls(false)} text-right bg-gray-50 text-gray-400`} />
                          </td>

                          <td className="px-1 py-1">
                            <select value={row.sUoM} onChange={(e) => updItem(i, "sUoM", e.target.value)}
                              disabled={isReadOnly} className={`${cellCls(false)} bg-gray-50`}>
                              <option value="">—</option>
                              {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>

                          <td className="px-1 py-1">
                            <input type="number" min="0" value={row.rate}
                              onChange={(e) => updItem(i, "rate", e.target.value)}
                              disabled={isReadOnly} placeholder="0.00"
                              className={`${cellCls(errors[`rate_${i}`])} text-right`} />
                            {errors[`rate_${i}`] && <p className="text-red-500 mt-0.5">{errors[`rate_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <select value={row.discType} onChange={(e) => updItem(i, "discType", e.target.value)}
                              disabled={isReadOnly} className={cellCls(false)}>
                              {DISC_TYPE_OPTIONS.map((d) => <option key={d} value={d}>{d || "None"}</option>)}
                            </select>
                          </td>

                          <td className="px-1 py-1">
                            <input type="number" min="0" value={row.discValue}
                              onChange={(e) => updItem(i, "discValue", e.target.value)}
                              disabled={isReadOnly || !row.discType} placeholder="0"
                              className={`${cellCls(false)} text-right`} />
                          </td>

                          <td className="px-2 py-2 text-right font-mono text-gray-800 bg-gray-50/60 font-medium">
                            ₹ {fmtAmt(calcLineTotal(row))}
                          </td>

                          <td className="px-1 py-1">
                            <input value={row.hsnSACNo}
                              onChange={(e) => updItem(i, "hsnSACNo", e.target.value)}
                              disabled={isReadOnly} placeholder="HSN/SAC"
                              className={cellCls(errors[`hsn_${i}`])} />
                            {errors[`hsn_${i}`] && <p className="text-red-500 mt-0.5">{errors[`hsn_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <select value={row.gstPct} onChange={(e) => updItem(i, "gstPct", e.target.value)}
                              disabled={isReadOnly} className={cellCls(errors[`gst_${i}`])}>
                              <option value="">—</option>
                              {GST_OPTIONS.map((g) => <option key={g} value={g}>{g}%</option>)}
                            </select>
                            {errors[`gst_${i}`] && <p className="text-red-500 mt-0.5">{errors[`gst_${i}`]}</p>}
                          </td>

                          <td className="px-1 py-1">
                            <input value={row.vendorItemCode}
                              onChange={(e) => updItem(i, "vendorItemCode", e.target.value)}
                              disabled={isReadOnly} placeholder="Vendor code"
                              className={cellCls(false)} />
                          </td>

                          <td className="px-1 py-1">
                            <input value={row.drawingNo}
                              onChange={(e) => updItem(i, "drawingNo", e.target.value)}
                              disabled={isReadOnly} placeholder="Drawing No"
                              className={cellCls(false)} />
                          </td>

                          <td className="px-1 py-1">
                            <input value={row.revNo}
                              onChange={(e) => updItem(i, "revNo", e.target.value)}
                              disabled={isReadOnly} placeholder="Rev"
                              className={cellCls(false)} />
                          </td>

                          <td className="px-1 py-1">
                            <input value={row.remark}
                              onChange={(e) => updItem(i, "remark", e.target.value)}
                              disabled={isReadOnly} placeholder="Remark"
                              className={cellCls(false)} />
                          </td>

                          <td className="px-2 py-1 text-center">
                            {!isReadOnly && (
                              <button onClick={() => delItem(i)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}

                      {!isReadOnly && (
                        <tr>
                          <td className="px-2 py-1.5 text-center text-gray-300">{form.items.length + 1}</td>
                          <td colSpan={17} className="px-2 py-1.5 text-xs text-gray-300 italic">
                            Click + Add Item to insert a new line
                          </td>
                        </tr>
                      )}
                      {form.items.length === 0 && isReadOnly && (
                        <tr>
                          <td colSpan={18} className="py-8 text-center text-gray-400 text-sm">No items added.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {!isReadOnly && (
                    <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                      <Plus size={13} /> Add Item
                    </button>
                  )}
                  <button onClick={() => showToast("Item GST% details — computed in Tax & Other Charges tab.")}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded font-medium">
                    Item GST%
                  </button>
                  <button
                    onClick={() => {
                      if (!form.vendorCode) { showToast("Please select a vendor first.", "error"); return; }
                      showToast("Latest rate fetched from QC data.");
                    }}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded font-medium">
                    Fetch Latest Rate
                  </button>
                  <button onClick={() => showToast("Detail description window — coming soon.")}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded font-medium">
                    Detail Desc.
                  </button>
                  <button onClick={() => showToast("Stock details — fetch from inventory module.")}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded font-medium">
                    Stock
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <label className="text-xs font-medium text-gray-600 whitespace-nowrap">PO Level Discount:</label>
                  <input type="number" min="0" value={poLevelDisc}
                    onChange={(e) => setPoLevelDisc(e.target.value)}
                    disabled={isReadOnly} placeholder="0.00"
                    className="w-32 px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-right" />
                  <span className="text-xs text-gray-400">Applied at PO level (flat amount in addition to line-item discounts)</span>
                </div>
              </div>
            )}

            {/* ════ TAB: DELIVERY SCHEDULE ════ */}
            {activeTab === "delivery" && (
              <div className="space-y-3">
                {!isReadOnly && (
                  <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded p-3 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-gray-500 font-medium whitespace-nowrap">Common Delivery Date:</label>
                      <input type="date" value={commonDelDate} min={form.date}
                        onChange={(e) => setCommonDelDate(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400" />
                      <button onClick={applyCommonDate}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Apply</button>
                    </div>
                  </div>
                )}

                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Sr","Item Code","Name","PQty","PUoM","Delivery PQty *","Delivery SQty","Delivery Date *","Last Committed Date"].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(form.delivery || []).length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                            {form.items.length === 0
                              ? "Add items in the PO Item Details tab first."
                              : "Delivery schedule will populate automatically from items."}
                          </td>
                        </tr>
                      ) : (
                        (form.delivery || []).map((dl, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/20">
                            <td className="px-2 py-1.5 text-center text-gray-400 font-mono">{i + 1}</td>
                            <td className="px-2 py-1.5 text-gray-500 bg-gray-50/60 font-mono">{dl.itemCode || "—"}</td>
                            <td className="px-2 py-1.5 text-gray-600 bg-gray-50/60">{dl.description || "—"}</td>
                            <td className="px-2 py-1.5 text-right text-gray-500 bg-gray-50/60">{dl.pQty || "—"}</td>
                            <td className="px-2 py-1.5 text-gray-500 bg-gray-50/60">{dl.pUoM || "—"}</td>
                            <td className="px-1 py-1">
                              <input type="number" min="0" value={dl.deliveryPQty}
                                onChange={(e) => updDelivery(i, "deliveryPQty", e.target.value)}
                                disabled={isReadOnly} placeholder="0"
                                className={`${cellCls(errors[`dlqty_${i}`])} text-right`} />
                              {errors[`dlqty_${i}`] && <p className="text-xs text-red-500">{errors[`dlqty_${i}`]}</p>}
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-400 bg-gray-50/60 font-mono text-xs">
                              {dl.deliveryPQty || "—"}
                            </td>
                            <td className="px-1 py-1">
                              <input type="date" value={dl.deliveryDate} min={form.date}
                                onChange={(e) => updDelivery(i, "deliveryDate", e.target.value)}
                                disabled={isReadOnly}
                                className={cellCls(errors[`dldate_${i}`])} />
                              {errors[`dldate_${i}`] && <p className="text-xs text-red-500">{errors[`dldate_${i}`]}</p>}
                            </td>
                            <td className="px-2 py-1.5 text-gray-400 bg-gray-50/60">{dl.lastCommittedDate || "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════ TAB: TAX & OTHER CHARGES ════ */}
            {activeTab === "tax" && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-medium text-gray-600 whitespace-nowrap">Tax Group:</label>
                    <select value={taxGroup} onChange={(e) => setTaxGroup(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 min-w-[160px]">
                      <option value="">— Select Tax Group —</option>
                      {TAX_GROUP_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const vState = form.vendorState || "";
                      const uState = UNIT_STATE[form.unit] || "";
                      const rows = computeTaxRows(form.items, vState, uState);
                      setTaxRows(rows);
                      showToast("Tax rows recomputed from items.");
                    }}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                    <RefreshCw size={13} /> Compute Tax
                  </button>
                  <p className="text-xs text-gray-500">
                    {form.vendorState && UNIT_STATE[form.unit]
                      ? form.vendorState !== UNIT_STATE[form.unit]
                        ? `IGST applicable — Vendor state (${form.vendorState}) differs from Unit state (${UNIT_STATE[form.unit]})`
                        : `CGST + SGST applicable — Vendor state (${form.vendorState}) matches Unit state (${UNIT_STATE[form.unit]})`
                      : "Select vendor and unit to determine tax type."}
                  </p>
                </div>

                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Tax Code","Name","Tax Type","Inc/Exc","Per Val%","Taxable Value","Tax Value","Pay to Vendor","Currency"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {taxRows.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-8 text-center text-gray-400 text-sm">
                            No tax rows. Add items with GST% and click Compute Tax.
                          </td>
                        </tr>
                      ) : (
                        taxRows.map((r, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/20">
                            <td className="px-3 py-2 font-mono text-blue-600">{r.taxCode}</td>
                            <td className="px-3 py-2 text-gray-700">{r.name}</td>
                            <td className="px-3 py-2 text-gray-600">{r.taxType}</td>
                            <td className="px-3 py-2 text-gray-600">{r.incExc}</td>
                            <td className="px-3 py-2 text-right text-gray-600">{r.perVal}%</td>
                            <td className="px-3 py-2 text-right font-mono text-gray-700">{fmtAmt(r.value)}</td>
                            <td className="px-3 py-2 text-right font-mono font-semibold text-gray-800">{fmtAmt(r.taxValue)}</td>
                            <td className="px-3 py-2 text-center">
                              <input type="checkbox" checked={r.payToVendor} readOnly className="rounded" />
                            </td>
                            <td className="px-3 py-2 text-gray-600">{r.currency}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {taxRows.length > 0 && (
                  <div className="flex justify-end text-xs text-gray-600 pt-1">
                    Total Tax Value: <span className="font-bold text-gray-800 font-mono ml-2">{fmtAmt(summary.taxValue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ════ TAB: TERMS & CONDITIONS ════ */}
            {activeTab === "terms" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Terms Template">
                    <div className="flex gap-2">
                      <select value={termsTemplate}
                        onChange={(e) => setTermsTemplate(e.target.value)}
                        disabled={isReadOnly}
                        className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400">
                        <option value="">— Select Template —</option>
                        {TERMS_TEMPLATE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {!isReadOnly && termsTemplate && (
                        <button
                          onClick={() => {
                            const tpl = TERMS_TEMPLATES[termsTemplate] || [];
                            const newTerms = tpl.map(t => ({ ...t, id: uid() }));
                            setForm(p => ({ ...p, terms: newTerms }));
                            showToast(`Applied "${termsTemplate}" template — ${newTerms.length} terms loaded.`);
                          }}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium whitespace-nowrap">
                          <Plus size={12} /> Apply
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Loads predefined terms — replaces existing rows.</p>
                  </Field>
                  <Field label="IncoTerms">
                    <TSelect value={form.incoTerms} onChange={(e) => setField("incoTerms", e.target.value)}
                      disabled={isReadOnly} options={INCOTERMS_OPTIONS} placeholder="— Select IncoTerms —" />
                  </Field>
                </div>



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
                            <input value={row.term}
                              onChange={(e) => updTerm(i, "term", e.target.value)}
                              disabled={isReadOnly} placeholder="e.g. Payment"
                              className={cellCls(errors[`term_${i}`])} />
                            {errors[`term_${i}`] && <p className="text-xs text-red-500">{errors[`term_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.description}
                              onChange={(e) => updTerm(i, "description", e.target.value)}
                              disabled={isReadOnly} placeholder="Full clause text"
                              className={cellCls(errors[`termdesc_${i}`])} />
                            {errors[`termdesc_${i}`] && <p className="text-xs text-red-500">{errors[`termdesc_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1 w-28">
                            <select value={row.termType} onChange={(e) => updTerm(i, "termType", e.target.value)}
                              disabled={isReadOnly} className={cellCls(false)}>
                              <option value="">— Type —</option>
                              {TERM_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-1 text-center w-10">
                            {!isReadOnly && (
                              <button onClick={() => delTerm(i)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {form.terms.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-400 text-sm">No terms added.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <button onClick={addTerm} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={13} /> Add Term
                  </button>
                )}
              </div>
            )}

            {/* ════ TAB: PAYMENT MILESTONE ════ */}
            {activeTab === "milestone" && (
              <div className="space-y-3">
                {milestoneMismatch && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                    <AlertCircle size={13} />
                    Milestone total ({fmtAmt(milestoneTotalAmt)}) does not match Total PO Value ({fmtAmt(summary.totalPOValue)}). Please review.
                  </div>
                )}

                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[700px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Line","Milestone","Type","Type Value","Milestone Value",""].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.milestones.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono w-10">{i + 1}</td>
                          <td className="px-1 py-1">
                            <input value={row.milestone}
                              onChange={(e) => updMilestone(i, "milestone", e.target.value)}
                              disabled={isReadOnly} placeholder="e.g. Advance, On Delivery"
                              className={cellCls(false)} />
                          </td>
                          <td className="px-1 py-1 w-24">
                            <select value={row.type} onChange={(e) => updMilestone(i, "type", e.target.value)}
                              disabled={isReadOnly} className={cellCls(false)}>
                              {MILESTONE_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="px-1 py-1 w-28">
                            <input type="number" min="0" value={row.typeValue}
                              onChange={(e) => updMilestone(i, "typeValue", e.target.value)}
                              disabled={isReadOnly} placeholder="0"
                              className={`${cellCls(false)} text-right`} />
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-gray-800 bg-gray-50/60">
                            {row.type === "Date"
                              ? <span className="text-gray-400 text-xs">(on {row.typeValue || "date"})</span>
                              : fmtAmt(computeMilestoneValue(row, summary.totalPOValue))
                            }
                          </td>
                          <td className="px-2 py-1 text-center w-10">
                            {!isReadOnly && (
                              <button onClick={() => delMilestone(i)}
                                className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {form.milestones.length === 0 && (
                        <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No milestones added.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {!isReadOnly && (
                  <button onClick={addMilestone} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={13} /> Add Milestone
                  </button>
                )}

                {form.milestones.length > 0 && (
                  <div className="flex justify-end text-xs text-gray-600">
                    Milestone Total: <span className="font-bold text-gray-800 font-mono ml-2">{fmtAmt(milestoneTotalAmt)}</span>
                    <span className="mx-3 text-gray-300">|</span>
                    Total PO Value: <span className="font-bold text-gray-800 font-mono ml-2">{fmtAmt(summary.totalPOValue)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ════ TAB: PO HISTORY ════ */}
            {activeTab === "history" && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[1200px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Doc No","Doc Date","Unit","Doc Type","Doc Status","Reference","Basic Value","Disc Value","Tax Value","Total Value","Currency","Prepared By","Prepared Dt","Auth By","Auth Dt","Cancel By","Cancel Dt"].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(form.history || []).length === 0 ? (
                        <tr>
                          <td colSpan={17} className="py-8 text-center text-gray-400 text-sm">
                            No history entries. History is recorded each time the PO is saved.
                          </td>
                        </tr>
                      ) : (
                        (form.history || []).map((h, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-blue-50/20">
                            <td className="px-2 py-2 font-mono text-blue-600 whitespace-nowrap">{h.docNo}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.docDate}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.unit}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.docType}</td>
                            <td className="px-2 py-2">
                              <span className="px-1.5 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full">{h.docStatus}</span>
                            </td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.reference || "—"}</td>
                            <td className="px-2 py-2 text-right font-mono text-gray-700">{fmtAmt(h.basicValue)}</td>
                            <td className="px-2 py-2 text-right font-mono text-gray-600">{fmtAmt(h.discountValue)}</td>
                            <td className="px-2 py-2 text-right font-mono text-gray-600">{fmtAmt(h.taxValue)}</td>
                            <td className="px-2 py-2 text-right font-mono font-bold text-gray-800">{fmtAmt(h.totalValue)}</td>
                            <td className="px-2 py-2 text-gray-600">{h.currency}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.preparedBy || "—"}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.preparedDt || "—"}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.authBy || "—"}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.authDt || "—"}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.cancelBy || "—"}</td>
                            <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{h.cancelDt || "—"}</td>
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

        {/* ── Footer: 3 columns ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Left: Remarks */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Remarks
            </div>
            <div className="p-4 space-y-3">
              <Field label="Remark">
                <TInput value={form.remark} onChange={(e) => setField("remark", e.target.value)}
                  disabled={isReadOnly} placeholder="General remark…" rows={3} />
              </Field>
              <Field label="Revision Remark">
                <TInput value={form.revisionRemark} onChange={(e) => setField("revisionRemark", e.target.value)}
                  disabled={isReadOnly} placeholder="Reason for revision…" rows={2} />
              </Field>
              <Field label="Cancellation Remark">
                <TInput value={form.cancellationRemark} onChange={(e) => setField("cancellationRemark", e.target.value)}
                  disabled={isReadOnly} placeholder="Reason for cancellation…" rows={2} />
              </Field>
            </div>
          </div>

          {/* Middle: Vendor GST + Audit */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Vendor GST Details
            </div>
            <div className="p-4 space-y-2">
              <Field label="Vendor GST Status">
                <TInput value={form.vendorGSTStatus} disabled placeholder="Auto from vendor" />
              </Field>
              <Field label="Vendor State">
                <TInput value={form.vendorState} disabled placeholder="Auto from vendor" />
              </Field>
              <Field label="Vendor GST No">
                <TInput value={form.vendorGSTNo} disabled placeholder="Auto from vendor" />
              </Field>
              <Field label="Vendor ARN No">
                <TInput value={form.vendorARNNo} disabled placeholder="Auto from vendor" />
              </Field>
              <div className="border-t border-gray-100 pt-2 mt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Prepared By"><TInput value={form.preparedBy} disabled /></Field>
                  <Field label="Prepared Dt"><TInput type="date" value={form.preparedDt} disabled /></Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Auth By"><TInput value={form.authBy} disabled /></Field>
                  <Field label="Auth Dt"><TInput type="date" value={form.authDt} disabled /></Field>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Checked By"><TInput value={form.checkedBy} disabled /></Field>
                  <Field label="Checked Dt"><TInput type="date" value={form.checkedDt} disabled /></Field>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              PO Summary
            </div>
            <div className="p-4 space-y-1.5">
              {[
                { label: "Basic Value",           val: summary.basicValue,    neg: false },
                { label: "Discount Value",         val: summary.discountValue, neg: true  },
                { label: "Taxable Value",          val: summary.taxableAmt,   neg: false },
                { label: "Taxes / Other Charges",  val: summary.taxValue,     neg: false },
                { label: "Round Off",              val: summary.roundOff,     neg: false },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between text-xs text-gray-600 py-1 border-b border-gray-100">
                  <span>{s.label}</span>
                  <span className={`font-mono ${s.neg && parseFloat(s.val) > 0 ? "text-red-600" : "text-gray-800"}`}>
                    {s.neg && parseFloat(s.val) > 0 ? "−" : ""}{fmtAmt(s.val)}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between pt-3 border-t-2 border-gray-200 mt-2">
                <span className="text-sm font-bold text-gray-800">Total PO Value</span>
                <span className="text-lg font-bold text-blue-700 font-mono">{fmtAmt(summary.totalPOValue)}</span>
              </div>

              {form.currency && form.currency !== "INR" && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                  <span>In {form.currency} (Ex Rate {form.exRate || 1})</span>
                  <span className="font-mono">{fmtAmt(summary.totalPOValue / (parseFloat(form.exRate) || 1))}</span>
                </div>
              )}

              <div className="pt-3 space-y-1 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Total Items</span>
                  <span className="font-mono font-bold text-gray-700">{form.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Terms</span>
                  <span className="font-mono font-bold text-gray-700">{form.terms.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Milestones</span>
                  <span className="font-mono font-bold text-gray-700">{form.milestones.length}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Error Summary ── */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).slice(0, 6).map((err, i) => <li key={i}>{err}</li>)}
                {Object.keys(errors).length > 6 && <li>…and {Object.keys(errors).length - 6} more error(s)</li>}
              </ul>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 pb-2">
          Fields marked <span className="text-red-400 font-medium">*</span> are mandatory.
          Blue-bordered fields have lookup or auto-generation enabled.
        </p>

      </div>
    </Layout>
  );
}
