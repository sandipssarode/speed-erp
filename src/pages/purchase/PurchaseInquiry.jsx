import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Save, X, Plus, Trash2, FileText, ChevronRight, AlertCircle, CheckCircle,
  Edit2, Upload, XCircle, ChevronLeft, List, Printer, Paperclip, Send,
  Search, Clock, BarChart2, Lock,
} from "lucide-react";

// ─── Master Data ──────────────────────────────────────────────────────────────
const SERIES_OPTIONS        = ["PI-2526", "PI-IMP-2526", "PI-SC-2526"];
const UNIT_OPTIONS          = ["VATVA PLANT", "ANKLESHWAR", "HEAD OFFICE"];
const TYPE_OPTIONS          = ["Regular", "Sub-Contract", "Import", "Others"];
const CATEGORY_OPTIONS      = ["Raw Material", "Packing", "Electrical", "Capital Goods", "Consumables", "Spare Parts", "Services"];
const UOM_OPTIONS           = ["KGS", "MTR", "NOS", "LTR", "SQM", "TON", "SET", "PKT"];
const TERM_TYPE_OPTIONS     = ["Payment", "Delivery", "Legal"];
const FOLLOWUP_METHOD_OPT   = ["Phone", "Email", "Meeting", "WhatsApp", "Other"];
const FOLLOWUP_STATUS_OPT   = ["Active", "Closed", "Pending"];

const VENDOR_MASTER = [
  { code: "VND-0014", name: "STAR INDUSTRIES",       contact: "Mr. Satish Chaudhary", email: "satish@starindustries.in",  phone: "+91 98200 11234", address: "Plot 42, GIDC Vatva",     city: "Ahmedabad", state: "Gujarat",     country: "India", currency: "INR" },
  { code: "VND-0029", name: "PRIME STEEL",           contact: "Ms. Rekha Iyer",       email: "rekha@primesteel.co.in",    phone: "+91 98110 55678", address: "B-12, Industrial Estate", city: "Surat",     state: "Gujarat",     country: "India", currency: "INR" },
  { code: "VND-0037", name: "ADITYA STEEL & ALLOYS", contact: "Mr. Arun Mehta",       email: "arun@adityasteel.in",       phone: "+91 90990 33412", address: "Survey No. 78, MIDC",    city: "Pune",      state: "Maharashtra", country: "India", currency: "INR" },
];

