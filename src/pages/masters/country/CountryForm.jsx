import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft, Globe } from "lucide-react";

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

const emptyForm = () => ({
  countryCode: "", countryName: "", dialCode: "", currency: "", isDeactivated: false,
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.countryCode.trim()) e.countryCode = "Country Code is required.";
  else if (form.countryCode.trim().length > 3) e.countryCode = "Country Code must be max 3 characters.";
  else if (allRecords.some(r => r.countryCode?.trim().toLowerCase() === form.countryCode.trim().toLowerCase() && r.id !== editingId))
    e.countryCode = "Country Code already exists.";
  if (!form.countryName.trim()) e.countryName = "Country Name is required.";
  return e;
}

export default function CountryForm() {
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
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    api.get("/api/countries").then(list => {
      setAllRecords(list);
      if (!isNew && id) {
        const found = list.find(r => r.id === id);
        if (found) setForm(found); else navigate("/system/countries");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => { setForm(p => ({ ...p, [key]: value })); if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; }); };

  const handleSave = async () => {
    const errs = validate(form, allRecords, isNew ? null : id);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    const now = new Date().toISOString();
    const userName = user.name || user.fullName || "System";
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };
    try {
      let saved;
      if (isNew) {
        saved = await api.post("/api/countries", { ...form, id: Date.now().toString(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] });
      } else {
        saved = await api.put(`/api/countries/${id}`, { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), entry] });
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Country saved successfully.");
      if (isNew) navigate(`/system/countries/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/system/countries"); return; }
    try { const found = await api.get(`/api/countries/${id}`); setForm(found); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete country "${form.countryName}"? This cannot be undone.`)) return;
    try { await api.del(`/api/countries/${id}`); navigate("/system/countries"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">

        <button onClick={() => navigate("/system/countries")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Country Master
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
              {form.countryCode ? form.countryCode.slice(0, 2).toUpperCase() : <Globe size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{isNew ? "New Country" : (form.countryName || "Country")}</h1>
              <p className="text-sm text-white/70 mt-0.5">{isNew ? "Add a new country to the master" : <span className="font-mono">{form.countryCode}</span>}</p>
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
            <Row label="Country Code" required error={errors.countryCode} help={isNew ? "Max 3 characters — cannot be changed later." : undefined}>
              <input value={form.countryCode} onChange={e => setField("countryCode", e.target.value.toUpperCase())} disabled={isReadOnly || !isNew} placeholder="e.g. IN" maxLength={3} className={inputCls(isReadOnly || !isNew, errors.countryCode)} />
            </Row>
            <Row label="Country Name" required error={errors.countryName}>
              <input value={form.countryName} onChange={e => setField("countryName", e.target.value)} disabled={isReadOnly} placeholder="e.g. India" className={inputCls(isReadOnly, errors.countryName)} />
            </Row>
            <Row label="Dial Code">
              <input value={form.dialCode} onChange={e => setField("dialCode", e.target.value)} disabled={isReadOnly} placeholder="e.g. +91" maxLength={10} className={inputCls(isReadOnly)} />
            </Row>
            <Row label="Currency">
              <input value={form.currency} onChange={e => setField("currency", e.target.value.toUpperCase())} disabled={isReadOnly} placeholder="e.g. INR" maxLength={10} className={inputCls(isReadOnly)} />
            </Row>
            <Row label="Status">
              <label className="flex items-center gap-2.5 sm:pt-2 cursor-pointer">
                <input type="checkbox" checked={!!form.isDeactivated} onChange={e => setField("isDeactivated", e.target.checked)} disabled={isReadOnly} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                <span className="text-sm text-gray-600">Mark this country as inactive</span>
              </label>
            </Row>
          </div>

          {/* Footer actions */}
          {editing && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
              <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all"><Save size={15} /> Save Country</button>
              <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors">Cancel</button>
            </div>
          )}
        </div>

        {!isNew && form.createdAt && (
          <p className="text-xs text-gray-400 px-1">
            Created {new Date(form.createdAt).toLocaleString()} by {form.createdBy} Â· Updated {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}
          </p>
        )}
      </div>
    </Layout>
  );
}



