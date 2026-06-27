import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Briefcase, Play, CheckSquare, XCircle, Paperclip,
} from "lucide-react";

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];
const STATUS_OPTIONS   = ["Open", "In Progress", "On Hold", "Completed", "Cancelled"];

const PRIORITY_PILL = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-amber-100 text-amber-700",
  Low:      "bg-green-100 text-green-700",
};

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

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/60">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

// Generate sequential job ID like JOB-000001
const padId = (n) => `JOB-${String(n).padStart(6, "0")}`;

const emptyForm = () => ({
  jobId:               "",
  jobDate:             new Date().toISOString().slice(0, 10),
  assetId:             "",
  assetName:           "",
  assetLocation:       "",
  bom:                 "",
  maintenanceTypeId:   "",
  maintenanceTypeName: "",
  priority:            "",
  estimatedDuration:   "",
  problemDescription:  "",
  assignedToId:        "",
  assignedToName:      "",
  startTime:           "",
  endTime:             "",
  status:              "Open",
  actualDuration:      "",
  workDoneRemarks:     "",
  consumedHoursUpdate: "",
  attachments:         [],
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form) {
  const e = {};
  if (!form.jobDate)              e.jobDate = "Job Date is required.";
  if (!form.assetId)              e.assetId = "Asset is required.";
  if (!form.maintenanceTypeId)    e.maintenanceTypeId = "Maintenance Type is required.";
  if (!form.priority)             e.priority = "Priority is required.";
  if (!form.problemDescription.trim()) e.problemDescription = "Problem Description is required.";
  if (!form.assignedToId)         e.assignedToId = "Assigned To is required.";
  if (!form.startTime)            e.startTime = "Start Time is required.";
  if (form.endTime && form.startTime && form.endTime < form.startTime)
    e.endTime = "End Time must be after Start Time.";
  if (form.status === "Completed" && !form.workDoneRemarks?.trim())
    e.workDoneRemarks = "Work Done Remarks are required when completing a job.";
  return e;
}

export default function JobForm() {
  const navigate   = useNavigate();
  const { id }     = useParams();
  const [searchParams] = useSearchParams();
  const isNew      = !id;

  const [mode, setMode]               = useState(isNew ? "new" : "view");
  const [form, setForm]               = useState(emptyForm());
  const [errors, setErrors]           = useState({});
  const [toast, setToast]             = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allJobs, setAllJobs]         = useState([]);
  const [assets, setAssets]           = useState([]);
  const [maintenanceTypes, setMaintenanceTypes] = useState([]);
  const [employees, setEmployees]     = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";
  const editing    = mode === "new" || mode === "edit";
  const isCompleting = form.status === "Completed";

  useEffect(() => {
    Promise.all([
      api.get("/api/job-list"),
      api.get("/api/assets"),
      api.get("/api/maintenance-types"),
      api.get("/api/employees"),
    ]).then(([jobs, assetList, mtList, empList]) => {
      setAllJobs(jobs);
      setAssets(assetList.filter(a => a.status === "Active" || a.status === "Under Maintenance"));
      setMaintenanceTypes(mtList);
      setEmployees(empList.filter(e => !e.isDeactivated));

      if (!isNew && id) {
        const found = jobs.find(r => r.id === id);
        if (found) {
          setForm(found);
          // If ?complete=1 query param — jump straight to edit in completing mode
          if (searchParams.get("complete") === "1") {
            setMode("edit");
          }
        } else {
          navigate("/asset-management/job-list");
        }
      } else if (isNew) {
        // Auto-generate sequential Job ID
        const maxNum = jobs.reduce((max, j) => {
          const n = parseInt((j.jobId || "").replace("JOB-", ""), 10);
          return isNaN(n) ? max : Math.max(max, n);
        }, 0);
        setForm(prev => ({ ...prev, jobId: padId(maxNum + 1) }));
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleAssetChange = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    setForm(prev => ({
      ...prev,
      assetId,
      assetName:     asset?.name || "",
      assetLocation: asset?.locationName || "",
    }));
    if (errors.assetId) setErrors(prev => { const e = { ...prev }; delete e.assetId; return e; });
  };

  const handleMaintenanceTypeChange = (typeId) => {
    const mt = maintenanceTypes.find(t => t.id === typeId);
    setForm(prev => ({
      ...prev,
      maintenanceTypeId:   typeId,
      maintenanceTypeName: mt?.maintenanceName || "",
      priority:            mt?.priority || prev.priority,
      estimatedDuration:   mt?.duration != null ? String(mt.duration) : prev.estimatedDuration,
    }));
    if (errors.maintenanceTypeId) setErrors(prev => { const e = { ...prev }; delete e.maintenanceTypeId; return e; });
  };

  const handleAssignedToChange = (empId) => {
    const emp = employees.find(e => e.id === empId);
    setForm(prev => ({
      ...prev,
      assignedToId:   empId,
      assignedToName: emp ? `${emp.firstName || ""} ${emp.lastName || ""}`.trim() : "",
    }));
    if (errors.assignedToId) setErrors(prev => { const e = { ...prev }; delete e.assignedToId; return e; });
  };

  const handleSave = async (overrideStatus) => {
    const saveForm = overrideStatus ? { ...form, status: overrideStatus } : form;
    const errs = validate(saveForm);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    const now = new Date().toISOString();
    const userName = user.name || user.fullName || "System";
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: `Status: ${saveForm.status}` };
    try {
      let saved;
      if (isNew) {
        saved = await api.post("/api/job-list", { ...saveForm, id: Date.now().toString(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] });
      } else {
        saved = await api.put(`/api/job-list/${id}`, { ...saveForm, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), entry] });
      }
      setForm(saved);
      setAllJobs(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Job saved successfully.");
      if (isNew) navigate(`/asset-management/job-list/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/job-list"); return; }
    try { const found = await api.get(`/api/job-list/${id}`); setForm(found); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete job "${form.jobId}"? This cannot be undone.`)) return;
    try { await api.del(`/api/job-list/${id}`); navigate("/asset-management/job-list"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  const lifecycleActions = () => {
    if (!editing) return null;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {form.status === "Open" && (
          <button type="button" onClick={() => handleSave("In Progress")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
            <Play size={12} /> Start Job
          </button>
        )}
        {form.status === "In Progress" && (
          <button type="button" onClick={() => { setField("status", "Completed"); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
            <CheckSquare size={12} /> Mark Complete
          </button>
        )}
        {(form.status === "Open" || form.status === "In Progress" || form.status === "On Hold") && (
          <button type="button" onClick={() => handleSave("Cancelled")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
            <XCircle size={12} /> Cancel Job
          </button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">
        <button onClick={() => navigate("/asset-management/job-list")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Job List
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {!isNew && form.jobId ? form.jobId.slice(4, 7) : <Briefcase size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Job" : (form.assetName ? `${form.jobId} — ${form.assetName}` : form.jobId || "Job")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.maintenanceTypeName && <span>{form.maintenanceTypeName}</span>}
                {!isNew && form.priority && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_PILL[form.priority] || "bg-white/20 text-white"}`}>
                    {form.priority}
                  </span>
                )}
                {isNew && "Raise a new maintenance job for an asset"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}><FileText size={13} /> History</button>}
              {mode === "view" && <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>}
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

        {/* Section: Job Details */}
        <SectionCard title="Job Details">
          <Row label="Job ID" help="Auto-generated on first save.">
            <input value={form.jobId} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Job Date" required error={errors.jobDate}>
            <input type="date" value={form.jobDate} onChange={e => setField("jobDate", e.target.value)} disabled={isReadOnly} max={new Date().toISOString().slice(0,10)} className={inputCls(isReadOnly, errors.jobDate)} />
          </Row>
          <Row label="Asset" required error={errors.assetId}>
            <select value={form.assetId} onChange={e => handleAssetChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assetId)}>
              <option value="">Select Asset</option>
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
          <Row label="BOM">
            <input value={form.bom} onChange={e => setField("bom", e.target.value)} disabled={isReadOnly} placeholder="e.g. BOM-001" className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Maintenance Type" required error={errors.maintenanceTypeId}>
            <select value={form.maintenanceTypeId} onChange={e => handleMaintenanceTypeChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.maintenanceTypeId)}>
              <option value="">Select Maintenance Type</option>
              {maintenanceTypes.map(t => <option key={t.id} value={t.id}>{t.maintenanceName}</option>)}
            </select>
          </Row>
          <Row label="Problem Description" required error={errors.problemDescription}>
            <textarea value={form.problemDescription} onChange={e => setField("problemDescription", e.target.value)} disabled={isReadOnly} rows={3} placeholder="Describe the fault, breakdown or maintenance task…" className={inputCls(isReadOnly, errors.problemDescription) + " resize-none"} />
          </Row>
        </SectionCard>

        {/* Section: Schedule & Assignment */}
        <SectionCard title="Schedule &amp; Assignment">
          <Row label="Priority" required error={errors.priority} help="Auto-filled from Maintenance Type — editable.">
            <select value={form.priority} onChange={e => setField("priority", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.priority)}>
              <option value="">Select Priority</option>
              {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Row>
          <Row label="Assigned To" required error={errors.assignedToId}>
            <select value={form.assignedToId} onChange={e => handleAssignedToChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assignedToId)}>
              <option value="">Select Employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
            </select>
          </Row>
          <Row label="Start Time" required error={errors.startTime}>
            <input type="datetime-local" value={form.startTime} onChange={e => setField("startTime", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.startTime)} />
          </Row>
          <Row label="End Time" error={errors.endTime}>
            <input type="datetime-local" value={form.endTime} onChange={e => setField("endTime", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.endTime)} />
          </Row>
          <Row label="Estimated Duration (hrs)" help="Auto-suggested from Maintenance Type — editable.">
            <input type="number" value={form.estimatedDuration} onChange={e => setField("estimatedDuration", e.target.value)} disabled={isReadOnly} placeholder="e.g. 4" min={0} className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Status" required>
            <select value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
        </SectionCard>

        {/* Section: Completion Details (always shown, fields conditional) */}
        <SectionCard title="Completion Details">
          <Row label="Actual Duration (hrs)" help={isCompleting ? "Enter actual hours taken to complete." : "Fill when job is completed."}>
            <input type="number" value={form.actualDuration} onChange={e => setField("actualDuration", e.target.value)} disabled={isReadOnly || !isCompleting} placeholder="e.g. 5.5" min={0} className={inputCls(isReadOnly || !isCompleting, false)} />
          </Row>
          <Row label="Work Done Remarks" required={isCompleting} error={errors.workDoneRemarks} help="Mandatory when status = Completed.">
            <textarea value={form.workDoneRemarks} onChange={e => setField("workDoneRemarks", e.target.value)} disabled={isReadOnly || !isCompleting} rows={3} placeholder="Describe the work performed, parts replaced, resolution…" className={inputCls(isReadOnly || !isCompleting, errors.workDoneRemarks) + " resize-none"} />
          </Row>
          <Row label="Consumed Hours Update" help="Current asset running hours — updates Asset Master on completion.">
            <input type="number" value={form.consumedHoursUpdate} onChange={e => setField("consumedHoursUpdate", e.target.value)} disabled={isReadOnly || !isCompleting} placeholder="e.g. 4520" min={0} className={inputCls(isReadOnly || !isCompleting, false)} />
          </Row>
        </SectionCard>

        {/* Section: Attachments */}
        <SectionCard title="Attachments">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-sm text-gray-500">
              {form.attachments?.length
                ? `${form.attachments.length} file(s) attached`
                : "No attachments yet."}
            </div>
            {editing && (
              <label className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition-colors">
                <Paperclip size={14} /> Add Files
                <input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={e => {
                    const names = Array.from(e.target.files).map(f => f.name);
                    setField("attachments", [...(form.attachments || []), ...names]);
                  }} />
              </label>
            )}
          </div>
          {form.attachments?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {form.attachments.map((name, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <span className="flex items-center gap-2"><Paperclip size={13} className="text-gray-400" />{name}</span>
                  {editing && (
                    <button onClick={() => setField("attachments", form.attachments.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                      <XCircle size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* Footer actions */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3 flex-wrap">
            <button onClick={() => handleSave()} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all">
              <Save size={15} /> Save Job
            </button>
            {lifecycleActions()}
            <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors ml-auto">
              Cancel
            </button>
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



