import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft, MapPin } from "lucide-react";

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

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const emptyForm = () => ({
  locationId:    `LOC-${Date.now().toString().slice(-6)}`,
  locationName:  "",
  site:          "",
  warehouseId:   "",
  warehouseName: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.site.trim()) e.site = "Site is a required field.";
  if (!form.warehouseId) e.warehouseId = "Warehouse is a required field.";
  if (!form.locationId.trim())
    e.locationId = "Location ID is required.";
  else if (allRecords.some(r =>
    r.locationId?.trim().toLowerCase() === form.locationId.trim().toLowerCase() &&
    r.id !== editingId
  ))
    e.locationId = "Location ID already exists. Please enter a unique ID.";
  return e;
}

// â”€â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AssetStructureForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode]         = useState(isNew ? "new" : "view");
  const [form, setForm]         = useState(emptyForm());
  const [errors, setErrors]     = useState({});
  const [toast, setToast]       = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    Promise.all([
      api.get("/api/asset-structures"),
      api.get("/api/warehouses"),
    ]).then(([structures, whs]) => {
      setAllRecords(structures);
      setWarehouses(whs);
      if (!isNew && id) {
        const found = structures.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/asset-structure");
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
        saved = await api.post("/api/asset-structures", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/asset-structures/${id}`, payload);
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view");
      setErrors({});
      showToast("Asset Structure saved successfully.");
      if (isNew) navigate(`/masters/asset-structure/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/asset-structure"); return; }
    try {
      const found = await api.get(`/api/asset-structures/${id}`);
      setForm(found);
    } catch { /* keep current */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete asset structure "${form.locationId}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/asset-structures/${id}`);
      navigate("/masters/asset-structure");
    } catch (err) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const warehouseOptions = warehouses.map(w => ({
    value: w.id,
    label: w.warehouseName || w.warehouseCode || w.id,
  }));

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">

        <button onClick={() => navigate("/masters/asset-structure")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Asset Structure
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
              {form.locationId ? form.locationId.slice(0, 2).toUpperCase() : <MapPin size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{isNew ? "New Location" : (form.locationName || form.locationId || "Location")}</h1>
              <p className="text-sm text-white/70 mt-0.5">{isNew ? "Add a new location to the asset structure" : <span className="font-mono">{form.locationId}</span>}</p>
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
                  <thead><tr className="text-gray-400 text-left"><th className="pb-1.5 font-medium">Date &amp; Time</th><th className="pb-1.5 font-medium">User</th><th className="pb-1.5 font-medium">Action</th><th className="pb-1.5 font-medium">Details</th></tr></thead>
                  <tbody>{form.changelog.map((c, i) => (<tr key={i} className="border-t border-gray-100"><td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td><td className="py-1.5 text-gray-600">{c.user}</td><td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[11px] ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-brand-50 text-brand-600"}`}>{c.action}</span></td><td className="py-1.5 text-gray-600">{c.changes}</td></tr>))}</tbody>
                </table>
              )}
            </div>
          )}

          {/* Body */}
          <div className="px-6 py-7 space-y-6">
            <Row label="Location ID" required error={errors.locationId} help={isNew ? "Auto-generated â€” cannot be changed later." : undefined}>
              <input
                value={form.locationId ?? ""}
                onChange={e => setField("locationId", e.target.value.toUpperCase())}
                disabled={isReadOnly || (!isNew)}
                placeholder="e.g. LOC-001"
                maxLength={30}
                className={inputCls(isReadOnly || (!isNew), errors.locationId)}
              />
            </Row>
            <Row label="Location Name" error={errors.locationName}>
              <input
                value={form.locationName ?? ""}
                onChange={e => setField("locationName", e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Production Floor - Zone A"
                className={inputCls(isReadOnly, errors.locationName)}
              />
            </Row>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location Details</p>
              <Row label="Site" required error={errors.site}>
                <input
                  value={form.site ?? ""}
                  onChange={e => setField("site", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Factory A, Plant North"
                  className={inputCls(isReadOnly, errors.site)}
                />
              </Row>
              <Row label="Warehouse" required error={errors.warehouseId}>
                <select
                  value={form.warehouseId ?? ""}
                  onChange={e => {
                    const wh = warehouses.find(w => w.id === e.target.value);
                    setField("warehouseId", e.target.value);
                    setField("warehouseName", wh ? (wh.warehouseName || wh.warehouseCode || "") : "");
                  }}
                  disabled={isReadOnly}
                  className={inputCls(isReadOnly, errors.warehouseId)}
                >
                  <option value="">Select Warehouse</option>
                  {warehouseOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Row>
            </div>
          </div>

          {/* Footer actions */}
          {editing && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
              <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all"><Save size={15} /> Save Location</button>
              <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors">Cancel</button>
            </div>
          )}
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
              <div className="text-xs text-red-600 space-y-0.5">
                {Object.values(errors).map((e, i) => <p key={i}>â€¢ {e}</p>)}
              </div>
            </div>
          </div>
        )}

        {!isNew && form.createdAt && (
          <p className="text-xs text-gray-400 px-1">
            Created {new Date(form.createdAt).toLocaleString()} by {form.createdBy} Â· Updated {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}
          </p>
        )}
      </div>
    </Layout>
  );
}

