import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Save, X, FileText, ChevronRight, AlertCircle, CheckCircle,
  Edit2, List, Printer, Lock, Unlock, BarChart2, Search, Award, Plus,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const SHORT_NOTE_MAX = 200;

// ─── Utilities ────────────────────────────────────────────────────────────────
function todayISO() { return new Date().toISOString().split("T")[0]; }
function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function buildRowsFromPI(pi) {
  return (pi.items || []).map((item) => ({
    itemId:      item.id,
    itemCode:    item.itemCode,
    description: item.description,
    qty:         item.qty,
    uom:         item.uom,
    lastPONo:    "",
    lastPORate:  "",
    vendors: (pi.vendors || []).map((v) => ({
      vendorId:     v.id,
      vendorCode:   v.vendorCode,
      vendorName:   v.vendorName,
      rate:         "",
      deliveryDate: "",
      approved:     false,
      rejected:     false,
      rank:         0,
    })),
  }));
}

function calcValue(rate, qty) {
  const r = parseFloat(rate); const q = parseFloat(qty);
  return isNaN(r) || isNaN(q) ? 0 : r * q;
}

function recomputeRanks(rows) {
  return rows.map((row) => {
    const active = row.vendors
      .map((v, i) => ({ i, rate: parseFloat(v.rate) }))
      .filter((v) => !row.vendors[v.i].rejected && !isNaN(v.rate) && v.rate > 0)
      .sort((a, b) => a.rate - b.rate);
    return {
      ...row,
      vendors: row.vendors.map((v, i) => {
        const pos = active.findIndex((a) => a.i === i);
        return { ...v, rank: pos === -1 ? 0 : pos + 1 };
      }),
    };
  });
}

function emptyComparison(pi) {
  return {
    id: "", number: "",
    piId:        pi?.id        || "",
    piNumber:    pi?.number    || "",
    piDate:      pi?.date      || "",
    unit:        pi?.unit      || "",
    buyerCode:   pi?.buyerCode || "",
    buyer:       pi?.buyer     || "",
    reference:   "",
    comparisonDate: todayISO(),
    shortNote:   "",
    lastComparedBy: "",
    lastComparedAt: "",
    locked:      false,
    autoEntry:   false,
    detailNote:  "",
    rows:        pi ? buildRowsFromPI(pi) : [],
    createdAt:   "", updatedAt: "",
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.piNumber)       e.piNumber       = "No Purchase Inquiry selected.";
  if (!form.comparisonDate) e.comparisonDate = "Comparison Date is a required field.";
  if (form.shortNote && form.shortNote.length > SHORT_NOTE_MAX)
    e.shortNote = `Short Note exceeds maximum allowed character limit (${SHORT_NOTE_MAX} chars).`;

  form.rows.forEach((row, ri) => {
    const approvedCount = row.vendors.filter((v) => v.approved).length;
    const bothSet       = row.vendors.some((v) => v.approved && v.rejected);
    if (bothSet)         e[`both_${ri}`]        = `${row.itemCode}: Approve and Reject cannot both be selected for the same item-vendor row.`;
    if (approvedCount > 1) e[`multiapprove_${ri}`] = `${row.itemCode}: Only one vendor should be approved per item line. Please review your selections.`;
  });
  return e;
}

