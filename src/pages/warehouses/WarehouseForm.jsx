import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  ArrowLeft, Edit2, Save, X, Trash2, Plus,
  ChevronDown, ChevronRight, CheckCircle, AlertCircle,
  Folder, FolderOpen,
} from "lucide-react";

// ── Static data ───────────────────────────────────────────────
const INDIAN_STATES = [
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "18", name: "Assam" },
  { code: "10", name: "Bihar" },
  { code: "04", name: "Chandigarh" },
  { code: "22", name: "Chhattisgarh" },
  { code: "26", name: "Dadra & Nagar Haveli and Daman & Diu" },
  { code: "07", name: "Delhi" },
  { code: "30", name: "Goa" },
  { code: "24", name: "Gujarat" },
  { code: "06", name: "Haryana" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "01", name: "Jammu & Kashmir" },
  { code: "20", name: "Jharkhand" },
  { code: "29", name: "Karnataka" },
  { code: "32", name: "Kerala" },
  { code: "38", name: "Ladakh" },
  { code: "31", name: "Lakshadweep" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "27", name: "Maharashtra" },
  { code: "14", name: "Manipur" },
  { code: "17", name: "Meghalaya" },
  { code: "15", name: "Mizoram" },
  { code: "13", name: "Nagaland" },
  { code: "21", name: "Odisha" },
  { code: "34", name: "Puducherry" },
  { code: "03", name: "Punjab" },
  { code: "08", name: "Rajasthan" },
  { code: "11", name: "Sikkim" },
  { code: "33", name: "Tamil Nadu" },
  { code: "36", name: "Telangana" },
  { code: "16", name: "Tripura" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "05", name: "Uttarakhand" },
  { code: "19", name: "West Bengal" },
];

const COMPANIES = [
  "Speed IT Innovations Pvt. Ltd.",
  "Speed Innovations Pvt. Ltd.",
];

const BRANCHES = [
  "Head Office",
  "Mumbai Branch",
  "Pune Branch",
  "Bangalore Branch",
  "Delhi Branch",
  "Chennai Branch",
  "Hyderabad Branch",
];

const EMPTY_FORM = {
  warehouseName: "",
  warehouseCode: "",
  companyName: "",
  gstNo: "",
  state: "",
  city: "",
  address1: "",
  address2: "",
  zipcode: "",
  contactName: "",
  contactNumber: "",
  accessibleBranch: "",
  locations: [],
  isActive: true,
};

const EMPTY_LOCATION = {
  code: "",
  locationName: "",
  parentId: "",
  isActive: true,
  isDefault: false,
};

// ── Helpers ───────────────────────────────────────────────────
function inp(disabled, error) {
  return `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors ${
    error
      ? "border-red-400 bg-red-50 focus:ring-red-300"
      : disabled
      ? "border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
      : "border-gray-300 bg-white text-gray-900 hover:border-gray-400 focus:ring-blue-300"
  }`;
}

function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs font-medium text-gray-600 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle size={11} className="shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

