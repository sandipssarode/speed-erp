import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Paperclip, Wrench, XCircle, Undo2,
} from "lucide-react";

const inputCls = (disabled, error) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm transition-all focus:outline-none
  ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}
  ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white hover:border-gray-300"}`;

function Row({ label, required, error, children, help }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-6">
      <label className={`sm:w-52 sm:pt-2.5 text-sm shrink-0 ${required ? "text-gray-800 font-semibold" : "text-gray-600 font-medium"}`}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex-1 max-w-lg">
        {children}
        {help && !error && <p className="text-xs text-gray-400 mt-1.5">{help}</p>}
        {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} className="shrink-0" />{error}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
        {action}
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

const STATUSES = ["Issued", "Returned", "Cancelled"];
const WO_ACTIVE_STATUSES = ["Open", "In Progress"];
const NOT_DISPOSED = (a) => (a.status || "Active") !== "Decommissioned";

const STATUS_PILL = {
  Issued:    "bg-blue-50 text-blue-700",
  Returned:  "bg-green-50 text-green-700",
  Cancelled: "bg-gray-100 text-gray-500",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  sparePartId: "", transactionDate: todayStr(),
  assetId: "", assetName: "", assetLocation: "",
  linkedJobId: "", linkedJobNo: "",
  linkedWorkOrderId: "", linkedWorkOrderNo: "",
  productId: "", productCode: "", productName: "", unit: "",
  quantityUsed: "", unitCost: "",
  issuedById: "", issuedByName: "",
  receivedById: "", receivedByName: "",
  remarks: "",
  attachmentFileNames: [],
  status: "Issued",
  returnQty: "", returnReason: "", returnedAt: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

export default function SparePartForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const attachRef = useRef(null);

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnForm, setReturnForm] = useState({ qty: "", reason: "" });
  const [returnError, setReturnError] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    Promise.all([
      api.get("/api/spare-parts").catch(() => []),
      api.get("/api/assets").catch(() => []),
      api.get("/api/employees").catch(() => []),
      api.get("/api/product-masters").catch(() => []),
      api.get("/api/job-list").catch(() => []),
      api.get("/api/work-orders").catch(() => []),
    ]).then(([parts, asts, emps, prods, jbs, wos]) => {
      setAllRecords(parts);
      setAssets(asts.filter(NOT_DISPOSED));
      setEmployees(emps.filter(e => !e.isDeactivated && (e.status || "Active") === "Active"));
      setProducts(prods.filter(p => !p.isDeactivated && p.isAsset !== "Yes"));
      setJobs(jbs.filter(j => ["Open", "In Progress"].includes(j.status)));
      setWorkOrders(wos.filter(w => WO_ACTIVE_STATUSES.includes(w.status)));
      if (!isNew && id) {
        const found = parts.find(r => r.id === id);
        if (found) setForm({ ...emptyForm(), ...found });
        else navigate("/asset-management/spare-parts");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const handleAssetChange = (aid) => {
    const a = assets.find(x => x.id === aid);
    setForm(prev => ({ ...prev, assetId: aid, assetName: a?.name || "", assetLocation: a?.locationName || "" }));
    if (errors.assetId) setErrors(p => { const e = { ...p }; delete e.assetId; return e; });
  };

  const employeeDisplayName = (e) => `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.employeeId;

  const handleIssuedByChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, issuedById: eid, issuedByName: e ? employeeDisplayName(e) : "" }));
    if (errors.issuedById) setErrors(p => { const c = { ...p }; delete c.issuedById; return c; });
  };

  const handleReceivedByChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, receivedById: eid, receivedByName: e ? employeeDisplayName(e) : "" }));
  };

  const handleProductChange = (pid) => {
    const p = products.find(x => x.id === pid);
    setForm(prev => ({ ...prev, productId: pid, productCode: p?.productCode || "", productName: p?.productName || "", unit: p?.units || "" }));
    if (errors.productId) setErrors(prevE => { const e = { ...prevE }; delete e.productId; return e; });
  };

  const handleJobChange = (jid) => {
    const j = jobs.find(x => x.id === jid);
    setForm(prev => ({ ...prev, linkedJobId: jid, linkedJobNo: j?.jobId || "" }));
    if (errors.linkedJobId) setErrors(p => { const e = { ...p }; delete e.linkedJobId; return e; });
  };

  const handleWorkOrderChange = (wid) => {
    const w = workOrders.find(x => x.id === wid);
    setForm(prev => ({ ...prev, linkedWorkOrderId: wid, linkedWorkOrderNo: w?.workOrderId || "" }));
    if (errors.linkedWorkOrderId) setErrors(p => { const e = { ...p }; delete e.linkedWorkOrderId; return e; });
  };

  const totalCost = (form.quantityUsed !== "" && form.unitCost !== "" && !isNaN(Number(form.quantityUsed)) && !isNaN(Number(form.unitCost)))
    ? (Number(form.quantityUsed) * Number(form.unitCost)).toFixed(2)
    : "";

  const nextSparePartId = () => {
    const nums = allRecords.map(r => parseInt((r.sparePartId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "SP-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(5, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.transactionDate) e.transactionDate = "Transaction Date is required.";
    else if (f.transactionDate > todayStr()) e.transactionDate = "Transaction Date cannot be in the future.";
    if (!f.assetId) e.assetId = "Asset is required.";
    if (!f.linkedJobId && !f.linkedWorkOrderId) {
      e.linkedJobId = "Link a Job or a Work Order (at least one is required).";
      e.linkedWorkOrderId = "Link a Job or a Work Order (at least one is required).";
    }
    if (!f.productId) e.productId = "Product is required.";
    if (f.quantityUsed === "" || Number(f.quantityUsed) <= 0) e.quantityUsed = "Quantity Used must be greater than zero.";
    if (f.unitCost !== "" && Number(f.unitCost) < 0) e.unitCost = "Unit Cost must be zero or a positive number.";
    if (!f.issuedById) e.issuedById = "Issued By is required.";
    if (!f.status) e.status = "Status is required.";
    return e;
  };

  const persist = async (nextForm, changeNote) => {
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: changeNote || (isNew ? "Record created" : "Record updated") };
    let saved;
    if (isNew) {
      const payload = { ...nextForm, id: Date.now().toString(), sparePartId: nextForm.sparePartId || nextSparePartId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
      saved = await api.post("/api/spare-parts", payload);
    } else {
      const payload = { ...nextForm, updatedAt: now, updatedBy: userName, changelog: [...(nextForm.changelog || []), entry] };
      saved = await api.put(`/api/spare-parts/${id}`, payload);
    }
    setForm({ ...emptyForm(), ...saved });
    setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
    return saved;
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    try {
      const saved = await persist(form);
      setMode("view"); setErrors({});
      showToast("Spare part record saved.");
      if (isNew) navigate(`/asset-management/spare-parts/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/spare-parts"); return; }
    try { const found = await api.get(`/api/spare-parts/${id}`); setForm({ ...emptyForm(), ...found }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (form.status === "Issued" && (form.linkedJobId || form.linkedWorkOrderId)) {
      const [allJobs, allWos] = await Promise.all([
        api.get("/api/job-list").catch(() => []),
        api.get("/api/work-orders").catch(() => []),
      ]);
      const job = allJobs.find(j => j.id === form.linkedJobId);
      const wo = allWos.find(w => w.id === form.linkedWorkOrderId);
      const linkedCompleted = job?.status === "Completed" || wo?.status === "Completed";
      if (linkedCompleted) { showToast("This spare part record cannot be deleted — the linked Job/Work Order is already Completed.", "error"); return; }
    }
    if (!window.confirm(`Delete spare part record "${form.sparePartId}"? This cannot be undone.`)) return;
    try { await api.del(`/api/spare-parts/${id}`); navigate("/asset-management/spare-parts"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const openReturn = () => { setReturnForm({ qty: form.quantityUsed, reason: "" }); setReturnError(""); setReturnOpen(true); };

  const confirmReturn = async () => {
    const qty = Number(returnForm.qty);
    if (returnForm.qty === "" || isNaN(qty) || qty <= 0 || qty > Number(form.quantityUsed)) {
      setReturnError(`Enter a valid return quantity (≤ ${form.quantityUsed}).`); return;
    }
    if (!returnForm.reason.trim()) { setReturnError("A reason for the return is required."); return; }
    const now = new Date().toISOString();
    try {
      await persist({ ...form, status: "Returned", returnQty: returnForm.qty, returnReason: returnForm.reason, returnedAt: now }, `Returned ${returnForm.qty} ${form.unit || ""}: ${returnForm.reason}`.trim());
      setReturnOpen(false); setMode("view"); setErrors({});
      showToast("Spare part returned to store.");
    } catch (err) { showToast(err.message || "Failed to return part.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="w-full space-y-4">

        <button onClick={() => navigate("/asset-management/spare-parts")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Spare Parts
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white shrink-0">
              <Wrench size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Spare Part Issue" : (form.productName ? `${form.sparePartId} — ${form.productName}` : form.sparePartId || "Spare Part")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[form.status] || "bg-white/20 text-white"}`}>{form.status}</span>
                )}
                {isNew && "Issue a spare part against a maintenance Job or Work Order"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}><FileText size={13} /> History</button>
              )}
              {mode === "view" && form.status !== "Cancelled" && (
                <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>
              )}
              {mode === "view" && form.status === "Issued" && (
                <button onClick={openReturn} className={headerBtn}><Undo2 size={13} /> Return Part</button>
              )}
              {mode === "view" && !isNew && (
                <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-red-500/80 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>

          {showChangelog && !isNew && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">History</h3>
              {!form.changelog?.length ? <p className="text-xs text-gray-400">No changes recorded yet.</p> : (
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 text-left"><th className="pb-1.5 font-medium">Date &amp; Time</th><th className="pb-1.5 font-medium">User</th><th className="pb-1.5 font-medium">Changes</th></tr></thead>
                  <tbody>{form.changelog.map((c, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td>
                      <td className="py-1.5 text-gray-600">{c.user}</td>
                      <td className="py-1.5 text-gray-600">{c.changes}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Return Part popup */}
        {returnOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <Undo2 size={15} /> Return Part
            </div>
            <Row label="Return Quantity" required help={`Must be ≤ Quantity Used (${form.quantityUsed}).`}>
              <input type="number" min="0" step="any" max={form.quantityUsed} value={returnForm.qty} onChange={e => setReturnForm(p => ({ ...p, qty: e.target.value }))} className={inputCls(false, false)} />
            </Row>
            <Row label="Reason for Return" required>
              <input value={returnForm.reason} onChange={e => setReturnForm(p => ({ ...p, reason: e.target.value }))} className={inputCls(false, false)} placeholder="e.g. Unused, wrong part ordered" />
            </Row>
            {returnError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{returnError}</p>}
            <div className="flex items-center gap-2.5">
              <button onClick={confirmReturn} className="text-sm px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors">Confirm Return</button>
              <button onClick={() => setReturnOpen(false)} className="text-sm px-5 py-2 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-xl font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Section: Issue Details */}
        <SectionCard title="Issue Details">
          <Row label="Spare Part ID" help="Auto-generated on first save.">
            <input value={form.sparePartId || "Auto (SP-XXXXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Transaction Date" required error={errors.transactionDate}>
            <input type="date" value={form.transactionDate} max={todayStr()} onChange={e => setField("transactionDate", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.transactionDate)} />
          </Row>
          <Row label="Asset" required error={errors.assetId}>
            <select value={form.assetId} onChange={e => handleAssetChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assetId)}>
              <option value="">Select asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetId} — {a.name}</option>)}
            </select>
          </Row>
          {form.assetName && <Row label="Asset Name"><input value={form.assetName} disabled className={inputCls(true, false)} /></Row>}
          {form.assetLocation && <Row label="Location"><input value={form.assetLocation} disabled className={inputCls(true, false)} /></Row>}
          <Row label="Linked Job ID" error={errors.linkedJobId} help="At least one of Linked Job ID or Linked Work Order is required.">
            <select value={form.linkedJobId} onChange={e => handleJobChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.linkedJobId)}>
              <option value="">None</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.jobId} — {j.problemDescription || j.maintenanceTypeName}</option>)}
            </select>
          </Row>
          <Row label="Linked Work Order" error={errors.linkedWorkOrderId}>
            <select value={form.linkedWorkOrderId} onChange={e => handleWorkOrderChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.linkedWorkOrderId)}>
              <option value="">None</option>
              {workOrders.map(w => <option key={w.id} value={w.id}>{w.workOrderId} — {w.productName || w.workOrderType}</option>)}
            </select>
          </Row>
        </SectionCard>

        {/* Section: Part & Quantity */}
        <SectionCard title="Part &amp; Quantity">
          <Row label="Product" required error={errors.productId} help="Consumables, spare parts and materials only.">
            <select value={form.productId} onChange={e => handleProductChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.productId)}>
              <option value="">Select product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.productCode} — {p.productName}</option>)}
            </select>
          </Row>
          {form.unit && <Row label="Unit"><input value={form.unit} disabled className={inputCls(true, false)} /></Row>}
          <Row label="Available Stock" help="Inventory tracking is not yet configured for this product.">
            <input value="—" disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Quantity Used" required error={errors.quantityUsed}>
            <input type="number" min="0" step="any" value={form.quantityUsed} onChange={e => setField("quantityUsed", e.target.value)} disabled={isReadOnly} placeholder="e.g. 2" className={inputCls(isReadOnly, errors.quantityUsed)} />
          </Row>
          <Row label="Unit Cost" error={errors.unitCost} help="Optional — cost per unit at time of issue.">
            <input type="number" min="0" step="any" value={form.unitCost} onChange={e => setField("unitCost", e.target.value)} disabled={isReadOnly} placeholder="e.g. 450.00" className={inputCls(isReadOnly, errors.unitCost)} />
          </Row>
          {totalCost && (
            <Row label="Total Cost">
              <div className="flex items-center px-3.5 py-2.5 text-sm border border-brand-100 bg-brand-50 rounded-xl text-brand-700 font-medium">₹ {totalCost}</div>
            </Row>
          )}
        </SectionCard>

        {/* Section: Handling */}
        <SectionCard title="Handling">
          <Row label="Issued By" required error={errors.issuedById}>
            <select value={form.issuedById} onChange={e => handleIssuedByChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.issuedById)}>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
          <Row label="Received By" help="Optional — technician/operator who physically received the part.">
            <select value={form.receivedById} onChange={e => handleReceivedByChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)}>
              <option value="">None</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
          <Row label="Status" required error={errors.status}>
            <select value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.status)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
          <Row label="Remarks">
            <textarea value={form.remarks ?? ""} onChange={e => setField("remarks", e.target.value)} disabled={isReadOnly} rows={3} placeholder="e.g. replaced worn bearing, emergency issue…" className={inputCls(isReadOnly, false) + " resize-none"} />
          </Row>
        </SectionCard>

        {/* Section: Attachments */}
        <SectionCard title="Attachments">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-sm text-gray-500">
              {form.attachmentFileNames?.length ? `${form.attachmentFileNames.length} file(s) attached` : "No attachments yet."}
            </div>
            {editing && (
              <label className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition-colors">
                <Paperclip size={14} /> Add Files
                <input
                  ref={attachRef} type="file" multiple className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => {
                    const names = Array.from(e.target.files).map(f => f.name);
                    setField("attachmentFileNames", [...(form.attachmentFileNames || []), ...names]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          {form.attachmentFileNames?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {form.attachmentFileNames.map((name, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <span className="flex items-center gap-2"><Paperclip size={13} className="text-gray-400" />{name}</span>
                  {editing && (
                    <button onClick={() => setField("attachmentFileNames", form.attachmentFileNames.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                      <XCircle size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX, JPG, JPEG, PNG — max 10 MB each</p>
        </SectionCard>

        {/* Footer actions */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3 flex-wrap">
            <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all">
              <Save size={15} /> Save
            </button>
            <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors ml-auto">
              Discard
            </button>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields.</p>
              <ul className="text-xs text-red-600 space-y-0.5">{Object.values(errors).map((e, i) => <li key={i}>• {e}</li>)}</ul>
            </div>
          </div>
        )}

        {!isNew && form.createdAt && (
          <p className="text-xs text-gray-400 px-1">
            Created {new Date(form.createdAt).toLocaleString()} by {form.createdBy} · Updated {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}
          </p>
        )}
      </div>
    </Layout>
  );
}