function validateLock(form) {
  const e = {};
  form.rows.forEach((row) => {
    if (!row.vendors.some((v) => v.approved))
      e[`noapp_${row.itemId}`] = `Please approve at least one vendor for item ${row.itemCode} before locking the comparison.`;
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

const inputCls = (disabled, error, highlight) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error     ? "border-red-300 focus:ring-red-300 bg-red-50/30"
  : highlight ? "border-yellow-400 bg-yellow-50 focus:ring-yellow-300"
  : disabled  ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
              : "bg-white border-gray-300 hover:border-gray-400 focus:ring-brand-600"}`;

function TInput({ value, onChange, disabled, placeholder, type = "text", error, highlight, rows }) {
  const cls = inputCls(disabled, error, !disabled && highlight);
  if (rows) return <textarea value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} rows={rows} className={cls} />;
  return <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} className={cls} />;
}

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
export default function QuotationComparison() {
  const navigate = useNavigate();

  const [allQCs,     setAllQCs]     = useState([]);
  const [allPIs,     setAllPIs]     = useState([]);
  const [form,       setForm]       = useState(null);
  const [mode,       setMode]       = useState("new");
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [toast,      setToast]      = useState(null);
  const [showList,   setShowList]   = useState(false);
  const [showPISel,  setShowPISel]  = useState(false);
  const [errors,     setErrors]     = useState({});

  const isLocked   = !!form?.locked;
  const isReadOnly = mode === "view" || isLocked;

  // ── Load ──
  useEffect(() => {
    const pis = JSON.parse(localStorage.getItem("purchase_inquiries")    || "[]");
    const qcs = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
    setAllPIs(pis);
    setAllQCs(qcs);
    if (qcs.length > 0) {
      setForm(qcs[qcs.length - 1]); setCurrentIdx(qcs.length - 1); setMode("view");
    } else if (pis.length > 0) {
      setForm(emptyComparison(pis[pis.length - 1])); setMode("new");
    } else {
      setForm(emptyComparison(null)); setMode("new");
    }
  }, []);

  const reloadList = () => {
    const s = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
    setAllQCs(s); return s;
  };

  const goTo = (idx) => {
    const list = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
    if (idx < 0 || idx >= list.length) return;
    setForm(list[idx]); setCurrentIdx(idx); setMode("view"); setErrors({});
  };

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const setField  = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  // ── Cell update + auto-rank ──
  const updCell = (ri, vi, key, val) => {
    setForm((p) => {
      let rows = p.rows.map((r, i) => {
        if (i !== ri) return r;
        return { ...r, vendors: r.vendors.map((v, j) => j === vi ? { ...v, [key]: val } : v) };
      });
      rows = recomputeRanks(rows);
      return { ...p, rows };
    });
  };

  const toggleApprove = (ri, vi) => {
    setForm((p) => ({
      ...p,
      rows: p.rows.map((r, i) => i !== ri ? r : {
        ...r,
        vendors: r.vendors.map((v, j) =>
          j === vi ? { ...v, approved: !v.approved, rejected: !v.approved ? false : v.rejected } : v
        ),
      }),
    }));
  };

  const toggleReject = (ri, vi) => {
    setForm((p) => {
      let rows = p.rows.map((r, i) => i !== ri ? r : {
        ...r,
        vendors: r.vendors.map((v, j) =>
          j === vi ? { ...v, rejected: !v.rejected, approved: !v.rejected ? false : v.approved } : v
        ),
      });
      rows = recomputeRanks(rows);
      return { ...p, rows };
    });
  };

  // ── PI Selection ──
  const selectPI = (pi) => {
    if (pi.status === "Closed") {
      showToast("This Purchase Inquiry is closed. Comparison is available in view-only mode.", "error"); return;
    }
    if (!pi.quotations || pi.quotations.length === 0) {
      showToast("No quotations received for this Purchase Inquiry. Comparison cannot be opened.", "error"); return;
    }
    setForm(emptyComparison(pi));
    setMode("new"); setCurrentIdx(-1); setShowPISel(false);
    showToast(`PI ${pi.number} loaded — ${pi.items?.length || 0} items, ${pi.vendors?.length || 0} vendors.`);
  };

  // ── Save ──
  const handleSave = () => {
    if (isLocked) { showToast("This comparison is locked. No further changes are allowed.", "error"); return; }
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); showToast("Please correct the highlighted errors.", "error"); return; }

    const all   = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
    const now   = new Date().toISOString();
    const user  = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    const uname = user.name || user.fullName || "System";
    const count = all.filter((q) => !form.id || q.id !== form.id).length + 1;
    const number = form.number || `QC-${new Date().getFullYear().toString().slice(2)}${(new Date().getFullYear() + 1).toString().slice(2)}/${String(count).padStart(4, "0")}`;

    let saved;
    if (!form.id) {
      saved = { ...form, id: Date.now().toString(), number, lastComparedBy: uname, lastComparedAt: now, createdAt: now, updatedAt: now };
      all.push(saved);
    } else {
      saved = { ...form, number, lastComparedBy: uname, lastComparedAt: now, updatedAt: now };
      const idx = all.findIndex((q) => q.id === form.id);
      if (idx !== -1) all[idx] = saved; else all.push(saved);
    }
    localStorage.setItem("quotation_comparisons", JSON.stringify(all));

    // Mark PI comparisonDone
    const pis = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
    const piIdx = pis.findIndex((p) => p.id === form.piId);
    if (piIdx !== -1) {
      pis[piIdx] = { ...pis[piIdx], comparisonDone: true, status: "Comparison Done", comparisonNotes: { lastBy: uname, lastDate: todayISO(), shortNote: form.shortNote, detailNote: form.detailNote } };
      localStorage.setItem("purchase_inquiries", JSON.stringify(pis));
      setAllPIs(pis);
    }

    const updated = reloadList();
    const ni = updated.findIndex((q) => q.id === saved.id);
    setForm(saved); setCurrentIdx(ni !== -1 ? ni : updated.length - 1); setMode("view"); setErrors({});
    showToast(`Comparison ${saved.number} saved. PI marked as Comparison Done.`);
  };

  // ── Cancel ──
  const handleCancel = () => {
    if (mode === "new") {
      const list = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
      if (list.length > 0) {
        const idx = currentIdx >= 0 ? Math.min(currentIdx, list.length - 1) : list.length - 1;
        setForm(list[idx]); setCurrentIdx(idx); setMode("view");
      } else {
        const pis = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]");
        setForm(emptyComparison(pis[pis.length - 1] || null)); setMode("view");
      }
      setErrors({}); return;
    }
    if (mode === "edit") {
      const all  = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
      const saved = all.find((q) => q.id === form.id);
      if (saved) setForm(saved);
      setMode("view"); setErrors({});
    }
  };

  // ── Lock / Unlock ──
  const handleLock = () => {
    if (!form.id) { showToast("Please save first before locking.", "error"); return; }
    if (!form.locked) {
      const lockErrs = validateLock(form);
      if (Object.keys(lockErrs).length > 0) {
        setErrors(lockErrs);
        showToast("Please approve at least one vendor for each item before locking the comparison.", "error");
        return;
      }
      if (form.autoEntry) {
        const failed = form.rows.filter((r) => { const a = r.vendors.find((v) => v.approved); return !a || !a.rate; }).map((r) => r.itemCode);
        if (failed.length > 0)
          showToast(`Auto-entry failed for item(s): ${failed.join(", ")}. Please update Supplier-wise Item Mapping manually.`, "error");
      }
    }
    const updated = { ...form, locked: !form.locked };
    setForm(updated);
    const all = JSON.parse(localStorage.getItem("quotation_comparisons") || "[]");
    const idx = all.findIndex((q) => q.id === form.id);
    if (idx !== -1) { all[idx] = updated; localStorage.setItem("quotation_comparisons", JSON.stringify(all)); reloadList(); }
    showToast(updated.locked ? "Comparison locked." : "Comparison unlocked.");
  };

  // ── Print ──
  const handlePrint = () => {
    if (!form.id) { showToast("No comparison data available to print. Please save the comparison first.", "error"); return; }
    window.print();
  };

  if (!form) return <Layout><div className="p-8 text-center text-gray-400">Loading…</div></Layout>;

  const piVendors = form.rows[0]?.vendors || [];

  const vendorTotals = piVendors.map((_, vi) =>
    form.rows.reduce((sum, row) => {
      const v = row.vendors[vi];
      return (!v || v.rejected) ? sum : sum + calcValue(v.rate, row.qty);
    }, 0)
  );
  const lowestTotal   = vendorTotals.filter((t) => t > 0).length ? Math.min(...vendorTotals.filter((t) => t > 0)) : 0;
  const approvedTotal = form.rows.reduce((sum, row) => {
    const a = row.vendors.find((v) => v.approved);
    return a ? sum + calcValue(a.rate, row.qty) : sum;
  }, 0);

  const gridErrors = Object.entries(errors).filter(([k]) => k.startsWith("both_") || k.startsWith("multiapprove_") || k.startsWith("noapp_"));
  const headErrors = [errors.piNumber, errors.comparisonDate, errors.shortNote].filter(Boolean);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Purchase</span><ChevronRight size={12} /><span>Transaction</span><ChevronRight size={12} />
          <span className="text-gray-600 font-medium">Quotation Comparison</span>
          {form.number && <><ChevronRight size={12} /><span className="text-brand-600 font-medium">{form.number}</span></>}
        </div>

        <Toast toast={toast} />

        {/* ── Toolbar ── */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">

          {(mode === "new" || mode === "edit") && !isLocked && (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                <Save size={13} /> Save
              </button>
              <button onClick={handleCancel} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium">
                <X size={13} /> Cancel
              </button>
            </>
          )}

          {mode === "view" && !isLocked && (
            <>
              <button onClick={() => setMode("edit")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium">
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => { const pis = JSON.parse(localStorage.getItem("purchase_inquiries") || "[]"); setForm(emptyComparison(pis[pis.length - 1] || null)); setCurrentIdx(-1); setMode("new"); setErrors({}); }}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
                <Plus size={13} /> New QC
              </button>
            </>
          )}

          <div className="w-px h-5 bg-gray-200" />

          <button onClick={handleLock} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${isLocked ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {isLocked ? <><Unlock size={13} /> Unlock Comparison</> : <><Lock size={13} /> Lock Comparison</>}
          </button>

          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Printer size={13} /> Print Grid
          </button>

          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <FileText size={13} /> Print Comparison Report
          </button>

          <div className="w-px h-5 bg-gray-200" />

          {/* Navigator */}
          <div className="flex items-center gap-1">
            <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx <= 0 || mode !== "view"}
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed text-xs px-2">‹</button>
            <button onClick={() => goTo(currentIdx + 1)} disabled={currentIdx >= allQCs.length - 1 || mode !== "view"}
              className="p-1.5 border border-gray-300 text-gray-500 hover:bg-gray-50 rounded disabled:opacity-30 disabled:cursor-not-allowed text-xs px-2">›</button>
            <button onClick={() => setShowList((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 border rounded font-medium ${showList ? "border-blue-300 bg-blue-50 text-brand-600" : "border-gray-300 text-gray-500 hover:bg-gray-50"}`}>
              <List size={13} />{allQCs.length > 0 && <span className="text-gray-400">{currentIdx >= 0 ? `${currentIdx + 1}/${allQCs.length}` : allQCs.length}</span>}
            </button>
          </div>

          {form.lastComparedAt && (
            <div className="ml-auto text-xs text-gray-400">
              Last saved: {formatDateTime(form.lastComparedAt)}{form.lastComparedBy && ` by ${form.lastComparedBy}`}
            </div>
          )}
        </div>

        {/* ── List Panel ── */}
        {showList && (
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <List size={13} /> All Comparisons <span className="text-gray-400 font-normal normal-case">({allQCs.length})</span>
              </h3>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["QC Number","Comparison Date","PI Reference","Buyer","Unit","Status",""].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allQCs.map((qc, i) => (
                    <tr key={qc.id} onClick={() => { goTo(i); setShowList(false); }}
                      className={`border-b border-gray-100 cursor-pointer hover:bg-brand-50/40 ${i === currentIdx ? "bg-blue-50 border-l-2 border-l-blue-500" : ""}`}>
                      <td className="px-3 py-2 font-mono font-semibold text-brand-600">{qc.number}</td>
                      <td className="px-3 py-2 text-gray-600">{qc.comparisonDate ? new Date(qc.comparisonDate).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-3 py-2 font-mono text-gray-600">{qc.piNumber || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{qc.buyer || "—"}</td>
                      <td className="px-3 py-2 text-gray-600">{qc.unit || "—"}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 border rounded-full text-xs font-medium ${qc.locked ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                          {qc.locked ? "Locked" : "Draft"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-brand-500 font-medium">Open →</td>
                    </tr>
                  ))}
                  {allQCs.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-gray-400">No comparisons yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Status Banner ── */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-600 rounded px-5 py-3 flex items-center gap-4 text-white shadow-sm">
          <BarChart2 size={16} className="text-blue-200 shrink-0" />
          <span className="font-bold text-base tracking-wide">{form.number || "New Quotation Comparison"}</span>
          {form.piNumber && <span className="text-blue-200 text-sm">| PI: {form.piNumber}</span>}
          {form.buyer    && <span className="text-blue-200 text-sm">| {form.buyer}</span>}
          <div className="ml-auto flex items-center gap-2">
            {isLocked && <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"><Lock size={10} /> Locked</span>}
            {(mode === "new" || mode === "edit") && !isLocked && <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">{mode === "new" ? "New Record" : "Editing"}</span>}
            <span className={`px-2.5 py-0.5 rounded text-xs font-medium border ${isLocked ? "bg-amber-400/20 text-amber-100 border-amber-300/30" : "bg-gray-400/20 text-gray-100 border-gray-300/30"}`}>
              {isLocked ? "Locked" : "Draft"}
            </span>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Header</div>
          <div className="p-4 space-y-3">

            {/* Row 1: auto-from-PI fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Unit">
                <TInput value={form.unit} disabled />
              </Field>
              <Field label="Buyer Code">
                <TInput value={form.buyerCode} disabled />
              </Field>
              <Field label="Buyer Name">
                <TInput value={form.buyer} disabled />
              </Field>
              <Field label="Purchase Inquiry No" required error={errors.piNumber}>
                <div className="flex gap-2">
                  <TInput value={form.piNumber} disabled placeholder="Select a PI" error={errors.piNumber} />
                  {!isReadOnly && (
                    <button onClick={() => setShowPISel((v) => !v)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 border rounded whitespace-nowrap font-medium transition-colors ${showPISel ? "border-blue-300 bg-blue-50 text-brand-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                      <Search size={12} /> Select
                    </button>
                  )}
                </div>
              </Field>
            </div>

            {/* PI Selector */}
            {showPISel && !isReadOnly && (
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-100 px-3 py-1.5 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Select Purchase Inquiry</span>
                  <button onClick={() => setShowPISel(false)} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>
                </div>
                <div className="overflow-y-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["PI Number","Date","Buyer","Unit","Items","Vendors","Quotations","Status"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-gray-500 font-semibold uppercase tracking-wide whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allPIs.map((pi) => (
                        <tr key={pi.id} onClick={() => selectPI(pi)} className="border-b border-gray-100 cursor-pointer hover:bg-blue-50">
                          <td className="px-3 py-2 font-mono font-semibold text-brand-600">{pi.number}</td>
                          <td className="px-3 py-2">{pi.date ? new Date(pi.date).toLocaleDateString("en-IN") : "—"}</td>
                          <td className="px-3 py-2">{pi.buyer || "—"}</td>
                          <td className="px-3 py-2">{pi.unit || "—"}</td>
                          <td className="px-3 py-2 text-center">{pi.items?.length || 0}</td>
                          <td className="px-3 py-2 text-center">{pi.vendors?.length || 0}</td>
                          <td className="px-3 py-2 text-center">{pi.quotations?.length || 0}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-medium">{pi.status}</span>
                          </td>
                        </tr>
                      ))}
                      {allPIs.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-gray-400">No Purchase Inquiries found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Row 2: editable header fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="PI Date">
                <TInput value={form.piDate ? new Date(form.piDate).toLocaleDateString("en-IN") : ""} disabled placeholder="—" />
              </Field>
              <Field label="Reference">
                <TInput value={form.reference} onChange={(e) => setField("reference", e.target.value)} disabled={isReadOnly} placeholder="Additional reference" />
              </Field>
              <Field label="Comparison Date" required error={errors.comparisonDate}>
                {/* Highlighted yellow per spec */}
                <TInput type="date" value={form.comparisonDate} onChange={(e) => setField("comparisonDate", e.target.value)} disabled={isReadOnly} highlight={!errors.comparisonDate} error={errors.comparisonDate} />
              </Field>
              <Field label={`Short Note${form.shortNote ? ` (${form.shortNote.length}/${SHORT_NOTE_MAX})` : ""}`} error={errors.shortNote}>
                <TInput value={form.shortNote} onChange={(e) => setField("shortNote", e.target.value)} disabled={isReadOnly} placeholder="e.g. Finalized vendor A003" error={errors.shortNote} />
              </Field>
            </div>

            {/* Row 3: audit + checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Last Compared By">
                <TInput value={form.lastComparedBy} disabled placeholder="—" />
              </Field>
              <Field label="Last Compared At">
                <TInput value={form.lastComparedAt ? formatDateTime(form.lastComparedAt) : ""} disabled placeholder="—" />
              </Field>
              <div className="col-span-2 flex flex-col gap-3 justify-center pt-5">
                <label className={`flex items-center gap-2 text-xs font-medium cursor-pointer ${isLocked ? "text-amber-700" : "text-gray-600"}`}>
                  <input type="checkbox" checked={isLocked} onChange={handleLock} disabled={!form.id} className="rounded" />
                  <Lock size={11} className={isLocked ? "text-amber-500" : "text-gray-400"} />
                  Locked Comparison
                  <span className="text-gray-400 font-normal">{isLocked ? "(no further edits allowed)" : "(lock once finalized)"}</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={!!form.autoEntry} onChange={(e) => !isReadOnly && setField("autoEntry", e.target.checked)} disabled={isReadOnly} className="rounded" />
                  Do Auto entry in Supplier wise Item Mapping
                  <span className="text-gray-400 font-normal">(executes on lock)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ── Vendors Quotations Grid ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
            <span className="flex items-center gap-2"><BarChart2 size={13} /> Vendors Quotations Grid</span>
            <span className="text-gray-400 font-normal normal-case">
              {form.rows.length} item{form.rows.length !== 1 ? "s" : ""} · {piVendors.length} vendor{piVendors.length !== 1 ? "s" : ""}
              {approvedTotal > 0 && <span className="ml-3 text-green-600 font-semibold">Approved: ₹{approvedTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>}
            </span>
          </div>

          {/* Grid-level error banner */}
          {gridErrors.length > 0 && (
            <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded p-3 space-y-0.5">
              {gridErrors.map(([k, v]) => (
                <div key={k} className="flex items-center gap-1 text-xs text-red-600"><AlertCircle size={11} />{v}</div>
              ))}
            </div>
          )}

          {form.rows.length === 0 ? (
            <div className="m-4 py-12 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded">
              Select a Purchase Inquiry above to load items and vendors for comparison.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    {/* Fixed item columns */}
                    <th className="px-3 py-2.5 text-left text-gray-500 font-semibold uppercase border-r border-gray-200 w-28 whitespace-nowrap">Item Code</th>
                    <th className="px-3 py-2.5 text-left text-gray-500 font-semibold uppercase border-r border-gray-200">Description</th>
                    <th className="px-3 py-2.5 text-right text-gray-500 font-semibold uppercase border-r border-gray-200 w-24 whitespace-nowrap">Qty / UoM</th>
                    <th className="px-3 py-2.5 text-right text-gray-500 font-semibold uppercase border-r border-gray-200 w-28 whitespace-nowrap">Last PO / Rate</th>
                    {/* One column per vendor */}
                    {piVendors.map((v, vi) => (
                      <th key={vi} className="px-3 py-2.5 text-center border-r border-gray-200 min-w-[175px]">
                        <div className="font-semibold text-gray-700">{v.vendorName || `Vendor ${vi + 1}`}</div>
                        <div className="text-gray-400 font-normal text-xs">{v.vendorCode}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {form.rows.map((row, ri) => {
                    const hasRowErr  = !!errors[`both_${ri}`] || !!errors[`multiapprove_${ri}`] || !!errors[`noapp_${row.itemId}`];
                    const activeRates = row.vendors.filter((v) => !v.rejected && v.rate).map((v) => parseFloat(v.rate) || Infinity);
                    const minRate     = activeRates.length ? Math.min(...activeRates) : Infinity;

                    return (
                      <tr key={row.itemId} className={`border-b border-gray-100 ${hasRowErr ? "bg-red-50/20" : "hover:bg-blue-50/10"}`}>

                        {/* Item Code */}
                        <td className="px-3 py-3 font-mono font-semibold text-gray-700 border-r border-gray-100 align-top">
                          {row.itemCode}
                          {hasRowErr && <div className="mt-1 text-red-500 text-xs font-normal flex items-center gap-0.5"><AlertCircle size={9} />Error</div>}
                        </td>

                        {/* Description */}
                        <td className="px-3 py-3 text-gray-600 border-r border-gray-100 align-top max-w-xs leading-snug">{row.description}</td>

                        {/* Qty / UoM */}
                        <td className="px-3 py-3 text-right border-r border-gray-100 align-top">
                          <span className="font-mono text-gray-700">{row.qty}</span>
                          <div className="text-gray-400 text-xs">{row.uom}</div>
                        </td>

                        {/* Last PO / Last PO Rate */}
                        <td className="px-3 py-3 text-right border-r border-gray-100 align-top">
                          <div className="text-gray-500 text-xs mb-1">{row.lastPONo || "—"}</div>
                          {isReadOnly
                            ? <span className="font-mono text-gray-600">{row.lastPORate ? `₹${row.lastPORate}` : "—"}</span>
                            : <input value={row.lastPORate || ""} onChange={(e) => setForm((p) => { const rows = p.rows.map((r, i) => i === ri ? { ...r, lastPORate: e.target.value } : r); return { ...p, rows }; })} placeholder="0.00" className="w-full px-1.5 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-400 text-right bg-white" />
                          }
                        </td>

                        {/* Vendor columns */}
                        {row.vendors.map((v, vi) => {
                          const value    = calcValue(v.rate, row.qty);
                          const isLowest = !v.rejected && v.rate && parseFloat(v.rate) === minRate;
                          return (
                            <td key={vi} className={`border-r border-gray-100 align-top px-2 py-2 ${v.rejected ? "bg-red-50/50" : v.approved ? "bg-green-50/40" : isLowest ? "bg-blue-50/30" : ""}`}>

                              {/* Rate / UOM (Landed Rate) — editable */}
                              <div className="flex items-center gap-1 mb-1">
                                {isReadOnly
                                  ? <span className={`w-full text-right font-mono px-1 py-1 block ${v.rejected ? "text-gray-400 line-through" : isLowest ? "font-bold text-blue-700 text-sm" : "text-gray-700"}`}>
                                      {v.rate ? `₹${v.rate}` : "—"}
                                    </span>
                                  : <input value={v.rate} onChange={(e) => updCell(ri, vi, "rate", e.target.value)} disabled={v.rejected} placeholder="Rate" className={`w-full px-1.5 py-1 text-xs border rounded focus:outline-none focus:ring-1 text-right ${v.rejected ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : isLowest ? "border-blue-300 bg-blue-50 focus:ring-brand-400 font-semibold" : "border-gray-200 bg-white focus:ring-brand-400"}`} />
                                }
                                {isLowest && !v.rejected && <Award size={11} className="text-brand-600 shrink-0" title="Lowest Rate" />}
                              </div>

                              {/* Value (Rate × Qty) + Delivery Date — display only */}
                              <div className="text-right text-xs text-gray-500 mb-1">
                                {value > 0 ? <span className="font-mono">₹{value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span> : <span className="text-gray-300">—</span>}
                              </div>
                              <div className="mb-1.5">
                                {isReadOnly
                                  ? <span className="text-xs text-gray-500">{v.deliveryDate ? new Date(v.deliveryDate).toLocaleDateString("en-IN") : "—"}</span>
                                  : <input type="date" value={v.deliveryDate} onChange={(e) => updCell(ri, vi, "deliveryDate", e.target.value)} disabled={v.rejected} className={`w-full px-1 py-0.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-brand-400 ${v.rejected ? "bg-gray-100 border-gray-200 cursor-not-allowed" : "border-gray-200 bg-white"}`} />
                                }
                              </div>

                              {/* Rank — display only, system-calculated */}
                              {v.rank > 0 && !v.rejected && (
                                <div className={`text-center text-xs font-bold rounded px-1 py-0.5 mb-1.5 ${v.rank === 1 ? "bg-blue-100 text-blue-700" : v.rank === 2 ? "bg-gray-100 text-gray-600" : "bg-gray-50 text-gray-400"}`}>
                                  Rank {v.rank}
                                </div>
                              )}

                              {/* Approve / Reject checkboxes */}
                              {!isReadOnly ? (
                                <div className="space-y-1">
                                  <label className={`flex items-center gap-1.5 text-xs cursor-pointer rounded px-1 py-0.5 transition-colors ${v.approved ? "bg-green-100 text-green-700 font-medium" : "text-gray-500 hover:bg-green-50"}`}>
                                    <input type="checkbox" checked={!!v.approved} onChange={() => toggleApprove(ri, vi)} className="rounded" />
                                    Approve
                                  </label>
                                  <label className={`flex items-center gap-1.5 text-xs cursor-pointer rounded px-1 py-0.5 transition-colors ${v.rejected ? "bg-red-100 text-red-700 font-medium" : "text-gray-500 hover:bg-red-50"}`}>
                                    <input type="checkbox" checked={!!v.rejected} onChange={() => toggleReject(ri, vi)} className="rounded" />
                                    Reject
                                  </label>
                                </div>
                              ) : (
                                (v.approved || v.rejected) && (
                                  <div className={`text-center text-xs px-1.5 py-0.5 rounded font-medium ${v.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                    {v.approved ? "✓ Approved" : "✗ Rejected"}
                                  </div>
                                )
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Grand Total row */}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td colSpan={4} className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 border-r border-gray-200">Grand Total (Basic)</td>
                    {vendorTotals.map((t, vi) => (
                      <td key={vi} className="px-3 py-2.5 text-right border-r border-gray-200">
                        <div className="font-mono font-bold text-sm text-gray-800">
                          {t > 0 ? `₹${t.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Summary footer */}
          {form.rows.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-6 items-center text-xs">
              <div><span className="text-gray-500">Lowest Possible Total: </span><span className="font-mono font-bold text-gray-800">{lowestTotal > 0 ? `₹${lowestTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}</span></div>
              <div><span className="text-gray-500">Approved Total: </span><span className="font-mono font-bold text-green-700">{approvedTotal > 0 ? `₹${approvedTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 })}` : "—"}</span></div>
              <span className="ml-auto text-gray-400">Rates are Landed Rates per unit. Rank 1 = lowest rate.</span>
            </div>
          )}
        </div>

        {/* ── Detail Note ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
            <span>Detail Note</span>
            <span className="text-gray-400 font-normal normal-case">Detailed justification and observations for management approval</span>
          </div>
          <div className="p-4">
            <TInput value={form.detailNote} onChange={(e) => setField("detailNote", e.target.value)} disabled={isReadOnly}
              placeholder={"ANALYSIS:\n• Item 1: Vendor A lowest at ₹XX/unit — recommend.\n• Item 2: Vendor B lowest — recommend.\n\nRECOMMENDATION: Split PO strategy…"} rows={6} />
          </div>
        </div>

        {/* Header-level error summary */}
        {headErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {headErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Items",    value: form.rows.length },
            { label: "Vendors",  value: piVendors.length },
            { label: "Approved", value: form.rows.reduce((s, r) => s + r.vendors.filter((v) => v.approved).length, 0) },
            { label: "Rejected", value: form.rows.reduce((s, r) => s + r.vendors.filter((v) => v.rejected).length, 0) },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded shadow-sm p-3">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className="text-lg font-bold text-gray-700 font-mono">{s.value}</div>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-400 pb-2">
          Comparison Date is highlighted yellow — it is required before saving. Lock the comparison once finalized to prevent further edits.
        </p>
      </div>
    </Layout>
  );
}
