import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Trash2, Edit2, FileText, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft, Eye, EyeOff,
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

// ─────────────────────────────────────────────────────────────
// EMPTY FORM
// ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  locationCode: "",
  contactName: "",
  contactNumber: "",
  address1: "",
  address2: "",
  state: "",
  city: "",
  zipcode: "",
  enableGst: false,
  gstNumber: "",
  ewayBillUsername: "",
  ewayBillPassword: "",
  einvoiceUsername: "",
  einvoicePassword: "",
  isActive: true,
  remark: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

// ─────────────────────────────────────────────────────────────
// VALIDATION  (mirrors Appendix 2 — Inline Error Messages)
// ─────────────────────────────────────────────────────────────
function validate(form, allUnits, editingId) {
  const e = {};

  if (!form.locationCode.trim())
    e.locationCode = "BU Code is a required field.";
  else if (allUnits.some(u =>
    u.locationCode.trim().toLowerCase() === form.locationCode.trim().toLowerCase() &&
    u.id !== editingId
  ))
    e.locationCode = "BU Code already exists. Please enter a unique code.";

  if (!form.contactNumber.trim())
    e.contactNumber = "Contact Number is a required field.";
  else if (!/^\d{10,15}$/.test(form.contactNumber.trim()))
    e.contactNumber = "Contact Number should be 10 digits (India).";

  if (!form.state)
    e.state = "State is a required field.";

  if (form.zipcode.trim() && !/^\d{6}$/.test(form.zipcode.trim()))
    e.zipcode = "Zipcode must be a 6-digit PIN code.";

  if (form.enableGst) {
    if (!form.gstNumber.trim())
      e.gstNumber = "GST Number No is required when Enable GST Number is enabled.";
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim()))
      e.gstNumber = "GST Number No must be 15 characters in valid format (e.g. 29AAGCB1286QZ00).";
    else {
      const st = INDIAN_STATES.find(s => s.name === form.state);
      if (st && form.gstNumber.trim().substring(0, 2) !== st.code)
        e.gstNumber = "GST Number No state code does not match the selected State.";
    }

    if (form.ewayBillPassword.trim() && !form.ewayBillUsername.trim())
      e.ewayBillUsername = "Eway Bill User Name is required when e-Way Bill integration is enabled.";
    if (form.ewayBillUsername.trim() && !form.ewayBillPassword.trim())
      e.ewayBillPassword = "Eway Bill Password is required when Eway Bill User Name is filled.";
    if (form.einvoiceUsername.trim() && !form.einvoicePassword.trim())
      e.einvoicePassword = "EInvoice Password is required when EInvoice User Name is filled.";
  }

  return e;
}

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES  (mirrors WarehouseForm / VendorForm exactly)
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
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-violet-400"}
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
        className="w-3.5 h-3.5 rounded border-gray-300 text-violet-600 focus:ring-violet-400 focus:ring-1"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

