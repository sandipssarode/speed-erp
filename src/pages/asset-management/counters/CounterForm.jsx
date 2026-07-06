import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Paperclip, Gauge, XCircle, RotateCcw, AlertTriangle,
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

const COUNTER_TYPES = ["Hours", "Odometer", "Cycle Count", "Custom"];
const STATUSES = ["Active", "Inactive", "Reset"];
const NOT_DISPOSED = (a) => (a.status || "Active") !== "Decommissioned";

const STATUS_PILL = {
  Active:   "bg-green-50 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Reset:    "bg-amber-50 text-amber-700",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  counterId: "",
  assetId: "", assetName: "", assetLocation: "",
  counterName: "", counterType: "", unitLabel: "",
  currentReading: "", previousReading: "", previousReadingDate: "",
  readingDate: todayStr(), readingTime: "",
  recordedById: "", recordedByName: "",
  linkedJobId: "", linkedJobNo: "",
  linkedWorkOrderId: "", linkedWorkOrderNo: "",
  thresholdValue: "", alertBeforeValue: "",
  remarks: "",
  attachmentFileNames: [],
  status: "Active",
  readingHistory: [],
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

export default function CounterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const attachRef = useRef(null);

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [originalForm, setOriginalForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ baseline: "", reason: "" });
  const [resetError, setResetError] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    Promise.all([
      api.get("/api/counters").catch(() => []),
      api.get("/api/assets").catch(() => []),
      api.get("/api/employees").catch(() => []),
      api.get("/api/job-list").catch(() => []),
      api.get("/api/work-orders").catch(() => []),
    ]).then(([counters, asts, emps, jbs, wos]) => {
      setAllRecords(counters);
      setAssets(asts.filter(NOT_DISPOSED));
      setEmployees(emps.filter(e => !e.isDeactivated && (e.status || "Active") === "Active"));
      setJobs(jbs);
      setWorkOrders(wos);
      if (!isNew && id) {
        const found = counters.find(r => r.id === id);
        if (found) { setForm({ ...emptyForm(), ...found }); setOriginalForm({ ...emptyForm(), ...found }); }
        else navigate("/asset-management/counters");
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

  const handleRecordedByChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, recordedById: eid, recordedByName: e ? employeeDisplayName(e) : "" }));
    if (errors.recordedById) setErrors(p => { const c = { ...p }; delete c.recordedById; return c; });
  };

  const handleJobChange = (jid) => {
    const j = jobs.find(x => x.id === jid);
    setForm(prev => ({ ...prev, linkedJobId: jid, linkedJobNo: j?.jobId || "" }));
  };

  const handleWorkOrderChange = (wid) => {
    const w = workOrders.find(x => x.id === wid);
    setForm(prev => ({ ...prev, linkedWorkOrderId: wid, linkedWorkOrderNo: w?.workOrderId || "" }));
  };

  const handleCounterTypeChange = (type) => {
    setForm(prev => ({ ...prev, counterType: type, ...(type !== "Custom" ? { unitLabel: "" } : {}) }));
    if (errors.counterType) setErrors(p => { const c = { ...p }; delete c.counterType; return c; });
  };

  const nextCounterId = () => {
    const nums = allRecords.map(r => parseInt((r.counterId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "CNT-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(5, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.assetId) e.assetId = "Asset is required.";
    if (!f.counterName.trim()) e.counterName = "Counter Name is required.";
    else if (allRecords.some(r => r.assetId === f.assetId && r.counterName?.trim().toLowerCase() === f.counterName.trim().toLowerCase() && r.id !== (isNew ? null : id)))
      e.counterName = "This asset already has a counter with this name.";
    if (!f.counterType) e.counterType = "Counter Type is required.";
    if (f.counterType === "Custom" && !f.unitLabel.trim()) e.unitLabel = "Unit Label is required when Counter Type is Custom.";
    else if (f.unitLabel && f.unitLabel.length > 20) e.unitLabel = "Unit Label must be max 20 characters.";
    if (f.currentReading === "" || f.currentReading === null) e.currentReading = "Current Reading is required.";
    else {
      const cur = Number(f.currentReading);
      if (isNaN(cur) || cur < 0) e.currentReading = "Current Reading must be a number ≥ 0.";
      else if (f.previousReading !== "" && cur < Number(f.previousReading))
        e.currentReading = `Current Reading cannot be lower than the Previous Reading (${f.previousReading}). Use "Reset Counter" for rollovers.`;
    }
    if (!f.readingDate) e.readingDate = "Reading Date is required.";
    else {
      if (f.readingDate > todayStr()) e.readingDate = "Reading Date cannot be in the future.";
      else if (f.previousReadingDate && f.readingDate < f.previousReadingDate) e.readingDate = "Reading Date cannot be before the previous reading date.";
    }
    if (!f.recordedById) e.recordedById = "Recorded By is required.";
    if (f.thresholdValue !== "" && f.currentReading !== "" && Number(f.thresholdValue) <= Number(f.currentReading))
      e.thresholdValue = "Threshold Value must be greater than Current Reading.";
    if (!f.status) e.status = "Status is required.";
    return e;
  };

  const persist = async (nextForm, changeNote) => {
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: changeNote || (isNew ? "Record created" : "Record updated") };
    let saved;
    if (isNew) {
      const payload = { ...nextForm, id: Date.now().toString(), counterId: nextForm.counterId || nextCounterId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
      saved = await api.post("/api/counters", payload);
    } else {
      const payload = { ...nextForm, updatedAt: now, updatedBy: userName, changelog: [...(nextForm.changelog || []), entry] };
      saved = await api.put(`/api/counters/${id}`, payload);
    }
    setForm({ ...emptyForm(), ...saved });
    setOriginalForm({ ...emptyForm(), ...saved });
    setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
    return saved;
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }

    // If Current Reading was advanced during this edit, shift it into Previous Reading
    // and log the prior value — this is how "Previous Reading" tracks reading history.
    let next = form;
    if (originalForm && String(originalForm.currentReading) !== String(form.currentReading)) {
      next = {
        ...form,
        previousReading: originalForm.currentReading,
        previousReadingDate: originalForm.readingDate,
        readingHistory: [...(form.readingHistory || []), {
          reading: originalForm.currentReading, date: originalForm.readingDate, recordedBy: originalForm.recordedByName,
        }],
      };
    }

    try {
      await persist(next, `Reading recorded: ${next.currentReading} ${form.unitLabel || form.counterType || ""}`.trim());
      setMode("view"); setErrors({});
      showToast("Counter saved.");
      if (isNew) navigate(`/asset-management/counters/${next.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/counters"); return; }
    try { const found = await api.get(`/api/counters/${id}`); setForm({ ...emptyForm(), ...found }); setOriginalForm({ ...emptyForm(), ...found }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete counter "${form.counterName}"? This cannot be undone.`)) return;
    try { await api.del(`/api/counters/${id}`); navigate("/asset-management/counters"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const openReset = () => { setResetForm({ baseline: "", reason: "" }); setResetError(""); setResetOpen(true); };

  const confirmReset = async () => {
    if (resetForm.baseline === "" || isNaN(Number(resetForm.baseline)) || Number(resetForm.baseline) < 0) {
      setResetError("Enter a valid new baseline reading (≥ 0)."); return;
    }
    if (!resetForm.reason.trim()) { setResetError("A reason for the reset is required."); return; }

    const next = {
      ...form,
      previousReading: form.currentReading,
      previousReadingDate: form.readingDate,
      currentReading: resetForm.baseline,
      readingDate: todayStr(),
      status: "Reset",
      readingHistory: [...(form.readingHistory || []), {
        reading: form.currentReading, date: form.readingDate, recordedBy: form.recordedByName, resetReason: resetForm.reason,
      }],
    };
    try {
      await persist(next, `Reset: ${resetForm.reason} (baseline → ${resetForm.baseline})`);
      setResetOpen(false); setMode("view"); setErrors({});
      showToast("Counter reset.");
    } catch (err) { showToast(err.message || "Failed to reset.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  const thresholdReached = form.thresholdValue !== "" && form.currentReading !== "" && Number(form.currentReading) >= Number(form.thresholdValue);

  return (
    <Layout>
      <div className="w-full space-y-4">

        <button onClick={() => navigate("/asset-management/counters")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Counters
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
          </div>
        )}

        {!isNew && thresholdReached && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border bg-amber-50 border-amber-200 text-amber-700">
            <AlertTriangle size={15} className="shrink-0" />
            Current Reading has reached the Threshold Value ({form.thresholdValue}) — preventive maintenance should be triggered for this asset.
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white shrink-0">
              <Gauge size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Counter" : (form.assetName ? `${form.counterName} — ${form.assetName}` : form.counterId || "Counter")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.counterType && <span>{form.counterType}</span>}
                {!isNew && form.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[form.status] || "bg-white/20 text-white"}`}>
                    {form.status}
                  </span>
                )}
                {isNew && "Record a periodic asset counter reading"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}>
                  <FileText size={13} /> History
                </button>
              )}
              {mode === "view" && (
                <button onClick={() => setMode("edit")} className={headerBtn}>
                  <Edit2 size={13} /> Edit
                </button>
              )}
              {mode === "view" && !isNew && (
                <button onClick={openReset} className={headerBtn}>
                  <RotateCcw size={13} /> Reset Counter
                </button>
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

        {/* Reset Counter popup */}
        {resetOpen && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 text-amber-800 font-semibold text-sm">
              <RotateCcw size={15} /> Reset Counter
            </div>
            <p className="text-xs text-amber-700">
              This zeroes/rebaselines the counter. The current reading ({form.currentReading || "—"}) will be preserved in history.
            </p>
            <Row label="New Baseline Reading" required>
              <input type="number" min="0" step="any" value={resetForm.baseline} onChange={e => setResetForm(p => ({ ...p, baseline: e.target.value }))} className={inputCls(false, false)} placeholder="e.g. 0" />
            </Row>
            <Row label="Reason for Reset" required>
              <input value={resetForm.reason} onChange={e => setResetForm(p => ({ ...p, reason: e.target.value }))} className={inputCls(false, false)} placeholder="e.g. Counter reset after engine overhaul" />
            </Row>
            {resetError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{resetError}</p>}
            <div className="flex items-center gap-2.5">
              <button onClick={confirmReset} className="text-sm px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors">Confirm Reset</button>
              <button onClick={() => setResetOpen(false)} className="text-sm px-5 py-2 border border-amber-300 text-amber-700 hover:bg-amber-100 rounded-xl font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Section: Asset & Counter */}
        <SectionCard title="Asset & Counter">
          <Row label="Counter ID" help="Auto-generated on first save.">
            <input value={form.counterId || "Auto (CNT-XXXXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Asset" required error={errors.assetId}>
            <select value={form.assetId} onChange={e => handleAssetChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assetId)}>
              <option value="">Select asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetId} — {a.name}</option>)}
            </select>
          </Row>
          {form.assetName && (
            <Row label="Asset Name">
              <input value={form.assetName} disabled className={inputCls(true, false)} />
            </Row>
          )}
          {form.assetLocation && (
            <Row label="Location">
              <input value={form.assetLocation} disabled className={inputCls(true, false)} />
            </Row>
          )}
          <Row label="Counter Name" required error={errors.counterName} help="e.g. Running Hours, Cycle Count, Kilometre Reading. Must be unique per asset.">
            <input value={form.counterName} onChange={e => setField("counterName", e.target.value)} disabled={isReadOnly} placeholder="e.g. Running Hours" className={inputCls(isReadOnly, errors.counterName)} />
          </Row>
          <Row label="Counter Type" required error={errors.counterType}>
            <select value={form.counterType} onChange={e => handleCounterTypeChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.counterType)}>
              <option value="">Select type</option>
              {COUNTER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Row>
          {form.counterType === "Custom" && (
            <Row label="Unit Label" required error={errors.unitLabel} help="Max 20 characters — displayed alongside readings.">
              <input value={form.unitLabel} onChange={e => setField("unitLabel", e.target.value)} disabled={isReadOnly} maxLength={20} placeholder="e.g. Shots" className={inputCls(isReadOnly, errors.unitLabel)} />
            </Row>
          )}
        </SectionCard>

        {/* Section: Reading */}
        <SectionCard title="Reading">
          <Row label="Current Reading" required error={errors.currentReading}>
            <input type="number" min="0" step="any" value={form.currentReading} onChange={e => setField("currentReading", e.target.value)} disabled={isReadOnly} placeholder="e.g. 4520.5" className={inputCls(isReadOnly, errors.currentReading)} />
          </Row>
          <Row label="Previous Reading" help="Auto-filled from the last saved reading for this asset and counter.">
            <input value={form.previousReading !== "" ? form.previousReading : "—"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Reading Date" required error={errors.readingDate}>
            <input type="date" value={form.readingDate} max={todayStr()} onChange={e => setField("readingDate", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.readingDate)} />
          </Row>
          <Row label="Reading Time" help="24-hour format — for ordering multiple readings on the same date.">
            <input type="time" value={form.readingTime} onChange={e => setField("readingTime", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Recorded By" required error={errors.recordedById}>
            <select value={form.recordedById} onChange={e => handleRecordedByChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.recordedById)}>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
        </SectionCard>

        {/* Section: Links & Thresholds */}
        <SectionCard title="Links & Thresholds">
          <Row label="Linked Job ID" help="Optional — associates this reading with a maintenance Job.">
            <select value={form.linkedJobId} onChange={e => handleJobChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)}>
              <option value="">None</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.jobId} — {j.problemDescription || j.maintenanceTypeName}</option>)}
            </select>
          </Row>
          <Row label="Linked Work Order" help="Optional — associates this reading with a production Work Order.">
            <select value={form.linkedWorkOrderId} onChange={e => handleWorkOrderChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)}>
              <option value="">None</option>
              {workOrders.map(w => <option key={w.id} value={w.id}>{w.workOrderId} — {w.productName || w.workOrderType}</option>)}
            </select>
          </Row>
          <Row label="Threshold Value" error={errors.thresholdValue} help="Reading at which a PM alert/Job should trigger (e.g. 500 hrs).">
            <input type="number" min="0" step="any" value={form.thresholdValue} onChange={e => setField("thresholdValue", e.target.value)} disabled={isReadOnly} placeholder="e.g. 500" className={inputCls(isReadOnly, errors.thresholdValue)} />
          </Row>
          <Row label="Alert Before Value" help="Advance-warning margin before Threshold Value (e.g. 50 = alert at 450 if threshold is 500).">
            <input type="number" min="0" step="any" value={form.alertBeforeValue} onChange={e => setField("alertBeforeValue", e.target.value)} disabled={isReadOnly} placeholder="e.g. 50" className={inputCls(isReadOnly, false)} />
          </Row>
        </SectionCard>

        {/* Section: Remarks & Status */}
        <SectionCard title="Remarks &amp; Status">
          <Row label="Status" required error={errors.status}>
            <select value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.status)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
          <Row label="Remarks">
            <textarea
              value={form.remarks ?? ""}
              onChange={e => setField("remarks", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="e.g. counter reset after engine overhaul, reading taken at shift end…"
              className={inputCls(isReadOnly, false) + " resize-none"}
            />
          </Row>
        </SectionCard>

        {/* Section: Attachments */}
        <SectionCard title="Attachments">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-sm text-gray-500">
              {form.attachmentFileNames?.length
                ? `${form.attachmentFileNames.length} file(s) attached`
                : "No attachments yet."}
            </div>
            {editing && (
              <label className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition-colors">
                <Paperclip size={14} /> Add Files
                <input
                  ref={attachRef}
                  type="file"
                  multiple
                  className="hidden"
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

        {/* Section: Reading History */}
        {!isNew && form.readingHistory?.length > 0 && (
          <SectionCard title="Reading History">
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-xs min-w-[480px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="text-left pb-2 font-medium">Date</th>
                    <th className="text-left pb-2 font-medium">Reading</th>
                    <th className="text-left pb-2 font-medium">Recorded By</th>
                    <th className="text-left pb-2 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.readingHistory.slice().reverse().map((h, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-2 text-gray-600">{h.date ? new Date(h.date).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="py-2 pr-2 font-medium text-gray-800">{h.reading}{form.unitLabel ? ` ${form.unitLabel}` : ""}</td>
                      <td className="py-2 pr-2 text-gray-600">{h.recordedBy || "—"}</td>
                      <td className="py-2 pr-2 text-gray-500">{h.resetReason ? `Reset: ${h.resetReason}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}

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
