import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  CalendarClock, Zap,
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

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const FREQUENCY_TYPES = ["Daily", "Weekly", "Monthly", "Quarterly", "Half-Yearly", "Yearly", "Hour-Based"];
const STATUSES = ["Active", "Inactive"];
const NOT_DISPOSED = (a) => (a.status || "Active") !== "Decommissioned";

const STATUS_PILL = { Active: "bg-green-50 text-green-700", Inactive: "bg-gray-100 text-gray-600" };

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);

const calcNextDue = (lastDoneDate, frequencyType, frequencyValue) => {
  if (!lastDoneDate || frequencyType === "Hour-Based" || !frequencyType) return "";
  const n = Number(frequencyValue);
  if (!n || n <= 0) return "";
  const d = new Date(lastDoneDate + "T00:00:00");
  switch (frequencyType) {
    case "Daily":       d.setDate(d.getDate() + n); break;
    case "Weekly":      d.setDate(d.getDate() + n * 7); break;
    case "Monthly":     d.setMonth(d.getMonth() + n); break;
    case "Quarterly":   d.setMonth(d.getMonth() + n * 3); break;
    case "Half-Yearly": d.setMonth(d.getMonth() + n * 6); break;
    case "Yearly":      d.setFullYear(d.getFullYear() + n); break;
    default: return "";
  }
  return d.toISOString().slice(0, 10);
};