// Masked password input — never shows the saved value in plain text in
// view mode; while editing, an eye toggle reveals what is being typed.
function TPassword({ value, onChange, disabled, placeholder, error }) {
  const [show, setShow] = useState(false);
  if (disabled) {
    return (
      <input
        type="text" value={value ? "••••••••" : ""} readOnly disabled
        placeholder={placeholder}
        className={inputBase(true, error)}
      />
    );
  }
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"} value={value ?? ""} onChange={onChange}
        placeholder={placeholder} autoComplete="new-password"
        className={`${inputBase(false, error)} pr-8`}
      />
      <button
        type="button" tabIndex={-1} onClick={() => setShow(v => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function BusinessUnitForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode]         = useState(isNew ? "new" : "view");
  const [form, setForm]         = useState(emptyForm());
  const [errors, setErrors]     = useState({});
  const [toast, setToast]       = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allUnits, setAllUnits] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    api.get("/api/business-units").then(list => {
      setAllUnits(list);
      if (!isNew && id) {
        const found = list.find(u => u.id === id);
        if (found) setForm(found);
        else navigate("/system/business-units");
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
    const errs = validate(form, allUnits, isNew ? null : id);
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
        saved = await api.post("/api/business-units", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/business-units/${id}`, payload);
      }
      setForm(saved);
      setAllUnits(prev => isNew ? [...prev, saved] : prev.map(u => u.id === saved.id ? saved : u));
      setMode("view");
      setErrors({});
      showToast("Business Unit saved successfully.");
      if (isNew) navigate(`/system/business-units/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save business unit.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/system/business-units"); return; }
    try {
      const found = await api.get(`/api/business-units/${id}`);
      setForm(found);
    } catch { /* keep current */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete business unit "${form.locationCode}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/business-units/${id}`);
      navigate("/system/business-units");
    } catch (err) {
      showToast(err.message || "Failed to delete business unit.", "error");
    }
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
          <button onClick={() => navigate("/system/business-units")} className="hover:text-violet-500 transition-colors">Business Unit Master</button>
          {form.locationCode && <><ChevronRight size={12} /><span className="text-violet-600 font-medium">{form.locationCode}</span></>}
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
            onClick={() => navigate("/system/business-units")}
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
              showChangelog ? "border-blue-300 bg-blue-50 text-violet-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
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
              <FileText size={14} /> Audit Log — {form.locationCode || "New Business Unit"}
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
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-violet-600"}`}>
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

        {/* ── HEADER — CODE ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          {/* Status Bar */}
          <div className="bg-gradient-to-r from-violet-900 to-violet-700 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.locationCode || "NEW BUSINESS UNIT"}</span>
            <span className="text-blue-200 text-sm">{form.contactName || "—"}</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="BU Code" required error={errors.locationCode}>
                <TInput
                  value={form.locationCode}
                  onChange={e => setField("locationCode", e.target.value.toUpperCase())}
                  disabled={isReadOnly}
                  placeholder="e.g. LC-1, BU-MUM-01"
                  maxLength={20}
                  error={errors.locationCode}
                />
              </Field>
            </div>
            <p className="text-xs text-gray-400 -mt-2">
              Used as the Unit reference on all POs, SOs, GRNs, invoices, and inventory transactions. Cannot be changed once transactions exist against this unit.
            </p>

            <div className="flex items-center gap-8 pt-1 border-t border-gray-100">
              <div className="ml-auto">
                <TCheckbox
                  checked={form.isActive === false}
                  onChange={e => setField("isActive", !e.target.checked)}
                  disabled={isReadOnly}
                  label="Deactivate Business Unit"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTACT DETAILS + ADDRESS ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm p-5 space-y-5">

          {/* Contact Details */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Contact Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Contact Name" error={errors.contactName}>
                <TInput
                  value={form.contactName}
                  onChange={e => setField("contactName", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Manager name or Front Desk"
                />
              </Field>
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

          {/* Address */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Address</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  placeholder="e.g. Vadodara"
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
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Address 1" error={errors.address1}>
                  <TTextarea
                    value={form.address1}
                    onChange={e => setField("address1", e.target.value)}
                    disabled={isReadOnly}
                    rows={2}
                    placeholder="Plot No. / Building / Door No."
                  />
                </Field>
                <Field label="Address 2" error={errors.address2}>
                  <TTextarea
                    value={form.address2}
                    onChange={e => setField("address2", e.target.value)}
                    disabled={isReadOnly}
                    rows={2}
                    placeholder="Area / Locality / Company name"
                  />
                </Field>
              </div>
            </div>
            <p className="text-xs text-gray-400">State drives GST determination (IGST vs CGST+SGST) for all transactions initiated from this unit.</p>
          </div>

          {/* GST Number */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">GST Number</p>
              <TCheckbox
                checked={form.enableGst}
                onChange={e => setField("enableGst", e.target.checked)}
                disabled={isReadOnly}
                label="Enable GST Number"
              />
            </div>

            {form.enableGst ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field label="GST Number No" required error={errors.gstNumber}>
                    <TInput
                      value={form.gstNumber}
                      onChange={e => setField("gstNumber", e.target.value.toUpperCase())}
                      disabled={isReadOnly}
                      placeholder="e.g. 24AABCS4567K1Z3"
                      maxLength={15}
                      error={errors.gstNumber}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Eway Bill User Name" error={errors.ewayBillUsername}>
                    <TInput
                      value={form.ewayBillUsername}
                      onChange={e => setField("ewayBillUsername", e.target.value)}
                      disabled={isReadOnly}
                      placeholder="e-Way Bill portal login ID"
                      error={errors.ewayBillUsername}
                    />
                  </Field>
                  <Field label="Eway Bill Password" error={errors.ewayBillPassword}>
                    <TPassword
                      value={form.ewayBillPassword}
                      onChange={e => setField("ewayBillPassword", e.target.value)}
                      disabled={isReadOnly}
                      placeholder="e-Way Bill portal password"
                      error={errors.ewayBillPassword}
                    />
                  </Field>
                  <Field label="EInvoice User Name" error={errors.einvoiceUsername}>
                    <TInput
                      value={form.einvoiceUsername}
                      onChange={e => setField("einvoiceUsername", e.target.value)}
                      disabled={isReadOnly}
                      placeholder="e-Invoice (IRP) portal login ID"
                      error={errors.einvoiceUsername}
                    />
                  </Field>
                  <Field label="EInvoice Password" error={errors.einvoicePassword}>
                    <TPassword
                      value={form.einvoicePassword}
                      onChange={e => setField("einvoicePassword", e.target.value)}
                      disabled={isReadOnly}
                      placeholder="e-Invoice portal password"
                      error={errors.einvoicePassword}
                    />
                  </Field>
                </div>
                <p className="text-xs text-gray-400">
                  GST Number format: 2-digit state code + 10-char PAN + entity code + Z + check digit. First 2 digits must match the selected State. Passwords are masked and never shown in plain text after save.
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400">
                Tick "Enable GST Number" if this unit has a separate GST registration. The GST fields will become active and mandatory.
              </p>
            )}
          </div>

          {/* Remark */}
          <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Remark</p>
            <TTextarea
              value={form.remark}
              onChange={e => setField("remark", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="Internal notes — not printed on any document."
            />
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
    </Layout>
  );
}
