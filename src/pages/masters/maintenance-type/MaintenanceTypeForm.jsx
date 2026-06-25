import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft, Wrench } from "lucide-react";

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

const inputCls = (disabled, error) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm transition-all focus:outline-none
  ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}
  ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white hover:border-gray-300"}`;

// Left-aligned label row
function Row({ label, required, error, children, help }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-6">
      <label className={`sm:w-48 sm:pt-2.5 text-sm shrink-0 ${required ? "text-gray-800 font-semibold" : "text-gray-600 font-medium"}`}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex-1 max-w-md">
        {children}
        {help && !error && <p className="text-xs text-gray-400 mt-1.5">{help}</p>}
        {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} className="shrink-0" />{error}</p>}
      </div>
    </div>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────
const emptyForm = () => ({
  typeId:          `MT-${Date.now().toString().slice(-5)}`,
  maintenanceName: "",
  priority:        "",
  duration:        "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.typeId.trim())
    e.typeId = "Type ID is required.";
  else if (allRecords.some(r =>
    r.typeId?.trim().toLowerCase() === form.typeId.trim().toLowerCase() &&
    r.id !== editingId
  ))
    e.typeId = "Type ID already exists.";
  if (!form.maintenanceName.trim()) e.maintenanceName = "Maintenance Name is a required field.";
  if (!form.priority) e.priority = "Priority is a required field.";
  if (form.duration !== "" && (isNaN(Number(form.duration)) || Number(form.duration) < 0))
    e.duration = "Duration must be a positive number.";
  return e;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function MaintenanceTypeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode]         = useState(isNew ? "new" : "view");
  const [form, setForm]         = useState(emptyForm());
  const [errors, setErrors]     = useState({});
  const [toast, setToast]       = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    api.get("/api/maintenance-types").then(list => {
      setAllRecords(list);
      if (!isNew && id) {
        const found = list.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/maintenance-type");
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

  const handleSave = async () => {
    const errs = validate(form, allRecords, isNew ? null : id);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
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
        saved = await api.post("/api/maintenance-types", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/maintenance-types/${id}`, payload);
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view");
      setErrors({});
      showToast("Maintenance Type saved successfully.");
      if (isNew) navigate(`/masters/maintenance-type/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/maintenance-type"); return; }
    try {
      const found = await api.get(`/api/maintenance-types/${id}`);
      setForm(found);
    } catch { /* keep current */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete maintenance type "${form.maintenanceName}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/maintenance-types/${id}`);
      navigate("/masters/maintenance-type");
    } catch (err) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">

        <button onClick={() => navigate("/masters/maintenance-type")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Maintenance Type
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white font-bold shrink-0">
              {!isNew && form.maintenanceName ? form.maintenanceName.slice(0, 2).toUpperCase() : <Wrench size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{isNew ? "New Maintenance Type" : (form.maintenanceName || "Maintenance Type")}</h1>
              <p className="text-sm text-white/70 mt-0.5">{isNew ? "Add a new maintenance type to the master" : <span className="font-mono">{form.typeId}</span>}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {!isNew && <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}><FileText size={13} /> History</button>}
              {mode === "view" && <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>}
              {mode === "view" && !isNew && <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-red-500/80 transition-colors"><Trash2 size={13} /> Delete</button>}
            </div>
          </div>

          {showChangelog && !isNew && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">History</h3>
              {!form.changelog?.length ? <p className="text-xs text-gray-400">No changes recorded yet.</p> : (
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 text-left"><th className="pb-1.5 font-medium">Date &amp; Time</th><th className="pb-1.5 font-medium">User</th><th className="pb-1.5 font-medium">Action</th></tr></thead>
                  <tbody>{form.changelog.map((c, i) => (<tr key={i} className="border-t border-gray-100"><td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td><td className="py-1.5 text-gray-600">{c.user}</td><td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[11px] ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-brand-50 text-brand-600"}`}>{c.action}</span></td></tr>))}</tbody>
                </table>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-7 space-y-6">
            <Row label="Type ID" required error={errors.typeId} help={isNew ? "Auto-suggested — you may edit before saving; cannot be changed later." : undefined}>
              <input value={form.typeId} onChange={e => setField("typeId", e.target.value.toUpperCase())} disabled={isReadOnly || !isNew} placeholder="e.g. MT-001" maxLength={20} className={inputCls(isReadOnly || !isNew, errors.typeId)} />
            </Row>
            <Row label="Maintenance Name" required error={errors.maintenanceName}>
              <input value={form.maintenanceName} onChange={e => setField("maintenanceName", e.target.value)} disabled={isReadOnly} placeholder="e.g. Preventive Maintenance" className={inputCls(isReadOnly, errors.maintenanceName)} />
            </Row>
            <Row label="Priority" required error={errors.priority}>
              <select value={form.priority} onChange={e => setField("priority", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.priority)}>
                <option value="">Select Priority</option>
                {PRIORITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Row>
            <Row label="Duration (hours)" error={errors.duration}>
              <input type="number" value={form.duration} onChange={e => setField("duration", e.target.value)} disabled={isReadOnly} placeholder="e.g. 4" className={inputCls(isReadOnly, errors.duration)} />
            </Row>
          </div>

          {/* Footer actions */}
          {editing && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
              <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all"><Save size={15} /> Save Maintenance Type</button>
              <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors">Cancel</button>
            </div>
          )}
        </div>

        {!isNew && form.createdAt && (
          <p className="text-xs text-gray-400 px-1">
            Created {new Date(form.createdAt).toLocaleString()} by {form.createdBy} · Updated {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}
          </p>
        )}
      </div>
    </Layout>
  );
}
