import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft, Package } from "lucide-react";

const STATUS_OPTIONS = ["Active", "Under Maintenance", "Decommissioned"];

const STATUS_BADGE = {
  Active:              "bg-green-400/20 text-green-100 border-green-300/30",
  "Under Maintenance": "bg-amber-400/20 text-amber-100 border-amber-300/30",
  Decommissioned:      "bg-red-400/20 text-red-100 border-red-300/30",
};

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

// â”€â”€â”€ MAIN COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  const editing = mode === "new" || mode === "edit";

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
    label: `${s.locationId}${s.locationName ? " â€” " + s.locationName : ""}`,
  }));

  const assetTypeOptions = assetTypes.map(t => ({
    value: t.id,
    label: `${t.assetTypeId} â€” ${t.assetTypeName}`,
  }));

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">

        <button onClick={() => navigate("/masters/asset-master")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Asset Master
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
              {form.assetId ? form.assetId.slice(0, 2).toUpperCase() : <Package size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{isNew ? "New Asset" : (form.name || form.assetId || "Asset")}</h1>
              <p className="text-sm text-white/70 mt-0.5">{isNew ? "Add a new asset to the master" : <span className="font-mono">{form.assetId}</span>}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {!isNew && form.status && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${STATUS_BADGE[form.status] || "bg-white/10 text-white border-white/20"}`}>
                  {form.status}
                </span>
              )}
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
            <Row label="Asset ID" required error={errors.assetId} help={isNew ? "Auto-generated â€” cannot be changed later." : undefined}>
              <input
                value={form.assetId ?? ""}
                onChange={e => setField("assetId", e.target.value.toUpperCase())}
                disabled={isReadOnly || (!isNew)}
                placeholder="e.g. AST-001"
                maxLength={30}
                className={inputCls(isReadOnly || (!isNew), errors.assetId)}
              />
            </Row>
            <Row label="Asset Name" required error={errors.name}>
              <input
                value={form.name ?? ""}
                onChange={e => setField("name", e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. CNC Machine - Line 3"
                maxLength={128}
                className={inputCls(isReadOnly, errors.name)}
              />
            </Row>

            {/* Classification */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Classification</p>
              <Row label="Asset Type" required error={errors.assetTypeId}>
                <select
                  value={form.assetTypeId ?? ""}
                  onChange={e => {
                    const t = assetTypes.find(t => t.id === e.target.value);
                    setField("assetTypeId", e.target.value);
                    setField("assetTypeName", t ? t.assetTypeName : "");
                  }}
                  disabled={isReadOnly}
                  className={inputCls(isReadOnly, errors.assetTypeId)}
                >
                  <option value="">Select Asset Type</option>
                  {assetTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Row>
              <Row label="Location" required error={errors.locationId}>
                <select
                  value={form.locationId ?? ""}
                  onChange={e => {
                    const s = assetStructures.find(s => s.id === e.target.value);
                    setField("locationId", e.target.value);
                    setField("locationName", s ? (s.locationName || s.locationId) : "");
                  }}
                  disabled={isReadOnly}
                  className={inputCls(isReadOnly, errors.locationId)}
                >
                  <option value="">Select Location</option>
                  {locationOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Row>
              <Row label="Status" required error={errors.status}>
                <select
                  value={form.status ?? ""}
                  onChange={e => setField("status", e.target.value)}
                  disabled={isReadOnly}
                  className={inputCls(isReadOnly, errors.status)}
                >
                  <option value="">Select Status</option>
                  {STATUS_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Row>
            </div>

            {/* Technical Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Technical Details</p>
              <Row label="Manufacturer">
                <input
                  value={form.manufacturer ?? ""}
                  onChange={e => setField("manufacturer", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Siemens, ABB, Danfoss"
                  className={inputCls(isReadOnly)}
                />
              </Row>
              <Row label="Model No.">
                <input
                  value={form.modelNo ?? ""}
                  onChange={e => setField("modelNo", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Manufacturer's model number"
                  className={inputCls(isReadOnly)}
                />
              </Row>
              <Row label="Serial No.">
                <input
                  value={form.serialNo ?? ""}
                  onChange={e => setField("serialNo", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Manufacturer's serial number"
                  className={inputCls(isReadOnly)}
                />
              </Row>
              <Row label="Installation Date">
                <input
                  type="date"
                  value={form.installationDate ?? ""}
                  onChange={e => setField("installationDate", e.target.value)}
                  disabled={isReadOnly}
                  className={inputCls(isReadOnly)}
                />
              </Row>
              <Row label="Level (Hierarchy)">
                <input
                  value={form.level ?? ""}
                  onChange={e => setField("level", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. 1, 2, Sub-unit"
                  className={inputCls(isReadOnly)}
                />
              </Row>
              <Row label="Consumed Hours" error={errors.consumedHours}>
                <input
                  type="number"
                  value={form.consumedHours ?? ""}
                  onChange={e => setField("consumedHours", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Total operating hours"
                  className={inputCls(isReadOnly, errors.consumedHours)}
                />
              </Row>
            </div>

            {/* Warranty */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-6">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Warranty Details</p>
              <Row label="Warranty Details">
                <textarea
                  value={form.warrantyDetails ?? ""}
                  onChange={e => setField("warrantyDetails", e.target.value)}
                  disabled={isReadOnly}
                  rows={3}
                  placeholder="e.g. 2 years from installation, on-site support included"
                  className={`${inputCls(isReadOnly)} resize-none`}
                />
              </Row>
            </div>
          </div>

          {/* Footer actions */}
          {editing && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
              <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all"><Save size={15} /> Save Asset</button>
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