const emptyForm = () => ({
  planId: "", planName: "",
  assetId: "", assetName: "",
  maintenanceTypeId: "", maintenanceTypeName: "",
  priority: "",
  frequencyType: "", frequencyValue: "", hourTrigger: "",
  lastDoneDate: "", nextDueDate: "",
  assignedToId: "", assignedToName: "",
  alertBeforeDays: "",
  autoCreateJob: false,
  status: "Active",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

export default function MaintenancePlanForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [jobs, setJobs] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    Promise.all([
      api.get("/api/maintenance-plans").catch(() => []),
      api.get("/api/assets").catch(() => []),
      api.get("/api/employees").catch(() => []),
      api.get("/api/maintenance-types").catch(() => []),
      api.get("/api/job-list").catch(() => []),
    ]).then(([plans, asts, emps, mts, jbs]) => {
      setAllRecords(plans);
      setAssets(asts.filter(NOT_DISPOSED));
      setEmployees(emps.filter(e => !e.isDeactivated && (e.status || "Active") === "Active"));
      setMaintenanceTypes(mts);
      setJobs(jbs);
      if (!isNew && id) {
        const found = plans.find(r => r.id === id);
        if (found) setForm({ ...emptyForm(), ...found });
        else navigate("/asset-management/maintenance-plan");
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
    setForm(prev => ({ ...prev, assetId: aid, assetName: a?.name || "" }));
    if (errors.assetId) setErrors(p => { const e = { ...p }; delete e.assetId; return e; });
  };

  const employeeDisplayName = (e) => `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.employeeId;

  const handleAssignedToChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, assignedToId: eid, assignedToName: e ? employeeDisplayName(e) : "" }));
    if (errors.assignedToId) setErrors(p => { const c = { ...p }; delete c.assignedToId; return c; });
  };

  const handleMaintenanceTypeChange = (mtid) => {
    const mt = maintenanceTypes.find(x => x.id === mtid);
    setForm(prev => ({ ...prev, maintenanceTypeId: mtid, maintenanceTypeName: mt?.maintenanceName || "", priority: mt?.priority || prev.priority }));
    if (errors.maintenanceTypeId) setErrors(p => { const c = { ...p }; delete c.maintenanceTypeId; return c; });
  };

  const recalcNextDue = (patch) => {
    setForm(prev => {
      const next = { ...prev, ...patch };
      const auto = calcNextDue(next.lastDoneDate, next.frequencyType, next.frequencyValue);
      return auto ? { ...next, nextDueDate: auto } : next;
    });
  };

  const handleFrequencyTypeChange = (type) => {
    if (errors.frequencyType) setErrors(p => { const c = { ...p }; delete c.frequencyType; return c; });
    recalcNextDue({ frequencyType: type, ...(type === "Hour-Based" ? { frequencyValue: "" } : { hourTrigger: "" }) });
  };

  const nextPlanId = () => {
    const nums = allRecords.map(r => parseInt((r.planId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "MP-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.planName.trim()) e.planName = "Plan Name is required.";
    if (!f.assetId) e.assetId = "Asset is required.";
    if (!f.maintenanceTypeId) e.maintenanceTypeId = "Maintenance Type is required.";
    if (!f.priority) e.priority = "Priority is required.";
    if (!f.frequencyType) e.frequencyType = "Frequency Type is required.";
    if (f.frequencyType && f.frequencyType !== "Hour-Based") {
      if (!f.frequencyValue || Number(f.frequencyValue) <= 0 || !Number.isInteger(Number(f.frequencyValue)))
        e.frequencyValue = "Frequency Value is required and must be a positive whole number.";
    }
    if (f.frequencyType === "Hour-Based") {
      if (!f.hourTrigger || Number(f.hourTrigger) <= 0 || !Number.isInteger(Number(f.hourTrigger)))
        e.hourTrigger = "Hour Trigger is required and must be a positive whole number.";
    }
    if (!f.assignedToId) e.assignedToId = "Assigned To is required.";
    if (f.alertBeforeDays !== "" && (Number(f.alertBeforeDays) <= 0 || !Number.isInteger(Number(f.alertBeforeDays))))
      e.alertBeforeDays = "Alert Before must be a positive whole number.";
    if (!f.status) e.status = "Status is required.";
    return e;
  };

  const persist = async (nextForm, changeNote) => {
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: changeNote || (isNew ? "Record created" : "Record updated") };
    let saved;
    if (isNew) {
      const payload = { ...nextForm, id: Date.now().toString(), planId: nextForm.planId || nextPlanId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
      saved = await api.post("/api/maintenance-plans", payload);
    } else {
      const payload = { ...nextForm, updatedAt: now, updatedBy: userName, changelog: [...(nextForm.changelog || []), entry] };
      saved = await api.put(`/api/maintenance-plans/${id}`, payload);
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
      showToast("Maintenance Plan saved.");
      if (isNew) navigate(`/asset-management/maintenance-plan/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/maintenance-plan"); return; }
    try { const found = await api.get(`/api/maintenance-plans/${id}`); setForm({ ...emptyForm(), ...found }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    const referenced = jobs.some(j => j.planId === id);
    if (referenced) { showToast("This plan cannot be deleted — one or more Job List records reference it.", "error"); return; }
    if (!window.confirm(`Delete maintenance plan "${form.planName}"? This cannot be undone.`)) return;
    try { await api.del(`/api/maintenance-plans/${id}`); navigate("/asset-management/maintenance-plan"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const handleGenerateJobNow = async () => {
    if (!window.confirm(`Create an immediate Job List entry for "${form.planName}"?`)) return;
    try {
      const jobList = await api.get("/api/job-list").catch(() => []);
      const nums = jobList.map(j => parseInt((j.jobId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
      const jobId = "JOB-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(6, "0");
      const now = new Date().toISOString();
      const jobPayload = {
        id: Date.now().toString(), jobId,
        jobDate: todayStr(),
        assetId: form.assetId, assetName: form.assetName, assetLocation: "",
        bom: "",
        maintenanceTypeId: form.maintenanceTypeId, maintenanceTypeName: form.maintenanceTypeName,
        priority: form.priority,
        estimatedDuration: "",
        problemDescription: `Preventive maintenance — ${form.planName}`,
        assignedToId: form.assignedToId, assignedToName: form.assignedToName,
        startTime: nowLocal(), endTime: "",
        status: "Open", actualDuration: "", workDoneRemarks: "", consumedHoursUpdate: "",
        attachments: [],
        planId: form.id,
        createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName,
        changelog: [{ timestamp: now, user: userName, action: "Created", changes: `Generated from Maintenance Plan ${form.planId}` }],
      };
      const savedJob = await api.post("/api/job-list", jobPayload);
      setJobs(prev => [...prev, savedJob]);
      showToast(`Job ${savedJob.jobId} created.`);
    } catch (err) { showToast(err.message || "Failed to generate job.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="w-full space-y-4">

        <button onClick={() => navigate("/asset-management/maintenance-plan")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Maintenance Plan
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
              <CalendarClock size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Maintenance Plan" : (form.planName || form.planId || "Maintenance Plan")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.assetName && <span>{form.assetName}</span>}
                {!isNew && form.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[form.status] || "bg-white/20 text-white"}`}>{form.status}</span>
                )}
                {isNew && "Create a recurring preventive maintenance schedule"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}><FileText size={13} /> History</button>
              )}
              {mode === "view" && (
                <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>
              )}
              {mode === "view" && !isNew && (
                <button onClick={handleGenerateJobNow} className={headerBtn}><Zap size={13} /> Generate Job Now</button>
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

        {/* Section: Plan Details */}
        <SectionCard title="Plan Details">
          <Row label="Plan ID" help="Auto-generated on first save.">
            <input value={form.planId || "Auto (MP-XXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Plan Name" required error={errors.planName} help="e.g. Monthly Lubrication — CNC Machine 1">
            <input value={form.planName} onChange={e => setField("planName", e.target.value)} disabled={isReadOnly} placeholder="e.g. Monthly Lubrication — CNC Machine 1" className={inputCls(isReadOnly, errors.planName)} />
          </Row>
          <Row label="Asset" required error={errors.assetId}>
            <select value={form.assetId} onChange={e => handleAssetChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assetId)}>
              <option value="">Select asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetId} — {a.name}</option>)}
            </select>
          </Row>
          {form.assetName && <Row label="Asset Name"><input value={form.assetName} disabled className={inputCls(true, false)} /></Row>}
          <Row label="Maintenance Type" required error={errors.maintenanceTypeId}>
            <select value={form.maintenanceTypeId} onChange={e => handleMaintenanceTypeChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.maintenanceTypeId)}>
              <option value="">Select type</option>
              {maintenanceTypes.map(mt => <option key={mt.id} value={mt.id}>{mt.maintenanceName}</option>)}
            </select>
          </Row>
          <Row label="Priority" required error={errors.priority} help="Auto-filled from Maintenance Type — editable for this plan.">
            <select value={form.priority} onChange={e => setField("priority", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.priority)}>
              <option value="">Select priority</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Row>
        </SectionCard>

        {/* Section: Frequency & Schedule */}
        <SectionCard title="Frequency &amp; Schedule">
          <Row label="Frequency Type" required error={errors.frequencyType}>
            <select value={form.frequencyType} onChange={e => handleFrequencyTypeChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.frequencyType)}>
              <option value="">Select frequency</option>
              {FREQUENCY_TYPES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Row>
          {form.frequencyType && form.frequencyType !== "Hour-Based" && (
            <Row label="Frequency Value" required error={errors.frequencyValue} help={`e.g. ${form.frequencyType} + 3 = every 3 ${form.frequencyType.toLowerCase()} interval(s).`}>
              <input type="number" min="1" step="1" value={form.frequencyValue} onChange={e => recalcNextDue({ frequencyValue: e.target.value })} disabled={isReadOnly} placeholder="e.g. 3" className={inputCls(isReadOnly, errors.frequencyValue)} />
            </Row>
          )}
          {form.frequencyType === "Hour-Based" && (
            <Row label="Hour Trigger" required error={errors.hourTrigger} help="Consumed Hours threshold on Asset Master that triggers this maintenance.">
              <input type="number" min="1" step="1" value={form.hourTrigger} onChange={e => setField("hourTrigger", e.target.value)} disabled={isReadOnly} placeholder="e.g. 500" className={inputCls(isReadOnly, errors.hourTrigger)} />
            </Row>
          )}
          <Row label="Last Done Date" help="Used with Frequency to auto-calculate Next Due Date.">
            <input type="date" value={form.lastDoneDate} max={todayStr()} onChange={e => recalcNextDue({ lastDoneDate: e.target.value })} disabled={isReadOnly} className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Next Due Date" help={form.frequencyType === "Hour-Based" ? "Not applicable for Hour-Based plans — driven by Consumed Hours instead." : "Auto-calculated — editable to override manually."}>
            <input type="date" value={form.nextDueDate} onChange={e => setField("nextDueDate", e.target.value)} disabled={isReadOnly || form.frequencyType === "Hour-Based"} className={inputCls(isReadOnly || form.frequencyType === "Hour-Based", false)} />
          </Row>
        </SectionCard>

        {/* Section: Assignment & Alerts */}
        <SectionCard title="Assignment &amp; Alerts">
          <Row label="Assigned To" required error={errors.assignedToId} help="Default technician for Job List entries created from this plan.">
            <select value={form.assignedToId} onChange={e => handleAssignedToChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assignedToId)}>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
          <Row label="Alert Before (Days)" error={errors.alertBeforeDays} help="Advance reminder before Next Due Date.">
            <input type="number" min="1" step="1" value={form.alertBeforeDays} onChange={e => setField("alertBeforeDays", e.target.value)} disabled={isReadOnly} placeholder="e.g. 7" className={inputCls(isReadOnly, errors.alertBeforeDays)} />
          </Row>
          <Row label="Auto-Create Job" help="ON = system creates a Job automatically when due. OFF = alert only, Job created manually.">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={form.autoCreateJob} onChange={e => setField("autoCreateJob", e.target.checked)} disabled={isReadOnly} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-400" />
              <span className="text-sm text-gray-600">{form.autoCreateJob ? "Enabled" : "Disabled"}</span>
            </label>
          </Row>
          <Row label="Status" required error={errors.status}>
            <select value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.status)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
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
