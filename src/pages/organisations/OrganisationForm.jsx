import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Edit2, Trash2, FileText, CheckCircle,
  AlertCircle, ChevronRight, ArrowLeft, Building2, Upload, ImageOff,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MASTER DATA
// ─────────────────────────────────────────────────────────────
const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" }, { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" }, { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" }, { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" }, { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" }, { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" }, { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" }, { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" }, { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" }, { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" }, { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" }, { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" }, { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" }, { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" }, { code: "28", name: "Andhra Pradesh (Old)" },
  { code: "29", name: "Karnataka" }, { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" }, { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" }, { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar" }, { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" }, { code: "38", name: "Ladakh" },
  { code: "97", name: "Other Territory" }, { code: "99", name: "Centre Jurisdiction" },
];

const ENTITY_TYPES = ["Head Office", "Branch", "Subsidiary", "Division", "Other"];

const TIME_ZONES = [
  "(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi",
  "(UTC+00:00) UTC — Coordinated Universal Time",
  "(UTC+05:00) Islamabad, Karachi",
  "(UTC+06:00) Dhaka",
  "(UTC+05:45) Kathmandu",
  "(UTC+08:00) Kuala Lumpur, Singapore",
  "(UTC+08:00) Beijing, Hong Kong, Taipei",
  "(UTC+09:00) Tokyo, Osaka, Seoul",
  "(UTC+04:00) Dubai, Abu Dhabi",
  "(UTC+03:00) Moscow, Riyadh",
  "(UTC+02:00) Cairo, Johannesburg",
  "(UTC+01:00) London (BST)",
  "(UTC+00:00) London (GMT)",
  "(UTC-05:00) Eastern Time (US & Canada)",
  "(UTC-06:00) Central Time (US & Canada)",
  "(UTC-07:00) Mountain Time (US & Canada)",
  "(UTC-08:00) Pacific Time (US & Canada)",
];

const CURRENCIES = [
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "AED", label: "AED — UAE Dirham" },
  { code: "SGD", label: "SGD — Singapore Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
];

// ─────────────────────────────────────────────────────────────
// EMPTY FORM
// ─────────────────────────────────────────────────────────────
const emptyForm = () => ({
  companyCode: "", companyName: "", companyLogo: "",
  companyWebsite: "", companyEmail: "",
  address: "", zipcode: "", state: "", city: "",
  registrationNo: "", gstNumber: "", type: "", timeZone: "", defaultCurrency: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────
function validate(form, allOrgs, editingId, originalCode) {
  const e = {};

  if (!form.companyCode.trim())
    e.companyCode = "Company Code is a required field.";
  else if (allOrgs.some(o => o.companyCode === form.companyCode.trim() && o.id !== editingId))
    e.companyCode = "Company Code already exists. Please enter a unique code.";
  else if (editingId && originalCode && form.companyCode.trim() !== originalCode)
    e.companyCode = "Company Code cannot be changed once transactions exist against this company.";

  if (!form.companyName.trim())
    e.companyName = "Company Name is a required field.";
  else if (form.companyName.trim().length > 150)
    e.companyName = "Company Name must not exceed 150 characters.";

  if (!form.address.trim())
    e.address = "Address is a required field.";

  if (!form.type)
    e.type = "Type is a required field.";

  if (!form.timeZone)
    e.timeZone = "Time Zone is a required field.";

  if (!form.defaultCurrency)
    e.defaultCurrency = "Default Currency is a required field.";

  if (form.gstNumber.trim()) {
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim()))
      e.gstNumber = "GST Number must be 15 characters in valid format (e.g. 29AABCT1332L000).";
    else if (form.state) {
      const st = INDIAN_STATES.find(s => s.name === form.state);
      if (st && form.gstNumber.trim().substring(0, 2) !== st.code)
        e.gstNumber = "GST Number state code does not match the selected State.";
    }
  }

  if (form.companyEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail.trim()))
    e.companyEmail = "Please enter a valid email address (e.g. info@company.com).";

  if (form.companyWebsite.trim() && !/^https?:\/\/.+/.test(form.companyWebsite.trim()))
    e.companyWebsite = "Please enter a valid website URL (e.g. http://company.com).";

  if (form.zipcode.trim() && !/^\d{6}$/.test(form.zipcode.trim()))
    e.zipcode = "Zipcode must be a 6-digit PIN code.";

  return e;
}

