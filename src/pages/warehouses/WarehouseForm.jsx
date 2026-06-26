import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Plus, Trash2, Edit2, FileText, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MASTER DATA
// ─────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
  { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" },
  { code: "99", name: "Centre Jurisdiction" },
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

// ─────────────────────────────────────────────────────────────
// EMPTY FORM
// ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
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
  remark: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

const emptyLocation = () => ({
  code: "", locationName: "", parentId: "", isActive: true, isDefault: false,
});

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────
function validate(form, allWarehouses, editingId) {
  const e = {};

  if (!form.warehouseName.trim())
    e.warehouseName = "Warehouse Name is a required field.";
  else if (form.warehouseName.trim().length > 100)
    e.warehouseName = "Warehouse Name must not exceed 100 characters.";
  else if (allWarehouses.some(w =>
    w.companyName === form.companyName &&
    w.warehouseName.trim().toLowerCase() === form.warehouseName.trim().toLowerCase() &&
    w.id !== editingId
  ))
    e.warehouseName = "Warehouse Name already exists for this company. Please enter a unique name.";

  if (!form.companyName)
    e.companyName = "Company Name is a required field.";

  if (!form.state)
    e.state = "State is a required field.";

  if (!form.contactNumber.trim())
    e.contactNumber = "Contact Number is a required field.";
  else if (!/^\d{10,15}$/.test(form.contactNumber.trim()))
    e.contactNumber = "Contact Number should be 10 digits (India).";

  if (!form.accessibleBranch)
    e.accessibleBranch = "Business Unit is a required field.";

  if (form.gstNo.trim()) {
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNo.trim()))
      e.gstNo = "GST No. must be 15 characters in valid format (e.g. 27AABCT1234A1Z5).";
    else {
      const st = INDIAN_STATES.find(s => s.name === form.state);
      if (st && form.gstNo.trim().substring(0, 2) !== st.code)
        e.gstNo = "GST No. state code does not match the selected State.";
    }
  }

  if (form.zipcode.trim() && !/^\d{6}$/.test(form.zipcode.trim()))
    e.zipcode = "Zipcode must be a 6-digit PIN code.";

  return e;
}

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES  (mirrors VendorForm exactly)
// ─────────────────────────────────────────────────────────────
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
          : <option key={o.value ?? o.code} value={o.value ?? o.name}>{o.label ?? o.name}</option>
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