// ── Location tree node (recursive) ───────────────────────────
function LocationNode({ loc, allLocations, depth }) {
  const [expanded, setExpanded] = useState(true);
  const children = allLocations.filter(l => l.parentId === loc.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-1.5 py-1 px-2 rounded hover:bg-gray-50 text-sm group"
        style={{ paddingLeft: `${depth * 18 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="text-gray-400 hover:text-gray-700 shrink-0"
          >
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        ) : (
          <span className="w-[13px] shrink-0" />
        )}
        {hasChildren
          ? <FolderOpen size={13} className="text-yellow-500 shrink-0" />
          : <Folder size={13} className="text-gray-400 shrink-0" />
        }
        <span className="font-mono text-xs text-blue-700 font-semibold">{loc.code}</span>
        <span className="text-gray-800 flex-1 truncate">{loc.locationName}</span>
        {loc.isDefault && (
          <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded shrink-0">Default</span>
        )}
        {!loc.isActive && (
          <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded shrink-0">Inactive</span>
        )}
      </div>
      {expanded && hasChildren && children.map(child => (
        <LocationNode key={child.id} loc={child} allLocations={allLocations} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  const isOk = toast.type === "success";
  return (
    <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all
      ${isOk ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {isOk ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      {toast.msg}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function WarehouseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [loading, setLoading]     = useState(!isNew);
  const [saving, setSaving]       = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(!isNew);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [errors, setErrors]       = useState({});
  const [toast, setToast]         = useState(null);
  const [showLocModal, setShowLocModal] = useState(false);
  const [locForm, setLocForm]     = useState(EMPTY_LOCATION);
  const [locErrors, setLocErrors] = useState({});
  const [allWarehouses, setAllWarehouses] = useState([]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    api.get("/api/warehouses").then(setAllWarehouses).catch(() => {});
    if (!isNew) {
      api.get(`/api/warehouses/${id}`)
        .then(w => { setForm(w); setLoading(false); })
        .catch(() => navigate("/system/warehouses"));
    }
  }, [id, isNew]);

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.warehouseName.trim()) {
      e.warehouseName = "Warehouse Name is a required field.";
    } else if (form.warehouseName.trim().length > 100) {
      e.warehouseName = "Warehouse Name must not exceed 100 characters.";
    } else {
      const dup = allWarehouses.find(
        w => w.companyName === form.companyName &&
             w.warehouseName.trim().toLowerCase() === form.warehouseName.trim().toLowerCase() &&
             w.id !== id
      );
      if (dup) e.warehouseName = "Warehouse Name already exists for this company. Please enter a unique name.";
    }
    if (!form.companyName) e.companyName = "Company Name is a required field.";
    if (!form.state) e.state = "State is a required field.";
    if (!form.contactNumber.trim()) {
      e.contactNumber = "Contact Number is a required field.";
    } else if (!/^\d{10,15}$/.test(form.contactNumber.trim())) {
      e.contactNumber = "Contact Number should be 10 digits (India).";
    }
    if (!form.accessibleBranch) e.accessibleBranch = "Accessible Branch is a required field.";
    if (form.gstNo.trim()) {
      if (form.gstNo.trim().length !== 15 || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNo.trim())) {
        e.gstNo = "GST No. must be 15 characters in valid format (e.g. 27AABCT1234A1Z5).";
      } else {
        const selectedState = INDIAN_STATES.find(s => s.name === form.state);
        if (selectedState && form.gstNo.trim().substring(0, 2) !== selectedState.code) {
          e.gstNo = "GST No. state code does not match the selected State.";
        }
      }
    }
    if (form.zipcode.trim() && !/^\d{6}$/.test(form.zipcode.trim())) {
      e.zipcode = "Zipcode must be a 6-digit PIN code.";
    }
    return e;
  };

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      showToast("Please correct the highlighted fields and try again.", "error");
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const userName = user.name || "System";
      const payload = {
        ...form,
        id: isNew ? Date.now().toString() : id,
        createdAt: isNew ? now : (form.createdAt || now),
        updatedAt: now,
        createdBy: isNew ? userName : (form.createdBy || userName),
        updatedBy: userName,
      };
      if (isNew) {
        await api.post("/api/warehouses", payload);
        showToast("Warehouse created successfully.");
        navigate("/system/warehouses");
      } else {
        await api.put(`/api/warehouses/${id}`, payload);
        setForm(payload);
        setIsReadOnly(true);
        setAllWarehouses(prev => prev.map(w => w.id === id ? payload : w));
        showToast("Warehouse saved successfully.");
      }
    } catch (err) {
      showToast(err.message || "Failed to save. Please try again.", "error");
    } finally {
      setSaving(false);
      setErrors({});
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete warehouse "${form.warehouseName}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/warehouses/${id}`);
      navigate("/system/warehouses");
    } catch (err) {
      showToast(err.message || "Failed to delete.", "error");
    }
  };

  // ── Add Location popup ────────────────────────────────────
  const openAddLocation = () => {
    setLocForm(EMPTY_LOCATION);
    setLocErrors({});
    setShowLocModal(true);
  };

  const validateLocation = () => {
    const e = {};
    if (!locForm.code.trim()) {
      e.code = "Location Code is a required field.";
    } else if (form.locations.some(l => l.code.trim().toLowerCase() === locForm.code.trim().toLowerCase())) {
      e.code = "Location Code already exists in this warehouse. Please enter a unique code.";
    }
    if (!locForm.locationName.trim()) e.locationName = "Location Name is a required field.";
    return e;
  };

  const handleSaveLocation = () => {
    const errs = validateLocation();
    if (Object.keys(errs).length) { setLocErrors(errs); return; }
    const newLoc = {
      ...locForm,
      id: Date.now().toString(),
      parentId: locForm.parentId || null,
    };
    setField("locations", [...form.locations, newLoc]);
    setShowLocModal(false);
    setLocForm(EMPTY_LOCATION);
    setLocErrors({});
  };

  // ── Top-level locations (no parent) ──────────────────────
  const topLevelLocs = form.locations.filter(l => !l.parentId);

  if (loading) {
    return <Layout><div className="text-center py-16 text-gray-400 text-sm">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <Toast toast={toast} />

      <div className="space-y-5 max-w-5xl">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link to="/system/warehouses" className="hover:text-gray-700">System Setup</Link>
          <ChevronRight size={12} />
          <Link to="/system/warehouses" className="hover:text-gray-700">Warehouse Master</Link>
          {!isNew && (
            <>
              <ChevronRight size={12} />
              <span className="text-gray-700 font-medium">{form.warehouseName || id}</span>
            </>
          )}
        </div>

        {/* ── Action toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/system/warehouses")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {isReadOnly && !isNew && (
            <button
              type="button"
              onClick={() => setIsReadOnly(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}

          {(!isReadOnly) && (
            <>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
              >
                <Save size={14} /> {saving ? "Saving..." : "Save"}
              </button>
              {!isNew && (
                <button
                  type="button"
                  onClick={() => { setIsReadOnly(true); setErrors({}); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={14} /> Discard
                </button>
              )}
            </>
          )}

          {isNew && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm rounded bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              <Save size={14} /> {saving ? "Saving..." : "Save"}
            </button>
          )}

          {!isNew && (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-red-300 rounded text-red-600 hover:bg-red-50 transition-colors ml-auto"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </div>

        {/* ── Blue header card ── */}
        <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 px-5 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white font-semibold text-base truncate">
                {form.warehouseName || (isNew ? "New Warehouse" : "—")}
              </p>
              <p className="text-gray-300 text-xs mt-0.5">
                {form.warehouseCode ? `Code: ${form.warehouseCode}` : "Warehouse Master"}
                {form.companyName ? ` · ${form.companyName}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${form.isActive !== false ? "bg-green-400/20 text-green-200" : "bg-red-400/20 text-red-300"}`}>
                {form.isActive !== false ? "Active" : "Inactive"}
              </span>
              {!isReadOnly && (
                <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.isActive !== false}
                    onChange={e => setField("isActive", e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-400"
                  />
                  Active
                </label>
              )}
            </div>
          </div>

          {/* ── Basic Details section ── */}
          <div className="bg-white p-5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Basic Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">

              <Field label="Warehouse Name" required error={errors.warehouseName} className="lg:col-span-2">
                <input
                  type="text"
                  value={form.warehouseName}
                  onChange={e => setField("warehouseName", e.target.value)}
                  disabled={isReadOnly}
                  maxLength={100}
                  placeholder="e.g. Main Warehouse"
                  className={inp(isReadOnly, errors.warehouseName)}
                />
              </Field>

              <Field label="Warehouse Code" error={errors.warehouseCode}>
                <input
                  type="text"
                  value={form.warehouseCode}
                  onChange={e => setField("warehouseCode", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. WH-01"
                  className={inp(isReadOnly, errors.warehouseCode)}
                />
              </Field>

              <Field label="Company Name" required error={errors.companyName}>
                <select
                  value={form.companyName}
                  onChange={e => setField("companyName", e.target.value)}
                  disabled={isReadOnly}
                  className={inp(isReadOnly, errors.companyName)}
                >
                  <option value="">Select Company</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="GST No." error={errors.gstNo}>
                <input
                  type="text"
                  value={form.gstNo}
                  onChange={e => setField("gstNo", e.target.value.toUpperCase())}
                  disabled={isReadOnly}
                  maxLength={15}
                  placeholder="e.g. 27AABCT1234A1Z5"
                  className={inp(isReadOnly, errors.gstNo)}
                />
              </Field>

              <Field label="State" required error={errors.state}>
                <select
                  value={form.state}
                  onChange={e => setField("state", e.target.value)}
                  disabled={isReadOnly}
                  className={inp(isReadOnly, errors.state)}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s.code} value={s.name}>{s.code} — {s.name}</option>
                  ))}
                </select>
              </Field>

              <Field label="City" error={errors.city}>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setField("city", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Mumbai"
                  className={inp(isReadOnly, errors.city)}
                />
              </Field>

              <Field label="Zipcode" error={errors.zipcode}>
                <input
                  type="text"
                  value={form.zipcode}
                  onChange={e => setField("zipcode", e.target.value)}
                  disabled={isReadOnly}
                  maxLength={6}
                  placeholder="6-digit PIN"
                  className={inp(isReadOnly, errors.zipcode)}
                />
              </Field>

              <Field label="Address Line 1" error={errors.address1} className="lg:col-span-2">
                <input
                  type="text"
                  value={form.address1}
                  onChange={e => setField("address1", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Plot / Building / Door No."
                  className={inp(isReadOnly, errors.address1)}
                />
              </Field>

              <Field label="Address Line 2" error={errors.address2} className="lg:col-span-2">
                <input
                  type="text"
                  value={form.address2}
                  onChange={e => setField("address2", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Area / Locality"
                  className={inp(isReadOnly, errors.address2)}
                />
              </Field>

              <Field label="Contact Name" error={errors.contactName}>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={e => setField("contactName", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Warehouse Manager"
                  className={inp(isReadOnly, errors.contactName)}
                />
              </Field>

              <Field label="Contact Number" required error={errors.contactNumber}>
                <input
                  type="text"
                  value={form.contactNumber}
                  onChange={e => setField("contactNumber", e.target.value.replace(/\D/g, ""))}
                  disabled={isReadOnly}
                  maxLength={15}
                  placeholder="10-digit mobile"
                  className={inp(isReadOnly, errors.contactNumber)}
                />
              </Field>

              <Field label="Accessible Branch" required error={errors.accessibleBranch} className="lg:col-span-2">
                <select
                  value={form.accessibleBranch}
                  onChange={e => setField("accessibleBranch", e.target.value)}
                  disabled={isReadOnly}
                  className={inp(isReadOnly, errors.accessibleBranch)}
                >
                  <option value="">Select Branch</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>

            </div>
          </div>
        </div>

        {/* ── Storage Locations section ── */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage Locations</p>
            {!isReadOnly && (
              <button
                type="button"
                onClick={openAddLocation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Plus size={13} /> Add Location
              </button>
            )}
          </div>

          <div className="p-4">
            {form.locations.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-lg py-10 text-center">
                <Folder size={28} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No storage locations added yet.</p>
                <p className="text-xs text-gray-400 mt-1">Build a hierarchy: Warehouse → Zone → Rack → Shelf → Bin</p>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={openAddLocation}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Plus size={12} /> Add First Location
                  </button>
                )}
              </div>
            ) : (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center gap-3 text-xs font-medium text-gray-500">
                  <span className="flex-1">Location</span>
                  <span>Status</span>
                </div>
                <div className="py-1">
                  {topLevelLocs.map(loc => (
                    <LocationNode
                      key={loc.id}
                      loc={loc}
                      allLocations={form.locations}
                      depth={0}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Error summary ── */}
        {Object.keys(errors).length > 0 && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-xs font-semibold text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
            <ul className="list-disc list-inside space-y-0.5">
              {Object.values(errors).map((e, i) => (
                <li key={i} className="text-xs text-red-600">{e}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

      {/* ── Add Location Modal ── */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Add Storage Location</h3>
              <button
                type="button"
                onClick={() => setShowLocModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              <Field label="Code" required error={locErrors.code}>
                <input
                  type="text"
                  value={locForm.code}
                  onChange={e => setLocForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. LOC-01, RACK-A1, BIN-003"
                  className={inp(false, locErrors.code)}
                  autoFocus
                />
              </Field>

              <Field label="Location Name" required error={locErrors.locationName}>
                <input
                  type="text"
                  value={locForm.locationName}
                  onChange={e => setLocForm(f => ({ ...f, locationName: e.target.value }))}
                  placeholder="e.g. Zone A, Rack A1, Bin 01"
                  className={inp(false, locErrors.locationName)}
                />
              </Field>

              <Field label="Parent Location" error={locErrors.parentId}>
                <select
                  value={locForm.parentId}
                  onChange={e => setLocForm(f => ({ ...f, parentId: e.target.value }))}
                  className={inp(false, locErrors.parentId)}
                >
                  <option value="">— Top Level (no parent) —</option>
                  {form.locations.map(l => (
                    <option key={l.id} value={l.id}>{l.code} — {l.locationName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400">Leave blank to create a top-level location under this warehouse.</p>
              </Field>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={locForm.isActive}
                    onChange={e => setLocForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-400"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={locForm.isDefault}
                    onChange={e => setLocForm(f => ({ ...f, isDefault: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-400"
                  />
                  Default Location
                </label>
              </div>

            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => setShowLocModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                className="px-4 py-2 text-sm rounded bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Save Location
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}
