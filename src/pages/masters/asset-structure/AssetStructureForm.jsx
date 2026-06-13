import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, X, Trash2, Edit2, FileText, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft,
} from "lucide-react";

// ─── UI PRIMITIVES ───────────────────────────────────────────────
function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
          <AlertCircle size={11} className="shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

const inputBase = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-blue-400"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

function TInput({ value, onChange, disabled, placeholder, maxLength, error, type = "text" }) {
  return (
    <input
      type={type} value={value ?? ""} onChange={onChange}
      disabled={disabled} placeholder={placeholder} maxLength={maxLength}
      className={inputBase(disabled, error)}
    />
  );
}

function TSelect({ value, onChange, disabled, options, placeholder, error }) {
  return (
    <select value={value ?? ""} onChange={onChange} disabled={disabled}
      className={inputBase(disabled, error)}>
      <option value="">{placeholder || "Select..."}</option>
      {options.map(o =>
        typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      )}
    </select>
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────
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

  return (
    <Layout>
      <div className="space-y-3 max-w-4xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Masters</span><ChevronRight size={12} />
          <button onClick={() => navigate("/masters/asset-structure")} className="hover:text-blue-500 transition-colors">Asset Structure</button>
          {form.locationId && <><ChevronRight size={12} /><span className="text-blue-600 font-medium">{form.locationId}</span></>}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${
            toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <button
            onClick={() => navigate("/masters/asset-structure")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"
          >
            <ArrowLeft size={13} /> Back
          </button>

          {mode === "view" && (
            <button onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium">
              <Edit2 size={13} /> Edit
            </button>
          )}

          {(mode === "new" || mode === "edit") && (
            <>
              <button onClick={handleSave}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                <Save size={13} /> Save
              </button>
              <button onClick={handleDiscard}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium">
                <X size={13} /> Discard
              </button>
            </>
          )}

          {mode === "view" && !isNew && (
            <button onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium">
              <Trash2 size={13} /> Delete
            </button>
          )}

          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={() => setShowChangelog(!showChangelog)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${
              showChangelog ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText size={13} /> Changelog
          </button>

          {form.updatedAt && (
            <div className="ml-auto text-xs text-gray-400 text-right">
              <span>Updated: {new Date(form.updatedAt).toLocaleString()}</span>
              <span className="ml-2">by {form.updatedBy}</span>
            </div>
          )}
        </div>

        {/* Changelog */}
        {showChangelog && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText size={14} /> Audit Log — {form.locationId || "New"}
            </h3>
            {!form.changelog?.length ? (
              <p className="text-xs text-gray-400 py-4 text-center">No changes recorded yet.</p>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left pb-2 text-gray-500 font-medium">Date & Time</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">User</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">Action</th>
                    <th className="text-left pb-2 text-gray-500 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {form.changelog.map((c, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td>
                      <td className="py-1.5 text-gray-600">{c.user}</td>
                      <td className="py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>{c.action}</span>
                      </td>
                      <td className="py-1.5 text-gray-600">{c.changes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.locationId || "NEW LOCATION"}</span>
            <span className="text-blue-200 text-sm">{form.locationName || form.site || "—"}</span>
            {(mode === "new" || mode === "edit") && (
              <span className="ml-auto bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                {mode === "new" ? "New Record" : "Editing"}
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Location ID" required error={errors.locationId}>
                <TInput
                  value={form.locationId}
                  onChange={e => setField("locationId", e.target.value.toUpperCase())}
                  disabled={isReadOnly || (!isNew)}
                  placeholder="e.g. LOC-001"
                  maxLength={30}
                  error={errors.locationId}
                />
              </Field>
              <Field label="Location Name" error={errors.locationName}>
                <TInput
                  value={form.locationName}
                  onChange={e => setField("locationName", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Production Floor - Zone A"
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Site" required error={errors.site}>
                <TInput
                  value={form.site}
                  onChange={e => setField("site", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Factory A, Plant North"
                  error={errors.site}
                />
              </Field>
              <Field label="Warehouse" required error={errors.warehouseId}>
                <TSelect
                  value={form.warehouseId}
                  onChange={e => {
                    const wh = warehouses.find(w => w.id === e.target.value);
                    setField("warehouseId", e.target.value);
                    setField("warehouseName", wh ? (wh.warehouseName || wh.warehouseCode || "") : "");
                  }}
                  disabled={isReadOnly}
                  options={warehouseOptions}
                  placeholder="Select Warehouse"
                  error={errors.warehouseId}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
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