// ─────────────────────────────────────────────────────────────
// UI PRIMITIVES
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
          : <option key={o.value ?? o.code} value={o.value ?? o.code}>{o.label ?? o.name}</option>
      )}
    </select>
  );
}

function TTextarea({ value, onChange, disabled, rows = 3, placeholder, error }) {
  return (
    <textarea
      value={value ?? ""} onChange={onChange} disabled={disabled}
      rows={rows} placeholder={placeholder}
      className={`${inputBase(disabled, error)} resize-none`}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// SECTION CARD WRAPPER
// ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm">
      <div className="px-5 py-2.5 border-b border-gray-100 bg-gray-50 rounded-t">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function OrganisationForm() {
  const navigate = useNavigate();
  const { id }   = useParams();
  const isNew    = !id;

  const [mode, setMode]         = useState(isNew ? "new" : "view");
  const [form, setForm]         = useState(emptyForm());
  const [errors, setErrors]     = useState({});
  const [toast, setToast]       = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allOrgs, setAllOrgs]   = useState([]);
  const [originalCode, setOriginalCode] = useState("");
  const logoInputRef = useRef();

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    api.get("/api/organisations").then(list => {
      setAllOrgs(list);
      if (!isNew && id) {
        const found = list.find(o => o.id === id);
        if (found) {
          setForm(found);
          setOriginalCode(found.companyCode);
        } else {
          navigate("/system/organisations");
        }
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

  // ── Logo upload ──
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrors(prev => ({ ...prev, companyLogo: "Company Logo must be a JPG or PNG image file." }));
      return;
    }
    if (errors.companyLogo) setErrors(prev => { const e = { ...prev }; delete e.companyLogo; return e; });
    const reader = new FileReader();
    reader.onload = ev => setField("companyLogo", ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Save ──
  const handleSave = async () => {
    const errs = validate(form, allOrgs, isNew ? null : id, originalCode);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast("Please correct the highlighted fields and try again.", "error");
      return;
    }

    const now      = new Date().toISOString();
    const userName = user.name || user.fullName || "System";
    const entry    = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };

    try {
      let saved;
      if (isNew) {
        const payload = { ...form, id: Date.now().toString(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
        saved = await api.post("/api/organisations", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), entry] };
        saved = await api.put(`/api/organisations/${id}`, payload);
      }
      setForm(saved);
      setOriginalCode(saved.companyCode);
      setAllOrgs(prev => isNew ? [...prev, saved] : prev.map(o => o.id === saved.id ? saved : o));
      setMode("view");
      setErrors({});
      showToast("Organisation saved successfully.");
      if (isNew) navigate(`/system/organisations/${saved.id}`, { replace: true });
    } catch (err) {
      const msg = err.message || "Failed to save organisation.";
      if (msg.toLowerCase().includes("already exists"))
        setErrors(prev => ({ ...prev, companyCode: "Company Code already exists. Please enter a unique code." }));
      showToast(msg, "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/system/organisations"); return; }
    try {
      const found = await api.get(`/api/organisations/${id}`);
      setForm(found);
    } catch { /* keep current */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete organisation "${form.companyName}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/organisations/${id}`);
      navigate("/system/organisations");
    } catch (err) {
      showToast(err.message || "Failed to delete organisation.", "error");
    }
  };

  const typeColor = {
    "Head Office": "text-purple-700 bg-purple-50 border-purple-200",
    "Branch":      "text-blue-700 bg-blue-50 border-blue-200",
    "Subsidiary":  "text-teal-700 bg-teal-50 border-teal-200",
    "Division":    "text-orange-700 bg-orange-50 border-orange-200",
    "Other":       "text-gray-600 bg-gray-50 border-gray-200",
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
          <button onClick={() => navigate("/system/organisations")} className="hover:text-brand-500 transition-colors">Organisation Master</button>
          {form.companyCode && <><ChevronRight size={12} /><span className="text-brand-600 font-medium">{form.companyCode}</span></>}
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
            onClick={() => navigate("/system/organisations")}
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
              <FileText size={14} /> Audit Log — {form.companyName || "New Organisation"}
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

        {/* ── STATUS BAR ── */}
        <div className="bg-gradient-to-r from-brand-900 to-brand-600 px-5 py-3 rounded flex items-center gap-4 text-white shadow-sm">
          {/* Logo preview */}
          <div className="w-10 h-10 rounded bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
            {form.companyLogo ? (
              <img src={form.companyLogo} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <Building2 size={20} className="text-white/50" />
            )}
          </div>
          <div>
            <p className="font-bold text-base tracking-wide leading-none">{form.companyCode || "NEW ORGANISATION"}</p>
            <p className="text-blue-200 text-sm mt-0.5 leading-none">{form.companyName || "—"}</p>
          </div>
          <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
            {(mode === "new" || mode === "edit") && (
              <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                {mode === "new" ? "New Record" : "Editing"}
              </span>
            )}
            {form.type && (
              <span className="bg-white/15 text-white border border-white/20 px-2 py-0.5 rounded text-xs font-medium">
                {form.type}
              </span>
            )}
            {form.defaultCurrency && (
              <span className="bg-white/15 text-white border border-white/20 px-2 py-0.5 rounded text-xs font-mono font-semibold">
                {form.defaultCurrency}
              </span>
            )}
          </div>
        </div>

        {/* ── SECTION 1: COMPANY DETAILS ── */}
        <SectionCard title="Company Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* Company Code */}
            <Field label="Company Code" required error={errors.companyCode}>
              <TInput
                value={form.companyCode}
                onChange={e => setField("companyCode", e.target.value.toUpperCase().replace(/\s/g, ""))}
                disabled={isReadOnly}
                placeholder="e.g. SI001"
                maxLength={20}
                error={errors.companyCode}
              />
              {!isReadOnly && (
                <p className="text-xs text-gray-400 mt-0.5">Unique identifier — cannot be changed once transactions exist.</p>
              )}
            </Field>

            {/* Company Name */}
            <Field label="Company Name" required error={errors.companyName} className="lg:col-span-2">
              <TInput
                value={form.companyName}
                onChange={e => setField("companyName", e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Speed IT Innovations Pvt. Ltd."
                maxLength={150}
                error={errors.companyName}
              />
            </Field>

            {/* Company Logo */}
            <Field label="Company Logo" error={errors.companyLogo}>
              {isReadOnly ? (
                <div className="flex items-center gap-3">
                  {form.companyLogo ? (
                    <img src={form.companyLogo} alt="logo" className="h-14 max-w-[120px] object-contain border border-gray-200 rounded p-1 bg-white" />
                  ) : (
                    <div className="h-14 w-24 border border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-300">
                      <ImageOff size={18} />
                      <span className="text-[10px] mt-1">No Logo</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {form.companyLogo ? (
                      <img src={form.companyLogo} alt="logo" className="h-12 max-w-[100px] object-contain border border-gray-200 rounded p-1 bg-white" />
                    ) : (
                      <div className="h-12 w-20 border border-dashed border-gray-200 rounded flex flex-col items-center justify-center text-gray-300">
                        <ImageOff size={16} />
                      </div>
                    )}
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded"
                      >
                        <Upload size={12} /> Upload Logo
                      </button>
                      {form.companyLogo && (
                        <button
                          type="button"
                          onClick={() => setField("companyLogo", "")}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600"
                        >
                          <X size={11} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-gray-400">JPG or PNG format only.</p>
                </div>
              )}
            </Field>

            {/* Company Website */}
            <Field label="Company Website" error={errors.companyWebsite}>
              <TInput
                value={form.companyWebsite}
                onChange={e => setField("companyWebsite", e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. https://speedinnovations.in"
                error={errors.companyWebsite}
              />
            </Field>

            {/* Company Email */}
            <Field label="Company Email" error={errors.companyEmail}>
              <TInput
                value={form.companyEmail}
                onChange={e => setField("companyEmail", e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. info@speedinnovations.in"
                type="email"
                error={errors.companyEmail}
              />
            </Field>

          </div>
        </SectionCard>

        {/* ── SECTION 2: COMPANY ADDRESS ── */}
        <SectionCard title="Company Address">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <Field label="Address" required error={errors.address} className="col-span-1 sm:col-span-2 lg:col-span-4">
              <TTextarea
                value={form.address}
                onChange={e => setField("address", e.target.value)}
                disabled={isReadOnly}
                rows={3}
                placeholder="Physical / registered office address — printed on all outward documents"
                error={errors.address}
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

            <Field label="State" error={errors.state}>
              <TSelect
                value={form.state}
                onChange={e => setField("state", e.target.value)}
                disabled={isReadOnly}
                options={INDIAN_STATES.map(s => ({ value: s.name, label: `${s.code} — ${s.name}` }))}
                placeholder="Select State"
              />
              {!isReadOnly && (
                <p className="text-xs text-gray-400 mt-0.5">Drives IGST vs CGST+SGST logic on outward supplies.</p>
              )}
            </Field>

            <Field label="City" error={errors.city}>
              <TInput
                value={form.city}
                onChange={e => setField("city", e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Vadodara"
              />
            </Field>

          </div>
        </SectionCard>

        {/* ── SECTION 3: OTHER DETAILS ── */}
        <SectionCard title="Other Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <Field label="Registration No (CIN)" error={errors.registrationNo}>
              <TInput
                value={form.registrationNo}
                onChange={e => setField("registrationNo", e.target.value.toUpperCase())}
                disabled={isReadOnly}
                placeholder="e.g. U72900GJ2018PTC103456"
                maxLength={21}
              />
            </Field>

            <Field label="GST Number" error={errors.gstNumber}>
              <TInput
                value={form.gstNumber}
                onChange={e => setField("gstNumber", e.target.value.toUpperCase())}
                disabled={isReadOnly}
                placeholder="e.g. 24AASSI1234A1Z5"
                maxLength={15}
                error={errors.gstNumber}
              />
              {!isReadOnly && (
                <p className="text-xs text-gray-400 mt-0.5">15-char: state code + PAN + entity + Z + check digit</p>
              )}
            </Field>

            <Field label="Type" required error={errors.type}>
              <TSelect
                value={form.type}
                onChange={e => setField("type", e.target.value)}
                disabled={isReadOnly}
                options={ENTITY_TYPES}
                placeholder="Select Type"
                error={errors.type}
              />
            </Field>

            <Field label="Time Zone" required error={errors.timeZone}>
              <TSelect
                value={form.timeZone}
                onChange={e => setField("timeZone", e.target.value)}
                disabled={isReadOnly}
                options={TIME_ZONES}
                placeholder="Select Time Zone"
                error={errors.timeZone}
              />
            </Field>

            <Field label="Default Currency" required error={errors.defaultCurrency}>
              <TSelect
                value={form.defaultCurrency}
                onChange={e => setField("defaultCurrency", e.target.value)}
                disabled={isReadOnly}
                options={CURRENCIES.map(c => ({ value: c.code, label: c.label }))}
                placeholder="Select Currency"
                error={errors.defaultCurrency}
              />
              {!isReadOnly && (
                <p className="text-xs text-gray-400 mt-0.5">Drives default currency on all POs, SOs, invoices and reports.</p>
              )}
            </Field>

          </div>
        </SectionCard>

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


