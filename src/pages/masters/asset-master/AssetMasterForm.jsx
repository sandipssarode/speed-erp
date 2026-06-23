import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, X, Trash2, Edit2, FileText, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft,
} from "lucide-react";

const STATUS_OPTIONS = ["Active", "Under Maintenance", "Decommissioned"];

const STATUS_BADGE = {
  Active:              "bg-green-400/20 text-green-100 border-green-300/30",
  "Under Maintenance": "bg-amber-400/20 text-amber-100 border-amber-300/30",
  Decommissioned:      "bg-red-400/20 text-red-100 border-red-300/30",
};

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
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-brand-600"}
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

function TTextarea({ value, onChange, disabled, rows = 3, placeholder }) {
  return (
    <textarea
      value={value ?? ""} onChange={onChange} disabled={disabled}
      rows={rows} placeholder={placeholder}
      className={`${inputBase(disabled)} resize-none`}
    />
  );
}

// ─── HELPERS ─────────────────────────────────────────────────────
const emptyForm = () => ({
  assetId:          `AST-${Date.now().toString().slice(-6)}`,
  name:             "",
  locationId:       "",
  locationName:     "",
  assetTypeId:      "",
  assetTypeName:    "",
  manufacturer:     "",
  modelNo:          "",
  serialNo:         "",
  installationDate: "",
  warrantyDetails:  "",
  level:            "",
  status:           "Active",
  consumedHours:    "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.assetId.trim())
    e.assetId = "Asset ID is required.";
  else if (allRecords.some(r =>
    r.assetId?.trim().toLowerCase() === form.assetId.trim().toLowerCase() &&
    r.id !== editingId
  ))
    e.assetId = "Asset ID already exists.";
  if (!form.name.trim()) e.name = "Asset Name is a required field.";
  if (!form.locationId) e.locationId = "Location is a required field.";
  if (!form.assetTypeId) e.assetTypeId = "Asset Type is a required field.";
  if (!form.status) e.status = "Status is a required field.";
  if (form.consumedHours !== "" && (isNaN(Number(form.consumedHours)) || Number(form.consumedHours) < 0))
    e.consumedHours = "Consumed Hours must be a positive number.";
  return e;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function AssetMasterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode]         = useState(isNew ? "new" : "view");
  const [form, setForm]         = useState(emptyForm());
  const [errors, setErrors]     = useState({});
  const [toast, setToast]       = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [assetTypes, setAssetTypes] = useState([]);
  const [assetStructures, setAssetStructures] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    Promise.all([
      api.get("/api/assets"),
      api.get("/api/asset-types"),
      api.get("/api/asset-structures"),
    ]).then(([assets, types, structures]) => {
      setAllRecords(assets);
      setAssetTypes(types);
      setAssetStructures(structures);
      if (!isNew && id) {
        const found = assets.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/asset-master");
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
        saved = await api.post("/api/assets", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/assets/${id}`, payload);
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view");
      setErrors({});
      showToast("Asset saved successfully.");
      if (isNew) navigate(`/masters/asset-master/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/asset-master"); return; }
    try {
      const found = await api.get(`/api/assets/${id}`);
      setForm(found);
    } catch { /* keep current */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete asset "${form.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/assets/${id}`);
      navigate("/masters/asset-master");
    } catch (err) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  const locationOptions = assetStructures.map(s => ({
    value: s.id,
    label: `${s.locationId}${s.locationName ? " — " + s.locationName : ""}`,
  }));

  const assetTypeOptions = assetTypes.map(t => ({
    value: t.id,
    label: `${t.assetTypeId} — ${t.assetTypeName}`,
  }));

  return (
    <Layout>
      <div className="space-y-3 max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Masters</span><ChevronRight size={12} />
          <button onClick={() => navigate("/masters/asset-master")} className="hover:text-brand-500 transition-colors">Asset Master</button>
          {form.assetId && <><ChevronRight size={12} /><span className="text-brand-600 font-medium">{form.assetId}</span></>}
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
          <button onClick={() => navigate("/masters/asset-master")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
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
              showChangelog ? "border-blue-300 bg-blue-50 text-brand-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
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
              <FileText size={14} /> Audit Log — {form.assetId || "New"}
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
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-brand-600"}`}>{c.action}</span>
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
          <div className="bg-gradient-to-r from-brand-900 to-brand-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.assetId || "NEW ASSET"}</span>
            <span className="text-blue-200 text-sm">{form.name || "—"}</span>
            <div className="ml-auto flex items-center gap-2">
              {(mode === "new" || mode === "edit") && (
                <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                  {mode === "new" ? "New Record" : "Editing"}
                </span>
              )}
              {form.status && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[form.status] || "bg-white/10 text-white border-white/20"}`}>
                  {form.status}
                </span>
              )}
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Asset ID" required error={errors.assetId}>
                <TInput
                  value={form.assetId}
                  onChange={e => setField("assetId", e.target.value.toUpperCase())}
                  disabled={isReadOnly || (!isNew)}
                  placeholder="e.g. AST-001"
                  maxLength={30}
                  error={errors.assetId}
                />
              </Field>
              <Field label="Asset Name" required error={errors.name}>
                <TInput
                  value={form.name}
                  onChange={e => setField("name", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. CNC Machine - Line 3"
                  maxLength={128}
                  error={errors.name}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Classification */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-4">
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Classification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Asset Type" required error={errors.assetTypeId}>
                <TSelect
                  value={form.assetTypeId}
                  onChange={e => {
                    const t = assetTypes.find(t => t.id === e.target.value);
                    setField("assetTypeId", e.target.value);
                    setField("assetTypeName", t ? t.assetTypeName : "");
                  }}
                  disabled={isReadOnly}
                  options={assetTypeOptions}
                  placeholder="Select Asset Type"
                  error={errors.assetTypeId}
                />
              </Field>
              <Field label="Location" required error={errors.locationId}>
                <TSelect
                  value={form.locationId}
                  onChange={e => {
                    const s = assetStructures.find(s => s.id === e.target.value);
                    setField("locationId", e.target.value);
                    setField("locationName", s ? (s.locationName || s.locationId) : "");
                  }}
                  disabled={isReadOnly}
                  options={locationOptions}
                  placeholder="Select Location"
                  error={errors.locationId}
                />
              </Field>
              <Field label="Status" required error={errors.status}>
                <TSelect
                  value={form.status}
                  onChange={e => setField("status", e.target.value)}
                  disabled={isReadOnly}
                  options={STATUS_OPTIONS}
                  placeholder="Select Status"
                  error={errors.status}
                />
              </Field>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Technical Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Manufacturer">
                <TInput
                  value={form.manufacturer}
                  onChange={e => setField("manufacturer", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Siemens, ABB, Danfoss"
                />
              </Field>
              <Field label="Model No.">
                <TInput
                  value={form.modelNo}
                  onChange={e => setField("modelNo", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Manufacturer's model number"
                />
              </Field>
              <Field label="Serial No.">
                <TInput
                  value={form.serialNo}
                  onChange={e => setField("serialNo", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Manufacturer's serial number"
                />
              </Field>
              <Field label="Installation Date">
                <TInput
                  type="date"
                  value={form.installationDate}
                  onChange={e => setField("installationDate", e.target.value)}
                  disabled={isReadOnly}
                />
              </Field>
              <Field label="Level (Hierarchy)">
                <TInput
                  value={form.level}
                  onChange={e => setField("level", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. 1, 2, Sub-unit"
                />
              </Field>
              <Field label="Consumed Hours" error={errors.consumedHours}>
                <TInput
                  type="number"
                  value={form.consumedHours}
                  onChange={e => setField("consumedHours", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Total operating hours"
                  error={errors.consumedHours}
                />
              </Field>
            </div>
          </div>

          {/* Warranty */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Warranty Details</p>
            <TTextarea
              value={form.warrantyDetails}
              onChange={e => setField("warrantyDetails", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="e.g. 2 years from installation, on-site support included"
            />
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
