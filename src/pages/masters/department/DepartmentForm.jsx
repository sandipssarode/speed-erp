import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, X, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";

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

const inputBase = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-violet-400"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

function TInput({ value, onChange, disabled, placeholder, maxLength, error }) {
  return <input type="text" value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} maxLength={maxLength} className={inputBase(disabled, error)} />;
}

function nextDeptCode(records) {
  const nums = records.map(r => { const m = (r.departmentCode || "").match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0; });
  return `DEPT-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

const emptyForm = () => ({
  departmentCode: "",
  departmentName: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form) {
  const e = {};
  if (!form.departmentName?.trim()) e.departmentName = "Department Name is required.";
  return e;
}

export default function DepartmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    api.get("/api/departments").then(list => {
      setAllRecords(list);
      if (isNew) {
        setForm(prev => ({ ...prev, departmentCode: nextDeptCode(list) }));
      } else if (id) {
        const found = list.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/department");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => { setForm(prev => ({ ...prev, [key]: value })); if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; }); };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    const now = new Date().toISOString();
    const userName = user.name || user.fullName || "System";
    const changeEntry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };
    try {
      let saved;
      if (isNew) {
        const payload = { ...form, id: Date.now().toString(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [changeEntry] };
        saved = await api.post("/api/departments", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/departments/${id}`, payload);
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Department saved successfully.");
      if (isNew) navigate(`/masters/department/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/department"); return; }
    try { const found = await api.get(`/api/departments/${id}`); setForm(found); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete department "${form.departmentName}"? This cannot be undone.`)) return;
    try { await api.del(`/api/departments/${id}`); navigate("/masters/department"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  return (
    <Layout>
      <div className="space-y-3 max-w-3xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Masters</span><ChevronRight size={12} />
          <button onClick={() => navigate("/masters/department")} className="hover:text-violet-500 transition-colors">Department</button>
          {form.departmentCode && <><ChevronRight size={12} /><span className="text-violet-600 font-medium">{form.departmentCode}</span></>}
        </div>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <button onClick={() => navigate("/masters/department")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"><ArrowLeft size={13} /> Back</button>
          {mode === "view" && <button onClick={() => setMode("edit")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium"><Edit2 size={13} /> Edit</button>}
          {(mode === "new" || mode === "edit") && (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"><Save size={13} /> Save</button>
              <button onClick={handleDiscard} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"><X size={13} /> Discard</button>
            </>
          )}
          {mode === "view" && !isNew && <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium"><Trash2 size={13} /> Delete</button>}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setShowChangelog(!showChangelog)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${showChangelog ? "border-blue-300 bg-blue-50 text-violet-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <FileText size={13} /> Changelog
          </button>
          {form.updatedAt && <div className="ml-auto text-xs text-gray-400 text-right"><span>Updated: {new Date(form.updatedAt).toLocaleString()}</span><span className="ml-2">by {form.updatedBy}</span></div>}
        </div>

        {showChangelog && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText size={14} /> Audit Log — {form.departmentCode || "New"}</h3>
            {!form.changelog?.length ? <p className="text-xs text-gray-400 py-4 text-center">No changes recorded yet.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200"><th className="text-left pb-2 text-gray-500 font-medium">Date & Time</th><th className="text-left pb-2 text-gray-500 font-medium">User</th><th className="text-left pb-2 text-gray-500 font-medium">Action</th><th className="text-left pb-2 text-gray-500 font-medium">Details</th></tr></thead>
                <tbody>{form.changelog.map((c, i) => (<tr key={i} className="border-b border-gray-50"><td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td><td className="py-1.5 text-gray-600">{c.user}</td><td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-violet-600"}`}>{c.action}</span></td><td className="py-1.5 text-gray-600">{c.changes}</td></tr>))}</tbody>
              </table>
            )}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-gradient-to-r from-violet-900 to-violet-700 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.departmentCode || "NEW DEPARTMENT"}</span>
            <span className="text-blue-200 text-sm">{form.departmentName || "—"}</span>
          </div>
          <div className="p-5">
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Department Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Department Code">
                  <TInput value={form.departmentCode} disabled={true} placeholder="Auto-generated" />
                </Field>
                <Field label="Department Name" required error={errors.departmentName} className="sm:col-span-1 lg:col-span-2">
                  <TInput value={form.departmentName} onChange={e => setField("departmentName", e.target.value)} disabled={isReadOnly} placeholder="e.g. Purchase" error={errors.departmentName} />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">{Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          </div>
        )}

        {form.createdAt && (
          <div className="text-xs text-gray-400 flex items-center gap-4 px-1 pb-2">
            <span>Created: {new Date(form.createdAt).toLocaleString()} by {form.createdBy}</span>
            <span>|</span>
            <span>Last Updated: {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}</span>
          </div>
        )}
      </div>
    </Layout>
  );
}