const SEED_PIS = [
  {
    id: "pi1001",
    year: "25-26", series: "PI-2526", number: "PI-2526/0001",
    date: "2026-01-14", unit: "VATVA PLANT", type: "Regular",
    buyerCode: "EDP-001", buyer: "Prakash Mehta",
    category: "Raw Material", soNo: "", expectedQuotationDate: "2026-01-28",
    otherReference: "PR/25-26/0001",
    status: "Open", authorized: false, comparisonDone: false,
    remark: "Please quote for the following items as per IS specifications.",
    items: [
      { id: "it1", prRefNo: "PR/25-26/0001", itemCode: "RM-0042", description: "MS Flat Bar 40x6mm IS2062 E250 Grade", qty: "500", uom: "KGS", expectedDeliveryDate: "2026-02-15", remark: "As per IS2062 E250 spec" },
      { id: "it2", prRefNo: "PR/25-26/0001", itemCode: "RM-0071", description: "MS Round Bar Ø25mm IS2062",            qty: "250", uom: "KGS", expectedDeliveryDate: "2026-02-15", remark: "" },
    ],
    terms: [
      { id: "tm1", term: "Payment",  description: "Payment within 30 days from invoice date.",                                    termType: "Payment"  },
      { id: "tm2", term: "Delivery", description: "Delivery at our works. Transportation charges on vendor account.",             termType: "Delivery" },
    ],
    vendors: [
      { id: "v1", vendorCode: "VND-0014", vendorName: "STAR INDUSTRIES",       contact: "Mr. Satish Chaudhary", phone: "+91 98200 11234", email: "satish@starindustries.in", address: "Plot 42, GIDC Vatva",     city: "Ahmedabad", state: "Gujarat",     country: "India", currency: "INR" },
      { id: "v2", vendorCode: "VND-0029", vendorName: "PRIME STEEL",           contact: "Ms. Rekha Iyer",       phone: "+91 98110 55678", email: "rekha@primesteel.co.in",   address: "B-12, Industrial Estate", city: "Surat",     state: "Gujarat",     country: "India", currency: "INR" },
    ],
    quotations: [
      { id: "q1", quotationNo: "QT-2526/001", quotationDate: "2026-01-20", revisionNo: "0", revisionDate: "", validity: "30", contactPerson: "Mr. Satish Chaudhary", buyerName: "Prakash Mehta", remark: "Rates firm for 30 days."  },
      { id: "q2", quotationNo: "QT-2526/002", quotationDate: "2026-01-22", revisionNo: "0", revisionDate: "", validity: "15", contactPerson: "Ms. Rekha Iyer",       buyerName: "Prakash Mehta", remark: "Lead time 2 weeks."         },
    ],
    followups: [
      { id: "fu1", ref: "FUP/25-26/0001", type: "Purchase Inquiry Followup", status: "Active",  followupFor: "PI-2526/0001", partyType: "Vendor", partyCode: "VND-0014", partyName: "STAR INDUSTRIES", contactPerson: "Mr. Satish Chaudhary", contactEmail: "satish@starindustries.in", contactNo: "+91 98200 11234", ccUser: "", followupByCode: "EDP-001", followupBy: "Prakash Mehta", followupDate: "2026-01-22", time: "10:30", method: "Phone", note: "Confirmed dispatch capability of 300 KG by 10-Feb.", internalNote: "Vendor hinted at 1.5% discount if full PO awarded.", cost: "", nextDate: "2026-01-29", nextTime: "11:00", nextBy: "Prakash Mehta", nextMethod: "Email", nextNote: "Follow up on revised quote." },
      { id: "fu2", ref: "FUP/25-26/0002", type: "Purchase Inquiry Followup", status: "Pending", followupFor: "PI-2526/0001", partyType: "Vendor", partyCode: "VND-0029", partyName: "PRIME STEEL",    contactPerson: "Ms. Rekha Iyer",       contactEmail: "rekha@primesteel.co.in",   contactNo: "+91 98110 55678", ccUser: "", followupByCode: "EDP-001", followupBy: "Prakash Mehta", followupDate: "2026-01-23", time: "14:00", method: "Email", note: "Requested revised quote with GST breakup.",          internalNote: "",                                                 cost: "", nextDate: "",           nextTime: "",       nextBy: "",              nextMethod: "",      nextNote: "" },
    ],
    comparisonNotes: { lastBy: "", lastDate: "", shortNote: "", detailNote: "" },
    attachments: [],
    createdAt: "2026-01-14T09:00:00Z", updatedAt: "2026-01-14T09:00:00Z", createdBy: "Prakash Mehta", updatedBy: "Prakash Mehta",
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function getFinancialYear() {
  const now = new Date(); const yr = now.getFullYear(); const m = now.getMonth() + 1;
  const from = m >= 4 ? yr : yr - 1; const to = m >= 4 ? yr + 1 : yr;
  return `${String(from).slice(2)}-${String(to).slice(2)}`;
}
function todayISO() { return new Date().toISOString().split("T")[0]; }
function nextPINumber(series, allPIs) {
  const count = allPIs.filter((p) => p.series === series).length + 1;
  return `${series}/${String(count).padStart(4, "0")}`;
}
const uid = () => Date.now() + Math.random();
const emptyItem      = () => ({ id: uid(), prRefNo: "", itemCode: "", description: "", qty: "", uom: "", expectedDeliveryDate: "", remark: "" });
const emptyTerm      = () => ({ id: uid(), term: "", description: "", termType: "" });
const emptyVendor    = () => ({ id: uid(), vendorCode: "", vendorName: "", contact: "", phone: "", email: "", address: "", city: "", state: "", country: "", currency: "" });
const emptyQuotation = () => ({ id: uid(), quotationNo: "", quotationDate: "", revisionNo: "0", revisionDate: "", validity: "", contactPerson: "", buyerName: "", remark: "" });
const emptyFollowup  = () => ({ id: uid(), ref: "", type: "Purchase Inquiry Followup", status: "", followupFor: "", partyType: "Vendor", partyCode: "", partyName: "", contactPerson: "", contactEmail: "", contactNo: "", ccUser: "", followupByCode: "", followupBy: "", followupDate: todayISO(), time: "", method: "", note: "", internalNote: "", cost: "", nextDate: "", nextTime: "", nextBy: "", nextMethod: "", nextNote: "" });
function emptyForm() {
  return { id: "", year: getFinancialYear(), series: "PI-2526", number: "", date: todayISO(), unit: "", type: "Regular", buyerCode: "", buyer: "", category: "", soNo: "", expectedQuotationDate: "", otherReference: "", status: "Draft", authorized: false, comparisonDone: false, remark: "", items: [], terms: [], vendors: [], quotations: [], followups: [], comparisonNotes: { lastBy: "", lastDate: "", shortNote: "", detailNote: "" }, attachments: [], createdAt: "", updatedAt: "", createdBy: "", updatedBy: "" };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.series)  e.series = "Series is a required field. Please select a document series before saving.";
  if (!form.date)    e.date   = "Date is a required field.";
  if (!form.unit)    e.unit   = "Unit is a required field. Please select a Business Unit.";
  if (!form.type)    e.type   = "Type is a required field. Please select an Enquiry Type.";
  if (!form.buyer)   e.buyer  = "Buyer is a required field. Please select a Buyer.";
  if (form.items.length === 0) e.items = "At least one Item line must be added before saving.";
  form.items.forEach((it, i) => {
    if (!it.itemCode?.trim())    e[`ic_${i}`]       = "Item Code is required for each line.";
    if (!it.description?.trim()) e[`desc_${i}`]     = "Description is required for each Item line.";
    if (!it.qty || Number(it.qty) <= 0) e[`qty_${i}`] = "Quantity must be a positive number greater than 0.";
    if (!it.uom)                 e[`uom_${i}`]      = "UoM is required for each Item line.";
    if (it.expectedDeliveryDate && it.expectedDeliveryDate < form.date) e[`dd_${i}`] = "Expected Delivery Date cannot be earlier than the PI Date.";
  });
  form.terms.forEach((t, i) => {
    if (!t.term?.trim())        e[`term_${i}`]    = "Term Name is required when adding a Terms & Conditions row.";
    if (!t.description?.trim()) e[`termdesc_${i}`] = "Term Description is required when adding a Terms & Conditions row.";
  });
  form.vendors.forEach((v, i) => {
    if (!v.vendorCode?.trim()) e[`vc_${i}`] = "Vendor Code is required when adding a vendor to the RFQ grid.";
  });
  form.quotations.forEach((q, i) => {
    if (!q.quotationDate)                              e[`qdate_${i}`]      = "Quotation Date is required when recording a vendor quotation.";
    if (q.quotationDate && q.quotationDate < form.date) e[`qdateearly_${i}`] = "Quotation Date cannot be earlier than the PI Date.";
  });
  return e;
}

function validateFollowup(fu) {
  const e = {};
  if (!fu.status)       e.status       = "Followup Status is required.";
  if (!fu.followupBy)   e.followupBy   = "Followup By is required.";
  if (!fu.followupDate) e.followupDate = "Followup Date is required.";
  if (fu.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fu.contactEmail))
    e.contactEmail = "Please enter a valid email address (e.g. name@domain.com).";
  if (fu.nextDate && fu.nextDate < todayISO()) e.nextDate = "Next Followup Date cannot be in the past.";
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
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${isErr ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
      {isErr ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Draft:             "bg-gray-100   text-gray-600   border-gray-300",
    Open:              "bg-green-50   text-green-700  border-green-300",
    "Comparison Done": "bg-blue-50    text-blue-700   border-blue-300",
    Closed:            "bg-red-50     text-red-700    border-red-300",
  };
  return <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${map[status] || map.Draft}`}>{status}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PurchaseInquiry() {
  const navigate = useNavigate();

  const [mode,         setMode]         = useState("new");
  const [form,         setForm]         = useState(emptyForm());
  const [errors,       setErrors]       = useState({});
  const [activeTab,    setActiveTab]    = useState("items");
  const [toast,        setToast]        = useState(null);
  const [showAttach,   setShowAttach]   = useState(false);
  const [showList,     setShowList]     = useState(false);
  const [showSearch,   setShowSearch]   = useState(false);
  const [searchQ,      setSearchQ]      = useState("");
  const [allPIs,       setAllPIs]       = useState([]);
  const [currentIdx,   setCurrentIdx]   = useState(-1);

  const [showFollowup, setShowFollowup] = useState(false);
  const [fuMode,       setFuMode]       = useState("new");
  const [fuForm,       setFuForm]       = useState(emptyFollowup());
  const [fuErrors,     setFuErrors]     = useState({});
  const [fuTab,        setFuTab]        = useState("details");

  const fileRef = useRef(null);
  const isReadOnly   = mode === "view";
  const isAuthorized = form.authorized;

  // ── Load ──
  useEffect(() => {
    let stored = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
    if (stored.length === 0) { localStorage.setItem("purchase_inquiries", JSON.stringify(SEED_PIS)); stored = SEED_PIS; }
    setAllPIs(stored);
    setForm(stored[stored.length - 1]);
    setCurrentIdx(stored.length - 1);
    setMode("view");
  }, []);

  const reloadList = () => {
    const s = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
    setAllPIs(s); return s;
  };

  const goTo = (idx) => {
    const list = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
    if (idx < 0 || idx >= list.length) return;
    setForm(list[idx]); setCurrentIdx(idx); setMode("view"); setErrors({}); setShowList(false); setActiveTab("items");
  };

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField  = (key, val) => { setForm((p) => ({ ...p, [key]: val })); if (errors[key]) setErrors((p) => { const e = { ...p }; delete e[key]; return e; }); };

  // ── Items ──
  const addItem  = () => { setForm((p) => ({ ...p, items: [...p.items, emptyItem()] })); if (errors.items) setErrors((p) => { const e = { ...p }; delete e.items; return e; }); };
  const updItem  = (i, k, v) => setForm((p) => { const items = [...p.items]; items[i] = { ...items[i], [k]: v }; return { ...p, items }; });
  const delItem  = (i) => { if (!window.confirm("Remove this item line?")) return; setForm((p) => ({ ...p, items: p.items.filter((_, x) => x !== i) })); };

  // ── Terms ──
  const addTerm  = () => setForm((p) => ({ ...p, terms: [...p.terms, emptyTerm()] }));
  const updTerm  = (i, k, v) => setForm((p) => { const terms = [...p.terms]; terms[i] = { ...terms[i], [k]: v }; return { ...p, terms }; });
  const delTerm  = (i) => { if (!window.confirm("Remove this term?")) return; setForm((p) => ({ ...p, terms: p.terms.filter((_, x) => x !== i) })); };

  // ── Vendors ──
  const addVendor = () => setForm((p) => ({ ...p, vendors: [...p.vendors, emptyVendor()] }));
  const delVendor = (i) => { if (!window.confirm("Remove this vendor?")) return; setForm((p) => ({ ...p, vendors: p.vendors.filter((_, x) => x !== i) })); };
  const autoFillVendor = (i, code) => {
    const vm = VENDOR_MASTER.find((v) => v.code === code);
    setForm((p) => {
      const vendors = [...p.vendors];
      vendors[i] = vm
        ? { ...vendors[i], vendorCode: vm.code, vendorName: vm.name, contact: vm.contact, phone: vm.phone, email: vm.email, address: vm.address, city: vm.city, state: vm.state, country: vm.country, currency: vm.currency }
        : { ...vendors[i], vendorCode: code };
      return { ...p, vendors };
    });
  };

  // ── Quotations ──
  const addQuotation  = () => setForm((p) => ({ ...p, quotations: [...p.quotations, { ...emptyQuotation(), buyerName: p.buyer, quotationNo: `QT-${p.series}/${String(p.quotations.length + 1).padStart(3, "0")}` }] }));
  const updQuotation  = (i, k, v) => setForm((p) => { const quotations = [...p.quotations]; quotations[i] = { ...quotations[i], [k]: v }; return { ...p, quotations }; });
  const delQuotation  = (i) => { if (!window.confirm("Remove this quotation?")) return; setForm((p) => ({ ...p, quotations: p.quotations.filter((_, x) => x !== i) })); };

  // ── Save ──
  const handleSave = () => {
    if (isAuthorized) { showToast("This PI is Authorised and cannot be edited. Please un-authorise first.", "error"); return; }
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      if (Object.keys(errs).some((k) => k.startsWith("ic_") || k.startsWith("desc_") || k.startsWith("qty_") || k.startsWith("uom_") || k.startsWith("dd_") || k === "items")) setActiveTab("items");
      else if (Object.keys(errs).some((k) => k.startsWith("term"))) setActiveTab("terms");
      else if (Object.keys(errs).some((k) => k.startsWith("vc_"))) setActiveTab("vendors");
      else if (Object.keys(errs).some((k) => k.startsWith("qdate"))) setActiveTab("quotations");
      showToast("Please correct the highlighted fields and try again.", "error"); return;
    }
    const all  = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
    const now  = new Date().toISOString();
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const uname = user.name || user.fullName || "System";
    let saved;
    if (!form.id) {
      const number = nextPINumber(form.series, all);
      saved = { ...form, id: Date.now().toString(), number, status: "Open", createdAt: now, updatedAt: now, createdBy: uname, updatedBy: uname };
      all.push(saved);
    } else {
      saved = { ...form, updatedAt: now, updatedBy: uname };
      const idx = all.findIndex((p) => p.id === form.id);
      if (idx !== -1) all[idx] = saved; else all.push(saved);
    }
    localStorage.setItem("purchase_inquiries", JSON.stringify(all));
    const updated = reloadList();
    const ni = updated.findIndex((p) => p.id === saved.id);
    setForm(saved); setCurrentIdx(ni !== -1 ? ni : updated.length - 1); setMode("view"); setErrors({});
    showToast(`Purchase Inquiry ${saved.number} saved successfully.`);
  };

  const handleCancel = () => {
    if (mode === "new") {
      if (form.items.length > 0 || form.unit || form.buyer) { if (!window.confirm("Discard all unsaved changes?")) return; }
      const list = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
      if (list.length > 0) { const i = currentIdx >= 0 ? Math.min(currentIdx, list.length - 1) : list.length - 1; setForm(list[i]); setCurrentIdx(i); setMode("view"); } else { setForm(emptyForm()); setMode("view"); }
      setErrors({}); return;
    }
    if (mode === "edit") {
      const all = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
      const saved = all.find((p) => p.id === form.id);
      if (saved) setForm(saved);
      setMode("view"); setErrors({});
    }
  };

  const handleEdit = () => {
    if (isAuthorized) { showToast("This PI is Authorised and cannot be edited. Please un-authorise first.", "error"); return; }
    if (form.status === "Closed") { showToast("This Purchase Inquiry is Closed and cannot be edited.", "error"); return; }
    setMode("edit");
  };

  const handleSendToVendors = () => {
    if (!form.number) { showToast("Please save the PI before sending to vendors.", "error"); return; }
    if (form.vendors.length === 0) { showToast("No vendors added to the RFQ grid.", "error"); return; }
    showToast(`RFQ sent to ${form.vendors.length} vendor(s) successfully.`);
  };

  const handlePrint = () => { if (!form.number) { showToast("Please save the PI before printing.", "error"); return; } window.print(); };

  // ── Attachments ──
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const added = files.map((f) => ({ id: uid(), name: f.name, size: f.size, type: f.type }));
    setForm((p) => ({ ...p, attachments: [...(p.attachments || []), ...added] }));
    e.target.value = "";
    showToast(`${files.length} file(s) attached.`);
  };
  const removeAttachment = (id) => setForm((p) => ({ ...p, attachments: (p.attachments || []).filter((a) => a.id !== id) }));

  // ── Followup ──
  const openNewFollowup = () => {
    const fu = emptyFollowup();
    fu.followupFor = form.number;
    fu.ref = `FUP/${form.year}/${String((form.followups?.length || 0) + 1).padStart(4, "0")}`;
    setFuForm(fu); setFuMode("new"); setFuErrors({}); setFuTab("details"); setShowFollowup(true);
  };
  const openEditFollowup = (fu) => { setFuForm({ ...fu }); setFuMode("edit"); setFuErrors({}); setFuTab("details"); setShowFollowup(true); };
  const fuSet = (k, v) => { setFuForm((p) => ({ ...p, [k]: v })); if (fuErrors[k]) setFuErrors((p) => { const e = { ...p }; delete e[k]; return e; }); };

  const handleSaveFollowup = () => {
    const errs = validateFollowup(fuForm);
    if (Object.keys(errs).length > 0) { setFuErrors(errs); showToast("Please correct the followup fields.", "error"); return; }
    const followups = [...(form.followups || [])];
    if (fuMode === "new") followups.push({ ...fuForm, id: Date.now().toString() });
    else { const i = followups.findIndex((f) => f.id === fuForm.id); if (i !== -1) followups[i] = fuForm; }
    setForm((p) => ({ ...p, followups }));
    setShowFollowup(false);
    showToast("Followup saved successfully.");
  };

  // ── Search ──
  const filteredPIs = allPIs.filter((pi) => {
    if (!searchQ.trim()) return true;
    const q = searchQ.toLowerCase();
    return pi.number?.toLowerCase().includes(q) || pi.buyer?.toLowerCase().includes(q) || pi.unit?.toLowerCase().includes(q) || pi.status?.toLowerCase().includes(q) || pi.items?.some((it) => it.itemCode?.toLowerCase().includes(q) || it.description?.toLowerCase().includes(q)) || pi.vendors?.some((v) => v.vendorName?.toLowerCase().includes(q));
  });

  const lastFollowup = form.followups?.length > 0 ? form.followups[form.followups.length - 1] : null;
  const hasItemErr   = Object.keys(errors).some((k) => k.startsWith("ic_") || k.startsWith("desc_") || k.startsWith("qty_") || k.startsWith("uom_") || k.startsWith("dd_") || k === "items");
  const hasTermErr   = Object.keys(errors).some((k) => k.startsWith("term"));
  const hasVendErr   = Object.keys(errors).some((k) => k.startsWith("vc_"));
  const hasQuoteErr  = Object.keys(errors).some((k) => k.startsWith("qdate"));

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Purchase</span><ChevronRight size={12} /><span>Transaction</span><ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Purchase Inquiry</span>
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
              <button onClick={handleEdit} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => { setForm(emptyForm()); setCurrentIdx(-1); setMode("new"); setErrors({}); setActiveTab("items"); setShowList(false); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
                <Plus size={13} /> New PI
              </button>
            </>
          )}

          <div className="w-px h-5 bg-gray-200" />

          <button onClick={handleSendToVendors} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
            <Send size={13} /> Send to Vendors
          </button>

          <button onClick={openNewFollowup} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Clock size={13} /> Follow Up
          </button>

          <button onClick={() => navigate("/purchase/quotation-comparison")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <BarChart2 size={13} /> View Comparison
          </button>

          <button onClick={() => { if (!form.number) { showToast("Please save the PI before printing comparison sheet.", "error"); return; } window.print(); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Printer size={13} /> Print RFQ
          </button>

          <button onClick={() => setShowAttach((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${showAttach ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Paperclip size={13} /> Attachments
            {(form.attachments?.length > 0) && <span className="bg-blue-100 text-blue-600 text-xs px-1.5 rounded-full">{form.attachments.length}</span>}
          </button>

          <button onClick={() => setShowSearch((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${showSearch ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Search size={13} /> Search
          </button>

          <div className="w-px h-5 bg-gray-200" />

          <div className="flex items-center gap-1">
            <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx <= 0 || mode !== "view"} title="Previous PI"
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>
            <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx >= allPIs.length - 1 || mode !== "view"} title="Next PI"
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={13} />
            </button>
            <button onClick={() => setShowList((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded font-medium transition-colors ${showList ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
              <List size={13} />
              {allPIs.length > 0 && <span className="text-gray-400">{currentIdx >= 0 ? `${currentIdx + 1} / ${allPIs.length}` : allPIs.length}</span>}
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
              ? <p className="text-xs text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">No attachments yet.{!isReadOnly && " Click Upload File to add drawings, specs, or PR copies."}</p>
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
                <Search size={13} /> Search Purchase Inquiries <span className="text-gray-400 font-normal normal-case">({filteredPIs.length} results)</span>
              </h3>
              <button onClick={() => setShowSearch(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search by PI number, buyer, vendor, item, status…" className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
            </div>
            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PI Number","Date","Buyer","Unit","Type","Items","Vendors","Status",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPIs.map((pi) => {
                    const idx = allPIs.findIndex((p) => p.id === pi.id);
                    return (
                      <tr key={pi.id} onClick={() => { goTo(idx); setShowSearch(false); setSearchQ(""); }}
                        className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/40 ${idx === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                        <td className="px-3 py-2 font-mono font-semibold text-blue-600">{pi.number}</td>
                        <td className="px-3 py-2 text-gray-600">{pi.date ? new Date(pi.date).toLocaleDateString("en-IN") : "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{pi.buyer || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{pi.unit || "—"}</td>
                        <td className="px-3 py-2 text-gray-600">{pi.type || "—"}</td>
                        <td className="px-3 py-2 text-center">{pi.items?.length || 0}</td>
                        <td className="px-3 py-2 text-center">{pi.vendors?.length || 0}</td>
                        <td className="px-3 py-2"><StatusBadge status={pi.status} /></td>
                        <td className="px-3 py-2 text-blue-500 font-medium">Open →</td>
                      </tr>
                    );
                  })}
                  {filteredPIs.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400 text-sm">No records found.</td></tr>}
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
                <List size={13} /> All Purchase Inquiries <span className="text-gray-400 font-normal normal-case">({allPIs.length} records)</span>
              </h3>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["PI Number","Date","Buyer","Unit","Type","Items","Vendors","Status",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPIs.map((pi, i) => (
                    <tr key={pi.id} onClick={() => goTo(i)}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-blue-50/40 ${i === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                      <td className="px-3 py-2 font-mono font-semibold text-blue-600">{pi.number}</td>
                      <td className="px-3 py-2 text-gray-600">{pi.date ? new Date(pi.date).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pi.buyer || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pi.unit || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{pi.type || "—"}</td>
                      <td className="px-3 py-2 text-center">{pi.items?.length || 0}</td>
                      <td className="px-3 py-2 text-center">{pi.vendors?.length || 0}</td>
                      <td className="px-3 py-2"><StatusBadge status={pi.status} /></td>
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
          <span className="font-bold text-base tracking-wide">{form.number || "New Purchase Inquiry"}</span>
          {form.unit  && <span className="text-blue-200 text-sm">| {form.unit}</span>}
          {form.buyer && <span className="text-blue-200 text-sm">| {form.buyer}</span>}
          <div className="ml-auto flex items-center gap-2">
            {form.authorized && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <Lock size={10} /> Authorised
              </span>
            )}
            {form.comparisonDone && (
              <span className="bg-purple-400/30 text-purple-100 border border-purple-300/30 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1">
                <CheckCircle size={10} /> Comparison Done
              </span>
            )}
            {(mode === "new" || mode === "edit") && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                {mode === "new" ? "New Record" : "Editing"}
              </span>
            )}
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${
              form.status === "Open"              ? "bg-green-400/20 text-green-100 border-green-300/30"  :
              form.status === "Comparison Done"   ? "bg-blue-300/20  text-blue-100  border-blue-300/30"   :
              form.status === "Closed"            ? "bg-red-400/20   text-red-100   border-red-300/30"    :
                                                    "bg-gray-400/20  text-gray-100  border-gray-300/30"}`}>
              {form.status || "Draft"}
            </span>
          </div>
        </div>

        {/* ── Header Details ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Header Details</div>
          <div className="p-4 space-y-3">

            {/* Row 1 */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Year" required>
                <TInput value={form.year} disabled />
              </Field>
              <Field label="Series" required error={errors.series}>
                <TSelect value={form.series} onChange={(e) => setField("series", e.target.value)} disabled={isReadOnly || !!form.id} options={SERIES_OPTIONS} error={errors.series} />
              </Field>
              <Field label="Number" required>
                <TInput value={form.number} disabled placeholder="Auto-generated on Save" />
              </Field>
              <Field label="Date" required error={errors.date}>
                <TInput type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} disabled={isReadOnly} error={errors.date} />
              </Field>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Unit" required error={errors.unit}>
                <TSelect value={form.unit} onChange={(e) => setField("unit", e.target.value)} disabled={isReadOnly} options={UNIT_OPTIONS} placeholder="— Select Unit —" error={errors.unit} />
              </Field>
              <Field label="Type" required error={errors.type}>
                <TSelect value={form.type} onChange={(e) => setField("type", e.target.value)} disabled={isReadOnly} options={TYPE_OPTIONS} error={errors.type} />
              </Field>
              <Field label="Status">
                <TInput value={form.status} disabled />
              </Field>
              <div className="flex flex-col gap-2.5 justify-center pt-5">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={form.authorized} onChange={(e) => setField("authorized", e.target.checked)} disabled={isReadOnly} className="rounded" />
                  <Lock size={11} className="text-amber-500" /> Authorised
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                  <input type="checkbox" checked={form.comparisonDone} disabled className="rounded" />
                  <CheckCircle size={11} className="text-blue-500" /> Comparison Done
                </label>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Buyer Code" required error={errors.buyer}>
                <TInput value={form.buyerCode} onChange={(e) => setField("buyerCode", e.target.value)} disabled={isReadOnly} placeholder="e.g. EDP-001" error={errors.buyer} />
              </Field>
              <Field label="Buyer Name" required>
                <TInput value={form.buyer} onChange={(e) => setField("buyer", e.target.value)} disabled={isReadOnly} placeholder="Buyer name" />
              </Field>
              <Field label="Category">
                <TSelect value={form.category} onChange={(e) => setField("category", e.target.value)} disabled={isReadOnly} options={CATEGORY_OPTIONS} placeholder="— Select Category —" />
              </Field>
              <Field label="SO No">
                <TInput value={form.soNo} onChange={(e) => setField("soNo", e.target.value)} disabled={isReadOnly} placeholder="Sales Order reference" />
              </Field>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Expected Quotation Date">
                <TInput type="date" value={form.expectedQuotationDate} onChange={(e) => setField("expectedQuotationDate", e.target.value)} disabled={isReadOnly} />
              </Field>
              <Field label="Other Reference" className="col-span-3">
                <TInput value={form.otherReference} onChange={(e) => setField("otherReference", e.target.value)} disabled={isReadOnly} placeholder="PR number, project code, specification ID…" />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Body Tabs ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {[
              { id: "items",      label: "Item Details",       hasErr: hasItemErr  },
              { id: "terms",      label: "Terms & Conditions", hasErr: hasTermErr  },
              { id: "vendors",    label: "RFQ Vendor Grid",    hasErr: hasVendErr  },
              { id: "quotations", label: "Quotation Received", hasErr: hasQuoteErr },
              { id: "followups",  label: "Followup Log",       hasErr: false       },
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
                  <table className="w-full text-xs min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Sr","PR Ref No","Item Code *","Description *","Qty *","UoM *","Exp. Delivery Date","Remark",""].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono w-8">{i + 1}</td>
                          <td className="px-1 py-1 w-28">
                            <input value={row.prRefNo} onChange={(e) => updItem(i, "prRefNo", e.target.value)} disabled={isReadOnly} placeholder="PR Ref" className={cellCls(false)} />
                          </td>
                          <td className="px-1 py-1 w-28">
                            <input value={row.itemCode} onChange={(e) => updItem(i, "itemCode", e.target.value)} disabled={isReadOnly} placeholder="Item Code" className={cellCls(errors[`ic_${i}`])} />
                            {errors[`ic_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`ic_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.description} onChange={(e) => updItem(i, "description", e.target.value)} disabled={isReadOnly} placeholder="Item description" className={cellCls(errors[`desc_${i}`])} />
                            {errors[`desc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`desc_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1 w-20">
                            <input type="number" min="0" value={row.qty} onChange={(e) => updItem(i, "qty", e.target.value)} disabled={isReadOnly} placeholder="0" className={`${cellCls(errors[`qty_${i}`])} text-right`} />
                            {errors[`qty_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`qty_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1 w-20">
                            <select value={row.uom} onChange={(e) => updItem(i, "uom", e.target.value)} disabled={isReadOnly} className={cellCls(errors[`uom_${i}`])}>
                              <option value="">UOM</option>
                              {UOM_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                            </select>
                            {errors[`uom_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`uom_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1 w-36">
                            <input type="date" value={row.expectedDeliveryDate} min={form.date} onChange={(e) => updItem(i, "expectedDeliveryDate", e.target.value)} disabled={isReadOnly} className={cellCls(errors[`dd_${i}`])} />
                            {errors[`dd_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`dd_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.remark} onChange={(e) => updItem(i, "remark", e.target.value)} disabled={isReadOnly} placeholder="Remark" className={cellCls(false)} />
                          </td>
                          <td className="px-2 py-1 text-center w-10">
                            {!isReadOnly && <button onClick={() => delItem(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>}
                          </td>
                        </tr>
                      ))}
                      {!isReadOnly && (
                        <tr>
                          <td className="px-2 py-1.5 text-center text-gray-300">{form.items.length + 1}</td>
                          <td colSpan={8} className="px-2 py-1.5 text-xs text-gray-300 italic">Click + Add Item to insert a new line</td>
                        </tr>
                      )}
                      {form.items.length === 0 && isReadOnly && (
                        <tr><td colSpan={9} className="py-8 text-center text-gray-400 text-sm">No items added.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
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
                            <input value={row.term} onChange={(e) => updTerm(i, "term", e.target.value)} disabled={isReadOnly} placeholder="e.g. Payment" className={cellCls(errors[`term_${i}`])} />
                            {errors[`term_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`term_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1">
                            <input value={row.description} onChange={(e) => updTerm(i, "description", e.target.value)} disabled={isReadOnly} placeholder="Full clause text (printed on RFQ)" className={cellCls(errors[`termdesc_${i}`])} />
                            {errors[`termdesc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`termdesc_${i}`]}</p>}
                          </td>
                          <td className="px-1 py-1 w-28">
                            <select value={row.termType} onChange={(e) => updTerm(i, "termType", e.target.value)} disabled={isReadOnly} className={cellCls(false)}>
                              <option value="">— Type —</option>
                              {TERM_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
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
                  <Field label="Document Remark (internal — not printed on RFQ sent to vendor)">
                    <TInput value={form.remark} onChange={(e) => setField("remark", e.target.value)} disabled={isReadOnly} placeholder="Internal remarks…" rows={3} />
                  </Field>
                </div>
              </div>
            )}

            {/* ══ RFQ VENDOR GRID ══ */}
            {activeTab === "vendors" && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[1100px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Sr","Vendor Code *","Vendor Name","Contact Person","Contact No","Contact Email","City","Currency","State","Country",""].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.vendors.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono w-8">{i + 1}</td>
                          <td className="px-1 py-1 w-32">
                            <select value={row.vendorCode} onChange={(e) => autoFillVendor(i, e.target.value)} disabled={isReadOnly} className={cellCls(errors[`vc_${i}`])}>
                              <option value="">— Select —</option>
                              {VENDOR_MASTER.map((v) => <option key={v.code} value={v.code}>{v.code}</option>)}
                            </select>
                            {errors[`vc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`vc_${i}`]}</p>}
                          </td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.vendorName  || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.contact     || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.phone       || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.email       || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.city        || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.currency    || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.state       || "—"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-600">{row.country     || "—"}</td>
                          <td className="px-2 py-1 text-center w-10">
                            {!isReadOnly && <button onClick={() => delVendor(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>}
                          </td>
                        </tr>
                      ))}
                      {form.vendors.length === 0 && <tr><td colSpan={11} className="py-8 text-center text-gray-400 text-sm">No vendors added. Add vendors to send RFQ.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {!isReadOnly && (
                  <button onClick={addVendor} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={13} /> Add Vendor
                  </button>
                )}
              </div>
            )}

            {/* ══ QUOTATION RECEIVED ══ */}
            {activeTab === "quotations" && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[1000px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Sr","Quotation No","Quotation Date *","Rev No","Rev Date","Validity (Days)","Contact Person","Buyer Name","Remark","Changelog",""].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.quotations.map((row, i) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20">
                          <td className="px-2 py-1.5 text-center text-gray-400 font-mono w-8">{i + 1}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-500 font-mono">{row.quotationNo || "—"}</td>
                          <td className="px-1 py-1 w-32">
                            <input type="date" value={row.quotationDate} min={form.date} onChange={(e) => updQuotation(i, "quotationDate", e.target.value)} disabled={isReadOnly} className={cellCls(errors[`qdate_${i}`] || errors[`qdateearly_${i}`])} />
                            {(errors[`qdate_${i}`] || errors[`qdateearly_${i}`]) && <p className="text-xs text-red-500 mt-0.5">{errors[`qdate_${i}`] || errors[`qdateearly_${i}`]}</p>}
                          </td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-500 text-center">{row.revisionNo || "0"}</td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-500">{row.revisionDate || "—"}</td>
                          <td className="px-1 py-1 w-24">
                            <input type="number" min="0" value={row.validity} onChange={(e) => updQuotation(i, "validity", e.target.value)} disabled={isReadOnly} placeholder="Days" className={`${cellCls(false)} text-right`} />
                          </td>
                          <td className="px-1 py-1 w-36">
                            <input value={row.contactPerson} onChange={(e) => updQuotation(i, "contactPerson", e.target.value)} disabled={isReadOnly} placeholder="Contact" className={cellCls(false)} />
                          </td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-500">{row.buyerName || form.buyer || "—"}</td>
                          <td className="px-1 py-1">
                            <input value={row.remark} onChange={(e) => updQuotation(i, "remark", e.target.value)} disabled={isReadOnly} placeholder="Remark" className={cellCls(false)} />
                          </td>
                          <td className="px-2 py-1.5 bg-gray-50/60 text-gray-400">0 revisions</td>
                          <td className="px-2 py-1 text-center w-10">
                            {!isReadOnly && <button onClick={() => delQuotation(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>}
                          </td>
                        </tr>
                      ))}
                      {form.quotations.length === 0 && <tr><td colSpan={11} className="py-8 text-center text-gray-400 text-sm">No quotations recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {!isReadOnly && (
                  <button onClick={addQuotation} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                    <Plus size={13} /> Add Quotation
                  </button>
                )}
              </div>
            )}

            {/* ══ FOLLOWUP LOG ══ */}
            {activeTab === "followups" && (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded overflow-x-auto">
                  <table className="w-full text-xs min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["Followup Ref","Date","Vendor","Contact","Method","Note","Status",""].map((h) => (
                          <th key={h} className="px-2 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(form.followups || []).map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/20 cursor-pointer" onClick={() => openEditFollowup(row)}>
                          <td className="px-3 py-2 font-mono text-blue-600">{row.ref}</td>
                          <td className="px-3 py-2 text-gray-600">{row.followupDate ? new Date(row.followupDate).toLocaleDateString("en-IN") : "—"}</td>
                          <td className="px-3 py-2 text-gray-600">{row.partyName}</td>
                          <td className="px-3 py-2 text-gray-600">{row.contactPerson}</td>
                          <td className="px-3 py-2 text-gray-600">{row.method}</td>
                          <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{row.note}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${
                              row.status === "Active"  ? "bg-green-50 text-green-600 border-green-200" :
                              row.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                                                         "bg-gray-50  text-gray-600  border-gray-200"}`}>{row.status}</span>
                          </td>
                          <td className="px-2 py-1 text-center">
                            <button onClick={(e) => { e.stopPropagation(); openEditFollowup(row); }} className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded">
                              <Edit2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!form.followups || form.followups.length === 0) && <tr><td colSpan={8} className="py-8 text-center text-gray-400 text-sm">No followups recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <button onClick={openNewFollowup} className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
                  <Plus size={13} /> Add Followup
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Comparison Notes ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <BarChart2 size={13} /> Comparison Notes
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-4 gap-4">
              <Field label="Last Comparison By">
                <TInput value={form.comparisonNotes?.lastBy || ""} disabled placeholder="—" />
              </Field>
              <Field label="Last Comparison Date">
                <TInput type="date" value={form.comparisonNotes?.lastDate || ""} disabled />
              </Field>
              <Field label="Short Note" className="col-span-2">
                <TInput value={form.comparisonNotes?.shortNote || ""} onChange={(e) => setForm((p) => ({ ...p, comparisonNotes: { ...p.comparisonNotes, shortNote: e.target.value } }))} disabled={isReadOnly} placeholder="Brief comparison outcome note…" />
              </Field>
            </div>
            <Field label="Detail Note">
              <TInput value={form.comparisonNotes?.detailNote || ""} onChange={(e) => setForm((p) => ({ ...p, comparisonNotes: { ...p.comparisonNotes, detailNote: e.target.value } }))} disabled={isReadOnly} placeholder="Detailed justification for vendor selection or comparison decision…" rows={3} />
            </Field>

            {/* Summary stats */}
            <div className="grid grid-cols-4 gap-3 pt-1">
              {[
                { label: "Total Items",         value: form.items?.length      || 0 },
                { label: "Vendors in RFQ",      value: form.vendors?.length    || 0 },
                { label: "Quotations Received", value: form.quotations?.length || 0 },
                { label: "Followups",           value: form.followups?.length  || 0 },
              ].map((s) => (
                <div key={s.label} className="bg-gray-50 border border-gray-200 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                  <div className="text-lg font-bold text-gray-700 font-mono">{s.value}</div>
                </div>
              ))}
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
                {Object.values(errors).slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {Object.keys(errors).length > 6 && <li>…and {Object.keys(errors).length - 6} more error(s)</li>}
              </ul>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-400 pb-2">Fields marked <span className="text-red-400 font-medium">*</span> are mandatory.</p>
      </div>

      {/* ════════════ FOLLOWUP MODAL ════════════ */}
      {showFollowup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="font-semibold text-sm text-gray-800">Purchase Inquiry Followup</h3>
                {fuForm.ref && <p className="text-xs text-gray-400 mt-0.5">{fuForm.ref} · {form.number}</p>}
              </div>
              <button onClick={() => setShowFollowup(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"><X size={16} /></button>
            </div>

            {/* Modal tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-2">
              {[
                { id: "details",   label: "Followup Details"   },
                { id: "next",      label: "Next Followup"      },
                { id: "prev",      label: "Previous Followup"  },
                { id: "revisions", label: "Show Revisions"     },
              ].map((t) => (
                <button key={t.id} onClick={() => setFuTab(t.id)}
                  className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${fuTab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* ── Followup Details ── */}
              {fuTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Followup Reference">
                      <TInput value={fuForm.ref} disabled />
                    </Field>
                    <Field label="Type">
                      <TInput value={fuForm.type} disabled />
                    </Field>
                    <Field label="Followup Status" required error={fuErrors.status}>
                      <TSelect value={fuForm.status} onChange={(e) => fuSet("status", e.target.value)} options={FOLLOWUP_STATUS_OPT} placeholder="— Select Status —" error={fuErrors.status} />
                    </Field>
                    <Field label="Followup For" className="col-span-2">
                      <TInput value={fuForm.followupFor} disabled />
                    </Field>
                    <Field label="Party Type">
                      <TInput value={fuForm.partyType} disabled />
                    </Field>
                    <Field label="Party Code (Vendor)">
                      <TSelect value={fuForm.partyCode} onChange={(e) => {
                        const vm = VENDOR_MASTER.find((v) => v.code === e.target.value);
                        fuSet("partyCode", e.target.value);
                        if (vm) { fuSet("partyName", vm.name); fuSet("contactPerson", vm.contact); fuSet("contactEmail", vm.email); fuSet("contactNo", vm.phone); }
                      }} options={VENDOR_MASTER.map((v) => v.code)} placeholder="— Select Vendor —" />
                    </Field>
                    <Field label="Party Name" className="col-span-2">
                      <TInput value={fuForm.partyName} disabled placeholder="Auto-fetched from vendor master" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Contact Person">
                      <TInput value={fuForm.contactPerson} onChange={(e) => fuSet("contactPerson", e.target.value)} placeholder="Contact name" />
                    </Field>
                    <Field label="Contact Email" error={fuErrors.contactEmail}>
                      <TInput value={fuForm.contactEmail} onChange={(e) => fuSet("contactEmail", e.target.value)} placeholder="name@domain.com" error={fuErrors.contactEmail} />
                    </Field>
                    <Field label="Contact No">
                      <TInput value={fuForm.contactNo} onChange={(e) => fuSet("contactNo", e.target.value)} placeholder="+91 00000 00000" />
                    </Field>
                    <Field label="CC User (Internal)">
                      <TInput value={fuForm.ccUser} onChange={(e) => fuSet("ccUser", e.target.value)} placeholder="Internal ERP user to CC" />
                    </Field>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Followup Details</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Followup By (Code)" required error={fuErrors.followupBy}>
                        <TInput value={fuForm.followupByCode} onChange={(e) => fuSet("followupByCode", e.target.value)} placeholder="User Code" error={fuErrors.followupBy} />
                      </Field>
                      <Field label="Followup By (Name)" required>
                        <TInput value={fuForm.followupBy} onChange={(e) => fuSet("followupBy", e.target.value)} placeholder="User Name" />
                      </Field>
                      <Field label="Followup Date" required error={fuErrors.followupDate}>
                        <TInput type="date" value={fuForm.followupDate} onChange={(e) => fuSet("followupDate", e.target.value)} error={fuErrors.followupDate} />
                      </Field>
                      <Field label="Time">
                        <TInput type="time" value={fuForm.time} onChange={(e) => fuSet("time", e.target.value)} />
                      </Field>
                      <Field label="Followup Method">
                        <TSelect value={fuForm.method} onChange={(e) => fuSet("method", e.target.value)} options={FOLLOWUP_METHOD_OPT} placeholder="— Select Method —" />
                      </Field>
                      <Field label="Followup Cost">
                        <TInput type="number" value={fuForm.cost} onChange={(e) => fuSet("cost", e.target.value)} placeholder="0.00" min="0" />
                      </Field>
                    </div>
                    <div className="space-y-3 mt-3">
                      <Field label="Followup Note">
                        <TInput value={fuForm.note} onChange={(e) => fuSet("note", e.target.value)} placeholder="Detailed notes of what was discussed…" rows={3} />
                      </Field>
                      <Field label="Internal Note (not shared with vendor)">
                        <TInput value={fuForm.internalNote} onChange={(e) => fuSet("internalNote", e.target.value)} placeholder="Internal notes…" rows={2} />
                      </Field>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Next Followup ── */}
              {fuTab === "next" && (
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Next Followup Date" error={fuErrors.nextDate}>
                    <TInput type="date" value={fuForm.nextDate} onChange={(e) => fuSet("nextDate", e.target.value)} min={todayISO()} error={fuErrors.nextDate} />
                  </Field>
                  <Field label="Time">
                    <TInput type="time" value={fuForm.nextTime} onChange={(e) => fuSet("nextTime", e.target.value)} />
                  </Field>
                  <Field label="Next Followup By">
                    <TInput value={fuForm.nextBy} onChange={(e) => fuSet("nextBy", e.target.value)} placeholder="User name" />
                  </Field>
                  <Field label="Next Followup Method">
                    <TSelect value={fuForm.nextMethod} onChange={(e) => fuSet("nextMethod", e.target.value)} options={FOLLOWUP_METHOD_OPT} placeholder="— Select Method —" />
                  </Field>
                  <Field label="Next Followup Note" className="col-span-2">
                    <TInput value={fuForm.nextNote} onChange={(e) => fuSet("nextNote", e.target.value)} placeholder="Notes or agenda for the next followup…" />
                  </Field>
                </div>
              )}

              {/* ── Previous Followup ── */}
              {fuTab === "prev" && (
                lastFollowup
                  ? <div className="bg-gray-50 border border-gray-200 rounded p-4 text-xs space-y-2">
                      {[
                        ["Last Followup By", `${lastFollowup.followupByCode} — ${lastFollowup.followupBy}`],
                        ["Date",             lastFollowup.followupDate ? new Date(lastFollowup.followupDate).toLocaleDateString("en-IN") : "—"],
                        ["Time",             lastFollowup.time    || "—"],
                        ["Method",           lastFollowup.method  || "—"],
                        ["Vendor",           lastFollowup.partyName || "—"],
                        ["Note",             lastFollowup.note    || "—"],
                        ["Internal Note",    lastFollowup.internalNote || "—"],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="flex gap-4">
                          <span className="text-gray-400 min-w-[140px] font-medium">{lbl}</span>
                          <span className="text-gray-700">{val}</span>
                        </div>
                      ))}
                    </div>
                  : <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded">No previous followup records.</div>
              )}

              {/* ── Show Revisions ── */}
              {fuTab === "revisions" && (
                form.followups?.length > 0
                  ? <div className="border border-gray-200 rounded overflow-hidden">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            {["Ref","Date","Vendor","Method","Status","Note"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {form.followups.map((fu) => (
                            <tr key={fu.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2 font-mono text-blue-600">{fu.ref}</td>
                              <td className="px-3 py-2 text-gray-600">{fu.followupDate ? new Date(fu.followupDate).toLocaleDateString("en-IN") : "—"}</td>
                              <td className="px-3 py-2 text-gray-600">{fu.partyName}</td>
                              <td className="px-3 py-2 text-gray-600">{fu.method}</td>
                              <td className="px-3 py-2">
                                <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${fu.status === "Active" ? "bg-green-50 text-green-600 border-green-200" : fu.status === "Pending" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>{fu.status}</span>
                              </td>
                              <td className="px-3 py-2 text-gray-600 max-w-xs truncate">{fu.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  : <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-200 rounded">No revision history.</div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div>
                {Object.keys(fuErrors).length > 0 && (
                  <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} /> Please correct the highlighted fields.</p>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowFollowup(false)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
                  <X size={13} /> Close
                </button>
                <button onClick={handleSaveFollowup} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                  <Save size={13} /> Save Followup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