function TCheckbox({ checked, onChange, disabled, label }) {
  return (
    <label className={`flex items-center gap-2 text-sm select-none ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
      <input
        type="checkbox" checked={!!checked} onChange={onChange} disabled={disabled}
        className="w-3.5 h-3.5 rounded border-gray-300 text-brand-600 focus:ring-brand-600 focus:ring-1"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}


// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function WarehouseForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode]             = useState(isNew ? "new" : "view");
  const [form, setForm]             = useState(emptyForm());
  const [errors, setErrors]         = useState({});
  const [activeTab, setActiveTab]   = useState("general");
  const [toast, setToast]           = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [showLocModal, setShowLocModal]   = useState(false);
  const [locForm, setLocForm]       = useState(emptyLocation());
  const [locErrors, setLocErrors]   = useState({});
  const [editingLocId, setEditingLocId]   = useState(null);
  const [editingLocDraft, setEditingLocDraft] = useState({ code: "", locationName: "" });

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    api.get("/api/warehouses").then(list => {
      setAllWarehouses(list);
      if (!isNew && id) {
        const found = list.find(w => w.id === id);
        if (found) setForm(found);
        else navigate("/system/warehouses");
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

  // ── Save ──
  const handleSave = async () => {
    const errs = validate(form, allWarehouses, isNew ? null : id);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const keys = Object.keys(errs);
      if (keys.some(k => ["state", "city", "address1", "address2", "zipcode", "contactName", "contactNumber", "accessibleBranch"].includes(k)))
        setActiveTab("general");
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
        saved = await api.post("/api/warehouses", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/warehouses/${id}`, payload);
      }
      setForm(saved);
      setAllWarehouses(prev => isNew ? [...prev, saved] : prev.map(w => w.id === saved.id ? saved : w));
      setMode("view");
      setErrors({});
      showToast("Warehouse saved successfully.");
      if (isNew) navigate(`/system/warehouses/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save warehouse.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/system/warehouses"); return; }
    try {
      const found = await api.get(`/api/warehouses/${id}`);
      setForm(found);
    } catch { /* keep current */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete warehouse "${form.warehouseName}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/warehouses/${id}`);
      navigate("/system/warehouses");
    } catch (err) {
      showToast(err.message || "Failed to delete warehouse.", "error");
    }
  };

  // ── Add Location ──
  const openLocModal = () => {
    setLocForm(emptyLocation());
    setLocErrors({});
    setShowLocModal(true);
  };

  const handleSaveLocation = () => {
    const e = {};
    if (!locForm.code.trim())
      e.code = "Location Code is a required field.";
    else if (form.locations.some(l => l.code.trim().toLowerCase() === locForm.code.trim().toLowerCase()))
      e.code = "Location Code already exists in this warehouse. Please enter a unique code.";
    if (!locForm.locationName.trim())
      e.locationName = "Location Name is a required field.";
    if (Object.keys(e).length) { setLocErrors(e); return; }

    setField("locations", [
      ...form.locations,
      { ...locForm, id: Date.now().toString() },
    ]);
    setShowLocModal(false);
  };

  const handleDeleteLocation = (locId) => {
    setField("locations", form.locations.filter(l => l.id !== locId));
    if (editingLocId === locId) setEditingLocId(null);
  };

  const handleStartEditLocation = (loc) => {
    setEditingLocId(loc.id);
    setEditingLocDraft({ code: loc.code, locationName: loc.locationName });
  };

  const handleSaveEditLocation = (locId) => {
    const draft = editingLocDraft;
    if (!draft.code.trim() || !draft.locationName.trim()) return;
    const duplicate = form.locations.some(
      l => l.id !== locId && l.code.trim().toLowerCase() === draft.code.trim().toLowerCase()
    );
    if (duplicate) return;
    setField("locations", form.locations.map(l =>
      l.id === locId ? { ...l, code: draft.code.trim().toUpperCase(), locationName: draft.locationName.trim() } : l
    ));
    setEditingLocId(null);
  };

  const TABS = [
    { id: "general",   label: "General Information" },
    { id: "locations", label: "Storage Locations" },
    { id: "remark",    label: "Remark" },
  ];

  const tabHasError = (tabId) => {
    const keys = Object.keys(errors);
    if (tabId === "general") return keys.some(k => ["warehouseName","companyName","gstNo","state","city","zipcode","contactNumber","accessibleBranch"].includes(k));
    return false;
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <Layout>
      <div className="space-y-3 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>System Setup</span><ChevronRight size={12} />
          <button onClick={() => navigate("/system/warehouses")} className="hover:text-brand-500 transition-colors">Warehouse Master</button>
          {form.warehouseCode && <><ChevronRight size={12} /><span className="text-brand-600 font-medium">{form.warehouseCode}</span></>}
        </div>

        {/* Toast */}
        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* ── ACTION TOOLBAR ── */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <button
            onClick={() => navigate("/system/warehouses")}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"
          >
            <ArrowLeft size={13} /> Back
          </button>

          {mode === "view" && (
            <button
              onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium"
            >
              <Edit2 size={13} /> Edit
            </button>
          )}

          {(mode === "new" || mode === "edit") && (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
              >
                <Save size={13} /> Save
              </button>
              <button
                onClick={handleDiscard}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"
              >
                <X size={13} /> Discard
              </button>
            </>
          )}

          {mode === "view" && !isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium"
            >
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

        {/* ── CHANGELOG PANEL ── */}
        {showChangelog && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText size={14} /> Audit Log — {form.warehouseName || "New Warehouse"}
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
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-brand-600"}`}>
                          {c.action}
                        </span>
                      </td>
                      <td className="py-1.5 text-gray-600">{c.changes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── HEADER SECTION ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-brand-900 to-brand-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.warehouseCode || "NEW WAREHOUSE"}</span>
            <span className="text-blue-200 text-sm">{form.warehouseName || "—"}</span>
            <div className="ml-auto flex items-center gap-2">
              {(mode === "new" || mode === "edit") && (
                <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                  {mode === "new" ? "New Record" : "Editing"}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                form.isActive !== false
                  ? "bg-green-400/20 text-green-100 border-green-300/30"
                  : "bg-red-400/20 text-red-100 border-red-300/30"
              }`}>
                {form.isActive !== false ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Row 1: Warehouse Name, Code, Company, GST No. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Warehouse Name" required error={errors.warehouseName}>
                <TInput
                  value={form.warehouseName}
                  onChange={e => setField("warehouseName", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. Main Warehouse"
                  maxLength={100}
                  error={errors.warehouseName}
                />
              </Field>
              <Field label="Warehouse Code" error={errors.warehouseCode}>
                <TInput
                  value={form.warehouseCode}
                  onChange={e => setField("warehouseCode", e.target.value.toUpperCase())}
                  disabled={isReadOnly}
                  placeholder="e.g. WH-01"
                  error={errors.warehouseCode}
                />
              </Field>
              <Field label="Company Name" required error={errors.companyName}>
                <TSelect
                  value={form.companyName}
                  onChange={e => setField("companyName", e.target.value)}
                  disabled={isReadOnly}
                  options={COMPANIES}
                  placeholder="Select Company"
                  error={errors.companyName}
                />
              </Field>
              <Field label="Business Unit" required error={errors.accessibleBranch}>
                <TSelect
                  value={form.accessibleBranch}
                  onChange={e => setField("accessibleBranch", e.target.value)}
                  disabled={isReadOnly}
                  options={BRANCHES}
                  placeholder="Select Business Unit"
                  error={errors.accessibleBranch}
                />
              </Field>
            </div>

            {/* Row 2: Deactivate checkbox */}
            <div className="flex items-center gap-8 pt-1 border-t border-gray-100">
              <div className="ml-auto">
                <TCheckbox
                  checked={form.isActive === false}
                  onChange={e => setField("isActive", !e.target.checked)}
                  disabled={isReadOnly}
                  label="Deactivate Warehouse"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-brand-600 text-brand-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {tab.label}
                {tabHasError(tab.id) && <AlertCircle size={12} className="text-red-400" />}
              </button>
            ))}
          </div>

          {/* Tab Body */}
          <div className="p-5">

            {/* ══════════ GENERAL INFORMATION ══════════ */}
            {activeTab === "general" && (
              <div className="space-y-5">

                {/* Address + Contact block */}
                <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Warehouse Address & Contact</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Field label="State" required error={errors.state}>
                      <TSelect
                        value={form.state}
                        onChange={e => setField("state", e.target.value)}
                        disabled={isReadOnly}
                        options={INDIAN_STATES.map(s => ({ value: s.name, label: `${s.code} — ${s.name}` }))}
                        placeholder="Select State"
                        error={errors.state}
                      />
                    </Field>
                    <Field label="City" error={errors.city}>
                      <TInput
                        value={form.city}
                        onChange={e => setField("city", e.target.value)}
                        disabled={isReadOnly}
                        placeholder="e.g. Mumbai"
                      />
                    </Field>
                    <Field label="Zipcode" error={errors.zipcode}>
                      <TInput
                        value={form.zipcode}
                        onChange={e => setField("zipcode", e.target.value.replace(/\D/g, ""))}
                        disabled={isReadOnly}
                        placeholder="6-digit PIN"
                        maxLength={6}
                        error={errors.zipcode}
                      />
                    </Field>
                    <Field label="GST No." error={errors.gstNo}>
                      <TInput
                        value={form.gstNo}
                        onChange={e => setField("gstNo", e.target.value.toUpperCase())}
                        disabled={isReadOnly}
                        placeholder="e.g. 27AABCT1234A1Z5"
                        maxLength={15}
                        error={errors.gstNo}
                      />
                    </Field>
                    <div className="col-span-1 sm:col-span-2">
                      <Field label="Address Line 1" error={errors.address1}>
                        <TInput
                          value={form.address1}
                          onChange={e => setField("address1", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Plot / Building / Door No."
                        />
                      </Field>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Field label="Address Line 2" error={errors.address2}>
                        <TInput
                          value={form.address2}
                          onChange={e => setField("address2", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Area / Locality"
                        />
                      </Field>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Field label="Contact Name" error={errors.contactName}>
                        <TInput
                          value={form.contactName}
                          onChange={e => setField("contactName", e.target.value)}
                          disabled={isReadOnly}
                          placeholder="Warehouse Manager / Storekeeper"
                        />
                      </Field>
                    </div>
                    <div className="col-span-1 sm:col-span-2">
                      <Field label="Contact Number" required error={errors.contactNumber}>
                        <TInput
                          value={form.contactNumber}
                          onChange={e => setField("contactNumber", e.target.value.replace(/\D/g, ""))}
                          disabled={isReadOnly}
                          placeholder="10-digit mobile"
                          maxLength={15}
                          error={errors.contactNumber}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ══════════ STORAGE LOCATIONS ══════════ */}
            {activeTab === "locations" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{form.locations.length} location(s)</p>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={openLocModal}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded"
                    >
                      <Plus size={13} /> Add Location
                    </button>
                  )}
                </div>

                {form.locations.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No storage locations added.
                    {!isReadOnly && ' Click "Add Location" to get started.'}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Code</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location Name</th>
                          {!isReadOnly && <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right w-28">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {form.locations.map((loc, idx) => (
                          <tr key={loc.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                            <td className="px-4 py-2">
                              {editingLocId === loc.id ? (
                                <input
                                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600 font-mono"
                                  value={editingLocDraft.code}
                                  onChange={e => setEditingLocDraft(d => ({ ...d, code: e.target.value.toUpperCase() }))}
                                  maxLength={20}
                                />
                              ) : (
                                <span className="font-mono text-xs font-semibold text-brand-600">{loc.code}</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {editingLocId === loc.id ? (
                                <input
                                  className="w-full px-2 py-1 text-xs border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
                                  value={editingLocDraft.locationName}
                                  onChange={e => setEditingLocDraft(d => ({ ...d, locationName: e.target.value }))}
                                  maxLength={100}
                                />
                              ) : (
                                <span className="text-gray-700 text-xs">{loc.locationName}</span>
                              )}
                            </td>
                            {!isReadOnly && (
                              <td className="px-4 py-2 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {editingLocId === loc.id ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleSaveEditLocation(loc.id)}
                                        className="flex items-center gap-1 text-xs px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
                                      >
                                        <Save size={11} /> Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingLocId(null)}
                                        className="flex items-center gap-1 text-xs px-2 py-1 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded"
                                      >
                                        <X size={11} /> Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditLocation(loc)}
                                        className="flex items-center gap-1 text-xs px-2 py-1 border border-amber-300 text-amber-600 hover:bg-amber-50 rounded"
                                      >
                                        <Edit2 size={11} /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteLocation(loc.id)}
                                        className="flex items-center gap-1 text-xs px-2 py-1 border border-red-300 text-red-500 hover:bg-red-50 rounded"
                                      >
                                        <Trash2 size={11} /> Delete
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ══════════ REMARK ══════════ */}
            {activeTab === "remark" && (
              <div className="max-w-2xl">
                <Field label="Internal Remarks">
                  <TTextarea
                    value={form.remark}
                    onChange={e => setField("remark", e.target.value)}
                    disabled={isReadOnly}
                    rows={6}
                    placeholder="Internal notes — not printed on any document."
                  />
                </Field>
                <p className="text-xs text-gray-400 mt-1">This field is for internal reference only and will not appear on any printed document.</p>
              </div>
            )}

          </div>
        </div>

        {/* Form-level error summary */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields and try again.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">
                {Object.values(errors).slice(0, 6).map((e, i) => <li key={i}>{e}</li>)}
                {Object.keys(errors).length > 6 && <li>...and {Object.keys(errors).length - 6} more error(s)</li>}
              </ul>
            </div>
          </div>
        )}

        {/* Metadata */}
        {form.createdAt && (
          <div className="text-xs text-gray-400 flex items-center gap-4 px-1 pb-2">
            <span>Created: {new Date(form.createdAt).toLocaleString()} by {form.createdBy}</span>
            <span>|</span>
            <span>Last Updated: {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}</span>
          </div>
        )}

      </div>

      {/* ── ADD LOCATION MODAL ── */}
      {showLocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Add Storage Location</h3>
              <button type="button" onClick={() => setShowLocModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-100">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <Field label="Code" required error={locErrors.code}>
                <TInput
                  value={locForm.code}
                  onChange={e => setLocForm(f => ({ ...f, code: e.target.value }))}
                  placeholder="e.g. LOC-01, RACK-A1, BIN-003"
                  error={locErrors.code}
                />
              </Field>
              <Field label="Location Name" required error={locErrors.locationName}>
                <TInput
                  value={locForm.locationName}
                  onChange={e => setLocForm(f => ({ ...f, locationName: e.target.value }))}
                  placeholder="e.g. Zone A, Rack A1, Bin 01"
                  error={locErrors.locationName}
                />
              </Field>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <button type="button" onClick={() => setShowLocModal(false)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded font-medium">
                <X size={12} /> Close
              </button>
              <button type="button" onClick={handleSaveLocation}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium">
                <Save size={12} /> Save Location
              </button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
}


