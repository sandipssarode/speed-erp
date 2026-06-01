import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Plus, Trash2, Edit2, FileText, CheckCircle,
  AlertCircle, RefreshCw, Printer, ChevronRight, ArrowLeft,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MASTER DATA
// ─────────────────────────────────────────────────────────────
const CUSTOMER_GROUPS = ["Retail", "Wholesale", "Distributor", "OEM", "Corporate", "Government", "Export", "E-Commerce", "SME", "MNC"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "JPY", "CNY"];
const COUNTRIES = ["India", "USA", "UK", "UAE", "Singapore", "Germany", "Japan", "China", "Australia", "Canada"];
const INDUSTRIES = ["Manufacturing", "Trading", "Services", "Construction", "Agriculture", "IT & Technology", "Healthcare", "Logistics", "Others"];
const SEGMENTS = ["Large Enterprise", "SME", "MSME", "Startup", "Government", "PSU", "MNC"];
const GST_STATUSES = ["Registered", "Unregistered", "Composition", "SEZ", "Exempt"];
const ACCOUNT_TYPES = ["Current", "Savings", "CC", "OD"];
const BANK_NAMES = [
  "State Bank of India", "Bank of Maharashtra", "Bank of India", "Bank of Baroda",
  "Canara Bank", "Punjab National Bank", "Union Bank of India", "Indian Bank",
  "Central Bank of India", "Indian Overseas Bank", "UCO Bank", "Punjab & Sind Bank",
  "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "IndusInd Bank",
  "Yes Bank", "IDFC First Bank", "Federal Bank", "South Indian Bank", "Karnataka Bank",
  "Karur Vysya Bank", "City Union Bank", "Tamilnad Mercantile Bank", "Dhanlaxmi Bank",
  "RBL Bank", "Bandhan Bank", "IDBI Bank", "Citibank", "HSBC Bank",
  "Standard Chartered Bank", "Deutsche Bank", "DBS Bank", "Barclays Bank",
  "Abu Dhabi Commercial Bank", "Saraswat Bank", "Cosmos Bank",
  "Shamrao Vithal Co-operative Bank", "Abhyudaya Co-operative Bank",
  "Bassein Catholic Co-operative Bank", "Other",
];
const COA_ACCOUNTS = [
  { code: "A001", name: "Sundry Debtors Local" },
  { code: "A002", name: "Trade Debtors Export" },
  { code: "A003", name: "Other Receivables" },
  { code: "L001", name: "Accounts Payable" },
  { code: "L002", name: "Trade Creditors" },
];
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
  id: "", code: "", name: "", group: "", currency: "INR",
  ledgerBalance: 0, creditLimit: "", creditDays: "",
  isDeactivated: false, reference: "",
  // Corporate Address
  corporateAddress: "", corporateCountry: "India", corporateState: "",
  corporateCity: "", corporatePinCode: "", phone: "", email: "", website: "",
  // Ship-to
  shipToSameAsCorporate: false,
  shipToAddress: "", shipToCountry: "India", shipToState: "",
  shipToCity: "", shipToPinCode: "", shipToPhone: "", shipToEmail: "",
  // Bill-to
  billToSameAsShipTo: false,
  billToAddress: "", billToCountry: "India", billToState: "",
  billToCity: "", billToPinCode: "", billToGstNo: "", billToPanNo: "",
  // Classification
  industry: "", segment: "", salesperson: "",
  // GST Details
  gstRegistrationStatus: "", gstRegistrationNo: "", gstRegistrationDate: "",
  panNo: "", arnNo: "", markAsRCM: false,
  // Sub-tables
  contactPersons: [], terms: [],
  // Accounts
  deductionApplicable: false, deductionCode: "", lcApplicable: false, bgApplicable: false,
  accountReceivable: "", accountPayable: "",
  // Bank
  benfName: "", benfEmail: "", benfMobile: "",
  banks: [],
  remark: "",
  // Meta
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────
function validate(form, allCustomers, editingId) {
  const e = {};

  if (!form.code.trim())
    e.code = "Customer Code already exists. Please enter a unique Customer Code.";
  else if (allCustomers.some((c) => c.code === form.code && c.id !== editingId))
    e.code = "Customer Code already exists. Please enter a unique Customer Code.";

  if (!form.name.trim()) e.name = "Customer Name is a required field.";
  else if (form.name.length > 100) e.name = "Customer Name cannot exceed 100 characters.";

  if (!form.currency) e.currency = "Currency is a required field.";

  // Corporate address
  if (!form.corporateCountry) e.corporateCountry = "Country is a required field.";
  if (form.corporateCountry === "India" && !form.corporateState)
    e.corporateState = "State is a required field.";
  if (form.corporatePinCode && !/^\d{6}$/.test(form.corporatePinCode))
    e.corporatePinCode = "Pin Code must be a 6-digit number.";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    e.email = "Please enter a valid email address. (e.g. name@domain.com)";

  // Ship-to address
  if (!form.shipToCountry) e.shipToCountry = "Country is a required field.";
  if (form.shipToCountry === "India" && !form.shipToState)
    e.shipToState = "State is a required field.";
  if (form.shipToEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.shipToEmail))
    e.shipToEmail = "Please enter a valid email address. (e.g. name@domain.com)";

  // Bill-to address
  if (!form.billToCountry) e.billToCountry = "Country is a required field.";
  if (form.billToCountry === "India" && !form.billToState)
    e.billToState = "State is a required field.";

  // GST Details
  if (!form.gstRegistrationStatus)
    e.gstRegistrationStatus = "GST Registration Status is a required field.";

  if (form.gstRegistrationStatus === "Registered") {
    if (!form.gstRegistrationNo.trim())
      e.gstRegistrationNo = "GST Registration Number is a required field for Registered customers.";
    else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstRegistrationNo))
      e.gstRegistrationNo = "Please enter a valid GST Registration Number. (Format: 2-digit state code + 10-char PAN + entity code + Z + check digit. e.g. 27AABCT1234A1Z5)";
    else if (form.corporateState) {
      const stCode = INDIAN_STATES.find((s) => s.name === form.corporateState)?.code;
      if (stCode && form.gstRegistrationNo.substring(0, 2) !== stCode)
        e.gstRegistrationNo = "Selected State does not match the GST Registration Number. Please verify the State and GSTIN.";
    }

    if (!form.panNo.trim()) e.panNo = "PAN Number is a required field.";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNo))
      e.panNo = "Please enter a valid PAN Number. (Format: 5 letters + 4 digits + 1 letter. e.g. AABCT1234A)";
    else if (form.gstRegistrationNo.length === 15 && form.gstRegistrationNo.substring(2, 12) !== form.panNo)
      e.panNo = "PAN Number does not match the GST Registration Number. Characters 3–12 of the GSTIN must match the PAN.";
  }

  if (form.gstRegistrationDate && new Date(form.gstRegistrationDate) > new Date())
    e.gstRegistrationDate = "GST Registration Date cannot be a future date.";

  // Accounts
  if (!form.accountReceivable)
    e.accountReceivable = "Account Receivable ledger is a required field. Please select a receivable ledger.";
  if (form.deductionApplicable && !form.deductionCode)
    e.deductionCode = "Deduction Code is a required field when Deduction is Applicable is enabled.";

  // Credit
  if (form.creditLimit !== "" && form.creditLimit !== null && Number(form.creditLimit) < 0)
    e.creditLimit = "Credit Limit must be zero or a positive number.";
  if (form.creditDays !== "" && form.creditDays !== null && Number(form.creditDays) < 0)
    e.creditDays = "Credit Days must be zero or a positive number.";

  // Contact Persons
  form.contactPersons.forEach((cp, i) => {
    if (!cp.name?.trim()) e[`cp_name_${i}`] = "Contact Name is a required field in the Contact Persons grid.";
    if (cp.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cp.email))
      e[`cp_email_${i}`] = "Please enter a valid email address. (e.g. name@domain.com)";
  });

  // Terms
  form.terms.forEach((t, i) => {
    if (!t.term?.trim()) e[`term_${i}`] = "Term is a required field.";
    if (!t.description?.trim()) e[`term_desc_${i}`] = "Term Description is a required field when a Term is entered.";
  });

  // Banks
  form.banks.forEach((b, i) => {
    if (b.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(b.ifscCode))
      e[`bank_ifsc_${i}`] = "Please enter a valid IFSC Code. (Format: 4-letter bank code + 0 + 6-digit branch code. e.g. HDFC0001234)";
    if (b.accountNo && b.accountNo.replace(/\D/g, "").length < 9)
      e[`bank_acno_${i}`] = "Bank Account Number must be at least 9 digits.";
    if (b.swiftCode && b.swiftCode.length !== 8 && b.swiftCode.length !== 11)
      e[`bank_swift_${i}`] = "Swift Code must be either 8 or 11 characters.";
    if (b.benfEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.benfEmail))
      e.benfEmail = "Please enter a valid email address. (e.g. name@domain.com)";
  });

  return e;
}

// ─────────────────────────────────────────────────────────────
// AUTO CODE GENERATOR
// ─────────────────────────────────────────────────────────────
function generateCode(name, customers) {
  const prefix = (name.trim().charAt(0) || "C").toUpperCase();
  const nums = customers
    .filter((c) => c.code.startsWith(prefix))
    .map((c) => parseInt(c.code.slice(prefix.length)) || 0);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// ─────────────────────────────────────────────────────────────
// REUSABLE UI PRIMITIVES
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
      {options.map((o) =>
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
        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-400 focus:ring-1"
      />
      <span className="text-gray-700">{label}</span>
    </label>
  );
}

function StateSelect({ country, value, onChange, disabled, error }) {
  if (country === "India") {
    return (
      <TSelect
        value={value} onChange={onChange} disabled={disabled} error={error}
        options={INDIAN_STATES.map((s) => ({ value: s.name, label: `${s.code} — ${s.name}` }))}
        placeholder="Select State"
      />
    );
  }
  return <TInput value={value} onChange={onChange} disabled={disabled} placeholder="State / Province" error={error} />;
}

// Generic address block
function AddressBlock({ title, badge, addrKey, countryKey, stateKey, cityKey, pinKey, form, onChange, disabled, errors, children }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
        {badge && <span className="text-xs bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100">{badge}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Field label="Address">
            <TTextarea value={form[addrKey]} onChange={(e) => onChange(addrKey, e.target.value)}
              disabled={disabled} rows={2} placeholder="Street / Area / Building / Landmark" />
          </Field>
        </div>
        <Field label="Country" required error={errors?.[countryKey]}>
          <TSelect value={form[countryKey]} onChange={(e) => { onChange(countryKey, e.target.value); onChange(stateKey, ""); }}
            disabled={disabled} options={COUNTRIES} error={errors?.[countryKey]} />
        </Field>
        <Field label="State" required={form[countryKey] === "India"} error={errors?.[stateKey]}>
          <StateSelect country={form[countryKey]} value={form[stateKey]}
            onChange={(e) => onChange(stateKey, e.target.value)}
            disabled={disabled} error={errors?.[stateKey]} />
        </Field>
        <Field label="City" error={errors?.[cityKey]}>
          <TInput value={form[cityKey]} onChange={(e) => onChange(cityKey, e.target.value)}
            disabled={disabled} placeholder="City" />
        </Field>
        <Field label="Pin Code" error={errors?.[pinKey]}>
          <TInput value={form[pinKey]} onChange={(e) => onChange(pinKey, e.target.value)}
            disabled={disabled} placeholder="6-digit PIN" maxLength={6} error={errors?.[pinKey]} />
        </Field>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("general");
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allCustomers, setAllCustomers] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    api.get("/api/customers").then((customers) => {
      setAllCustomers(customers);
      if (!isNew && id) {
        const found = customers.find((c) => c.id === id);
        if (found) setForm(found);
        else navigate("/sales/customers");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const setField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };

      // Auto-generate code when name changes in new mode
      if (key === "name" && mode === "new" && !prev.code) {
        next.code = generateCode(value, allCustomers);
      }

      // Copy corporate → ship-to
      if (key === "shipToSameAsCorporate" && value) {
        next.shipToAddress = prev.corporateAddress;
        next.shipToCountry = prev.corporateCountry;
        next.shipToState = prev.corporateState;
        next.shipToCity = prev.corporateCity;
        next.shipToPinCode = prev.corporatePinCode;
      }

      // Copy ship-to → bill-to
      if (key === "billToSameAsShipTo" && value) {
        const src = next;
        next.billToAddress = src.shipToAddress;
        next.billToCountry = src.shipToCountry;
        next.billToState = src.shipToState;
        next.billToCity = src.shipToCity;
        next.billToPinCode = src.shipToPinCode;
      }

      return next;
    });

    if (errors[key]) setErrors((prev) => { const e = { ...prev }; delete e[key]; return e; });
  };

  // ── Save ──
  const handleSave = async () => {
    const errs = validate(form, allCustomers, isNew ? null : id);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const keys = Object.keys(errs);
      if (keys.some((k) => ["code","name","currency","corporateCountry","corporateState","corporatePinCode","email",
        "shipToCountry","shipToState","billToCountry","billToState"].includes(k)))
        setActiveTab("general");
      else if (keys.some((k) => ["gstRegistrationStatus","gstRegistrationNo","gstRegistrationDate","panNo"].includes(k)))
        setActiveTab("gst");
      else if (keys.some((k) => k.startsWith("cp_"))) setActiveTab("contacts");
      else if (keys.some((k) => k.startsWith("term"))) setActiveTab("terms");
      else if (keys.some((k) => ["accountReceivable","deductionCode"].includes(k))) setActiveTab("accounts");
      else if (keys.some((k) => k.startsWith("bank_") || k === "benfEmail")) setActiveTab("banks");
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
        saved = await api.post("/api/customers", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/customers/${id}`, payload);
      }
      setForm(saved);
      setAllCustomers((prev) => isNew ? [...prev, saved] : prev.map((c) => c.id === saved.id ? saved : c));
      setMode("view");
      setErrors({});
      showToast("Customer saved successfully.");
      if (isNew) navigate(`/sales/customers/${saved.id}`, { replace: true });
    } catch (err) {
      showToast(err.message || "Failed to save customer.", "error");
    }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/sales/customers"); return; }
    try {
      const found = await api.get(`/api/customers/${id}`);
      setForm(found);
    } catch { /* keep current form */ }
    setMode("view");
    setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete customer "${form.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/customers/${id}`);
      navigate("/sales/customers");
    } catch (err) {
      showToast(err.message || "Failed to delete customer.", "error");
    }
  };

  // ── Sub-table helpers ──
  const addContact = () => setForm((p) => ({ ...p, contactPersons: [...p.contactPersons, { id: Date.now(), name: "", designation: "", email: "", mobile: "", landline: "", department: "" }] }));
  const updContact = (i, k, v) => setForm((p) => { const a = [...p.contactPersons]; a[i] = { ...a[i], [k]: v }; return { ...p, contactPersons: a }; });
  const delContact = (i) => setForm((p) => ({ ...p, contactPersons: p.contactPersons.filter((_, x) => x !== i) }));

  const addTerm = () => setForm((p) => ({ ...p, terms: [...p.terms, { id: Date.now(), line: p.terms.length + 1, term: "", description: "" }] }));
  const updTerm = (i, k, v) => setForm((p) => { const a = [...p.terms]; a[i] = { ...a[i], [k]: v }; return { ...p, terms: a }; });
  const delTerm = (i) => setForm((p) => ({ ...p, terms: p.terms.filter((_, x) => x !== i).map((t, x) => ({ ...t, line: x + 1 })) }));

  const addBank = () => setForm((p) => ({ ...p, banks: [...p.banks, { id: Date.now(), bankName: "", branch: "", accountNo: "", ifscCode: "", swiftCode: "", accountType: "" }] }));
  const updBank = (i, k, v) => setForm((p) => { const a = [...p.banks]; a[i] = { ...a[i], [k]: v }; return { ...p, banks: a }; });
  const delBank = (i) => setForm((p) => ({ ...p, banks: p.banks.filter((_, x) => x !== i) }));

  const TABS = [
    { id: "general",  label: "General Information" },
    { id: "gst",      label: "GST Details" },
    { id: "contacts", label: "Contact Persons" },
    { id: "terms",    label: "Terms & Conditions" },
    { id: "accounts", label: "Accounts" },
    { id: "banks",    label: "Bank Details" },
    { id: "remark",   label: "Remark" },
  ];

  const tabHasError = (tabId) => {
    const keys = Object.keys(errors);
    if (tabId === "general") return keys.some((k) => ["code","name","currency","corporateCountry","corporateState","corporatePinCode","email","shipToCountry","shipToState","billToCountry","billToState"].includes(k));
    if (tabId === "gst") return keys.some((k) => ["gstRegistrationStatus","gstRegistrationNo","gstRegistrationDate","panNo"].includes(k));
    if (tabId === "contacts") return keys.some((k) => k.startsWith("cp_"));
    if (tabId === "terms") return keys.some((k) => k.startsWith("term"));
    if (tabId === "accounts") return keys.some((k) => ["accountReceivable","deductionCode"].includes(k));
    if (tabId === "banks") return keys.some((k) => k.startsWith("bank_") || k === "benfEmail");
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
          <span>Sales</span><ChevronRight size={12} />
          <span>Master</span><ChevronRight size={12} />
          <button onClick={() => navigate("/sales/customers")} className="hover:text-blue-500 transition-colors">Customer Master</button>
          {form.code && <><ChevronRight size={12} /><span className="text-blue-600 font-medium">{form.code}</span></>}
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
            onClick={() => navigate("/sales/customers")}
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
              showChangelog ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText size={13} /> Changelog
          </button>

          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <RefreshCw size={13} /> GST Validator
          </button>

          <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium">
            <Printer size={13} /> Print Label
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
              <FileText size={14} /> Audit Log — {form.name || "New Customer"}
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
                        <span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
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
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.code || "NEW CUSTOMER"}</span>
            <span className="text-blue-200 text-sm">{form.name || "—"}</span>
            <div className="ml-auto flex items-center gap-2">
              {(mode === "new" || mode === "edit") && (
                <span className="bg-amber-400/30 text-amber-100 border border-amber-300/30 px-2 py-0.5 rounded text-xs font-medium">
                  {mode === "new" ? "New Record" : "Editing"}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                form.isDeactivated
                  ? "bg-red-400/20 text-red-100 border-red-300/30"
                  : "bg-green-400/20 text-green-100 border-green-300/30"
              }`}>
                {form.isDeactivated ? "Inactive" : "Active"}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Row 1: Code, Name, Group, Currency */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Customer Code" required error={errors.code}>
                <TInput
                  value={form.code}
                  onChange={(e) => setField("code", e.target.value.toUpperCase())}
                  disabled={isReadOnly}
                  placeholder="Auto / Manual"
                  error={errors.code}
                />
              </Field>
              <Field label="Customer Name" required error={errors.name}>
                <TInput
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Legal trading name"
                  maxLength={100}
                  error={errors.name}
                />
              </Field>
              <Field label="Customer Group" error={errors.group}>
                <TSelect
                  value={form.group}
                  onChange={(e) => setField("group", e.target.value)}
                  disabled={isReadOnly}
                  options={CUSTOMER_GROUPS}
                  placeholder="Select Group"
                />
              </Field>
              <Field label="Currency" required error={errors.currency}>
                <TSelect
                  value={form.currency}
                  onChange={(e) => setField("currency", e.target.value)}
                  disabled={isReadOnly}
                  options={CURRENCIES}
                  error={errors.currency}
                />
              </Field>
            </div>

            {/* Row 2: Ledger Balance, Credit Limit, Credit Days, Reference */}
            <div className="grid grid-cols-4 gap-4">
              <Field label="Ledger Balance (INR)">
                <div className={`${inputBase(true)} text-right font-mono`}>
                  {Number(form.ledgerBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </Field>
              <Field label="Credit Limit (INR)" error={errors.creditLimit}>
                <TInput
                  value={form.creditLimit}
                  onChange={(e) => setField("creditLimit", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="0 = No limit"
                  type="number"
                  error={errors.creditLimit}
                />
              </Field>
              <Field label="Credit Days" error={errors.creditDays}>
                <TInput
                  value={form.creditDays}
                  onChange={(e) => setField("creditDays", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="e.g. 30"
                  type="number"
                  error={errors.creditDays}
                />
              </Field>
              <Field label="Reference">
                <TInput
                  value={form.reference}
                  onChange={(e) => setField("reference", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Internal / legacy code"
                />
              </Field>
            </div>

            {/* Row 3: Deactivate */}
            <div className="flex items-center pt-1 border-t border-gray-100">
              <div className="ml-auto">
                <TCheckbox checked={form.isDeactivated} onChange={(e) => setField("isDeactivated", e.target.checked)} disabled={isReadOnly} label="Deactivate Customer" />
              </div>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {tab.label}
                {tabHasError(tab.id) && <AlertCircle size={12} className="text-red-400" />}
              </button>
            ))}
          </div>

          <div className="p-5">

            {/* ══════════ GENERAL INFORMATION ══════════ */}
            {activeTab === "general" && (
              <div className="space-y-5">

                {/* Corporate Address */}
                <AddressBlock
                  title="Corporate Address"
                  addrKey="corporateAddress" countryKey="corporateCountry" stateKey="corporateState"
                  cityKey="corporateCity" pinKey="corporatePinCode"
                  form={form} onChange={setField} disabled={isReadOnly} errors={errors}
                >
                  <Field label="Phone No">
                    <TInput value={form.phone} onChange={(e) => setField("phone", e.target.value)} disabled={isReadOnly} placeholder="10-digit number" />
                  </Field>
                  <Field label="Email" error={errors.email}>
                    <TInput value={form.email} onChange={(e) => setField("email", e.target.value)} disabled={isReadOnly} placeholder="customer@example.com" error={errors.email} />
                  </Field>
                  <div className="col-span-2">
                    <Field label="Website">
                      <TInput value={form.website} onChange={(e) => setField("website", e.target.value)} disabled={isReadOnly} placeholder="https://customer.com" />
                    </Field>
                  </div>
                </AddressBlock>

                {/* Ship-to Address */}
                <div className="space-y-2">
                  {!isReadOnly && (
                    <TCheckbox
                      checked={form.shipToSameAsCorporate}
                      onChange={(e) => setField("shipToSameAsCorporate", e.target.checked)}
                      disabled={isReadOnly}
                      label="Ship-to is same as Corporate Address"
                    />
                  )}
                  {isReadOnly && form.shipToSameAsCorporate && (
                    <p className="text-xs text-blue-500 font-medium">✓ Ship-to — same as Corporate Address</p>
                  )}
                  <AddressBlock
                    title="Ship-to Address"
                    badge={form.shipToSameAsCorporate ? "Copied from Corporate" : null}
                    addrKey="shipToAddress" countryKey="shipToCountry" stateKey="shipToState"
                    cityKey="shipToCity" pinKey="shipToPinCode"
                    form={form} onChange={setField}
                    disabled={isReadOnly || form.shipToSameAsCorporate}
                    errors={errors}
                  >
                    <Field label="Phone No" error={errors.shipToPhone}>
                      <TInput value={form.shipToPhone} onChange={(e) => setField("shipToPhone", e.target.value)} disabled={isReadOnly || form.shipToSameAsCorporate} placeholder="Delivery location contact" />
                    </Field>
                    <Field label="Email" error={errors.shipToEmail}>
                      <TInput value={form.shipToEmail} onChange={(e) => setField("shipToEmail", e.target.value)} disabled={isReadOnly || form.shipToSameAsCorporate} placeholder="Delivery notifications" error={errors.shipToEmail} />
                    </Field>
                  </AddressBlock>
                </div>

                {/* Bill-to Address */}
                <div className="space-y-2">
                  {!isReadOnly && (
                    <TCheckbox
                      checked={form.billToSameAsShipTo}
                      onChange={(e) => setField("billToSameAsShipTo", e.target.checked)}
                      disabled={isReadOnly}
                      label="Bill-to is same as Ship-to Address"
                    />
                  )}
                  {isReadOnly && form.billToSameAsShipTo && (
                    <p className="text-xs text-blue-500 font-medium">✓ Bill-to — same as Ship-to Address</p>
                  )}
                  <AddressBlock
                    title="Bill-to Address"
                    badge={form.billToSameAsShipTo ? "Copied from Ship-to" : null}
                    addrKey="billToAddress" countryKey="billToCountry" stateKey="billToState"
                    cityKey="billToCity" pinKey="billToPinCode"
                    form={form} onChange={setField}
                    disabled={isReadOnly || form.billToSameAsShipTo}
                    errors={errors}
                  >
                    <Field label="GST No (Billing)">
                      <TInput value={form.billToGstNo} onChange={(e) => setField("billToGstNo", e.target.value.toUpperCase())} disabled={isReadOnly || form.billToSameAsShipTo} placeholder="27AABCT1234A1Z5" maxLength={15} />
                    </Field>
                    <Field label="PAN No (Billing)">
                      <TInput value={form.billToPanNo} onChange={(e) => setField("billToPanNo", e.target.value.toUpperCase())} disabled={isReadOnly || form.billToSameAsShipTo} placeholder="AABCT1234A" maxLength={10} />
                    </Field>
                  </AddressBlock>
                </div>

                {/* Classification */}
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Classification</p>
                  <div className="grid grid-cols-3 gap-4">
                    <Field label="Industry">
                      <TSelect value={form.industry} onChange={(e) => setField("industry", e.target.value)} disabled={isReadOnly} options={INDUSTRIES} placeholder="Select Industry" />
                    </Field>
                    <Field label="Segment">
                      <TSelect value={form.segment} onChange={(e) => setField("segment", e.target.value)} disabled={isReadOnly} options={SEGMENTS} placeholder="Select Segment" />
                    </Field>
                    <Field label="Salesperson">
                      <TInput value={form.salesperson} onChange={(e) => setField("salesperson", e.target.value)} disabled={isReadOnly} placeholder="Assigned salesperson" />
                    </Field>
                  </div>
                </div>

              </div>
            )}

            {/* ══════════ GST DETAILS ══════════ */}
            {activeTab === "gst" && (
              <div className="max-w-3xl">
                <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-4 space-y-4">
                  <p className="text-xs font-bold text-blue-700 uppercase tracking-widest">GST & Statutory Details</p>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="GST Registration Status" required error={errors.gstRegistrationStatus}>
                      <TSelect
                        value={form.gstRegistrationStatus}
                        onChange={(e) => setField("gstRegistrationStatus", e.target.value)}
                        disabled={isReadOnly}
                        options={GST_STATUSES}
                        placeholder="Select Status"
                        error={errors.gstRegistrationStatus}
                      />
                    </Field>
                    <Field label="GST Registration No" required={form.gstRegistrationStatus === "Registered"} error={errors.gstRegistrationNo}>
                      <TInput
                        value={form.gstRegistrationNo}
                        onChange={(e) => setField("gstRegistrationNo", e.target.value.toUpperCase())}
                        disabled={isReadOnly}
                        placeholder="27AABCT1234A1Z5"
                        maxLength={15}
                        error={errors.gstRegistrationNo}
                      />
                    </Field>
                    <Field label="PAN No" required={form.gstRegistrationStatus === "Registered"} error={errors.panNo}>
                      <TInput
                        value={form.panNo}
                        onChange={(e) => setField("panNo", e.target.value.toUpperCase())}
                        disabled={isReadOnly}
                        placeholder="AABCT1234A"
                        maxLength={10}
                        error={errors.panNo}
                      />
                    </Field>
                    <Field label="GST Registration Date" error={errors.gstRegistrationDate}>
                      <input
                        type="date"
                        value={form.gstRegistrationDate || ""}
                        onChange={(e) => setField("gstRegistrationDate", e.target.value)}
                        disabled={isReadOnly}
                        className={inputBase(isReadOnly, errors.gstRegistrationDate)}
                      />
                      {errors.gstRegistrationDate && (
                        <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                          <AlertCircle size={11} />{errors.gstRegistrationDate}
                        </p>
                      )}
                    </Field>
                    <Field label="ARN No">
                      <TInput value={form.arnNo} onChange={(e) => setField("arnNo", e.target.value)} disabled={isReadOnly} placeholder="Provisional GST reference" />
                    </Field>
                    <div className="flex items-end pb-1">
                      <TCheckbox checked={form.markAsRCM} onChange={(e) => setField("markAsRCM", e.target.checked)} disabled={isReadOnly} label="Mark as RCM Customer" />
                    </div>
                  </div>

                  {form.gstRegistrationStatus === "Unregistered" && (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2.5">
                      <p className="text-xs text-amber-700 font-medium">Unregistered customer — GST will not be charged on invoices raised for this customer.</p>
                    </div>
                  )}
                  {form.markAsRCM && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-2.5">
                      <p className="text-xs text-blue-700 font-medium">RCM Customer — Reverse Charge Mechanism accounting entries will be triggered on all sales invoices for this customer.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════ CONTACT PERSONS ══════════ */}
            {activeTab === "contacts" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{form.contactPersons.length} contact person(s)</p>
                  {!isReadOnly && (
                    <button onClick={addContact} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded">
                      <Plus size={13} /> Add Contact
                    </button>
                  )}
                </div>

                {form.contactPersons.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No contact persons added.{!isReadOnly && ' Click "Add Contact" to add one.'}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-x-auto">
                    <table className="w-full text-sm min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <th className="px-3 py-2 text-left w-8">#</th>
                          <th className="px-3 py-2 text-left">Name <span className="text-red-400 normal-case font-normal">*</span></th>
                          <th className="px-3 py-2 text-left">Designation</th>
                          <th className="px-3 py-2 text-left">Email</th>
                          <th className="px-3 py-2 text-left">Mobile</th>
                          <th className="px-3 py-2 text-left">Landline</th>
                          <th className="px-3 py-2 text-left">Department</th>
                          {!isReadOnly && <th className="px-3 py-2 w-8"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {form.contactPersons.map((cp, i) => (
                          <tr key={cp.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 min-w-[140px]">
                              <TInput value={cp.name} onChange={(e) => updContact(i, "name", e.target.value)} disabled={isReadOnly} placeholder="Full Name" error={errors[`cp_name_${i}`]} />
                              {errors[`cp_name_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`cp_name_${i}`]}</p>}
                            </td>
                            <td className="px-3 py-2 min-w-[130px]"><TInput value={cp.designation} onChange={(e) => updContact(i, "designation", e.target.value)} disabled={isReadOnly} placeholder="Designation" /></td>
                            <td className="px-3 py-2 min-w-[160px]">
                              <TInput value={cp.email} onChange={(e) => updContact(i, "email", e.target.value)} disabled={isReadOnly} placeholder="email@example.com" error={errors[`cp_email_${i}`]} />
                              {errors[`cp_email_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`cp_email_${i}`]}</p>}
                            </td>
                            <td className="px-3 py-2 min-w-[120px]"><TInput value={cp.mobile} onChange={(e) => updContact(i, "mobile", e.target.value)} disabled={isReadOnly} placeholder="10-digit mobile" /></td>
                            <td className="px-3 py-2 min-w-[120px]"><TInput value={cp.landline} onChange={(e) => updContact(i, "landline", e.target.value)} disabled={isReadOnly} placeholder="Landline + STD" /></td>
                            <td className="px-3 py-2 min-w-[120px]"><TInput value={cp.department} onChange={(e) => updContact(i, "department", e.target.value)} disabled={isReadOnly} placeholder="Department" /></td>
                            {!isReadOnly && (
                              <td className="px-3 py-2">
                                <button onClick={() => delContact(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
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

            {/* ══════════ TERMS & CONDITIONS ══════════ */}
            {activeTab === "terms" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{form.terms.length} term(s)</p>
                  {!isReadOnly && (
                    <button onClick={addTerm} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded">
                      <Plus size={13} /> Add Term
                    </button>
                  )}
                </div>

                {form.terms.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No terms added.{!isReadOnly && ' Click "Add Term" to add one.'}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <th className="px-3 py-2 text-left w-12">Line</th>
                          <th className="px-3 py-2 text-left w-52">Term <span className="text-red-400 normal-case font-normal">*</span></th>
                          <th className="px-3 py-2 text-left">Description <span className="text-red-400 normal-case font-normal">*</span></th>
                          {!isReadOnly && <th className="px-3 py-2 w-8"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {form.terms.map((t, i) => (
                          <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                            <td className="px-3 py-2 text-xs text-gray-400 font-mono font-medium">{t.line}</td>
                            <td className="px-3 py-2">
                              <TInput value={t.term} onChange={(e) => updTerm(i, "term", e.target.value)} disabled={isReadOnly} placeholder="e.g. Payment Terms" error={errors[`term_${i}`]} />
                              {errors[`term_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`term_${i}`]}</p>}
                            </td>
                            <td className="px-3 py-2">
                              <TTextarea value={t.description} onChange={(e) => updTerm(i, "description", e.target.value)} disabled={isReadOnly} rows={2} placeholder="Full clause text printed on SO and quotation..." />
                              {errors[`term_desc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`term_desc_${i}`]}</p>}
                            </td>
                            {!isReadOnly && (
                              <td className="px-3 py-2">
                                <button onClick={() => delTerm(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
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

            {/* ══════════ ACCOUNTS ══════════ */}
            {activeTab === "accounts" && (
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-100 pb-2">Flags</p>
                  <TCheckbox checked={form.deductionApplicable} onChange={(e) => setField("deductionApplicable", e.target.checked)} disabled={isReadOnly} label="Deduction Applicable" />
                  {form.deductionApplicable && (
                    <Field label="Deduction Code" required error={errors.deductionCode}>
                      <TSelect
                        value={form.deductionCode}
                        onChange={(e) => setField("deductionCode", e.target.value)}
                        disabled={isReadOnly}
                        options={COA_ACCOUNTS.map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                        placeholder="Select Deduction Ledger"
                        error={errors.deductionCode}
                      />
                    </Field>
                  )}
                  <TCheckbox checked={form.lcApplicable} onChange={(e) => setField("lcApplicable", e.target.checked)} disabled={isReadOnly} label="LC Applicable" />
                  <TCheckbox checked={form.bgApplicable} onChange={(e) => setField("bgApplicable", e.target.checked)} disabled={isReadOnly} label="BG Applicable" />
                </div>

                <div className="col-span-2 space-y-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide border-b border-gray-100 pb-2">Chart of Accounts Mapping</p>
                  <Field label="Account Receivable" required error={errors.accountReceivable}>
                    <TSelect
                      value={form.accountReceivable}
                      onChange={(e) => setField("accountReceivable", e.target.value)}
                      disabled={isReadOnly}
                      options={COA_ACCOUNTS.filter((c) => c.code.startsWith("A")).map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                      placeholder="Select Receivable Ledger"
                      error={errors.accountReceivable}
                    />
                  </Field>
                  <Field label="Account Payable">
                    <TSelect
                      value={form.accountPayable}
                      onChange={(e) => setField("accountPayable", e.target.value)}
                      disabled={isReadOnly}
                      options={COA_ACCOUNTS.filter((c) => c.code.startsWith("L")).map((c) => ({ value: c.code, label: `${c.code} — ${c.name}` }))}
                      placeholder="Select Account (if customer is also a vendor)"
                    />
                  </Field>
                  <p className="text-xs text-gray-400">Account Payable is applicable only when this customer is also registered as a vendor.</p>
                </div>
              </div>
            )}

            {/* ══════════ BANK DETAILS ══════════ */}
            {activeTab === "banks" && (
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-4 grid grid-cols-3 gap-4">
                  <p className="col-span-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">Beneficiary Information</p>
                  <Field label="Beneficiary Name">
                    <TInput value={form.benfName} onChange={(e) => setField("benfName", e.target.value)} disabled={isReadOnly} placeholder="Account holder name" />
                  </Field>
                  <Field label="Beneficiary Email" error={errors.benfEmail}>
                    <TInput value={form.benfEmail} onChange={(e) => setField("benfEmail", e.target.value)} disabled={isReadOnly} placeholder="Refund advice email" error={errors.benfEmail} />
                  </Field>
                  <Field label="Beneficiary Mobile">
                    <TInput value={form.benfMobile} onChange={(e) => setField("benfMobile", e.target.value)} disabled={isReadOnly} placeholder="10-digit mobile" />
                  </Field>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{form.banks.length} bank account(s)</p>
                  {!isReadOnly && (
                    <button onClick={addBank} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded">
                      <Plus size={13} /> Add Bank Account
                    </button>
                  )}
                </div>

                {form.banks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                    No bank accounts added.{!isReadOnly && ' Click "Add Bank Account" to add one.'}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded overflow-x-auto">
                    <table className="w-full text-sm min-w-[900px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <th className="px-3 py-2 text-left w-8">#</th>
                          <th className="px-3 py-2 text-left">Bank Name</th>
                          <th className="px-3 py-2 text-left">Branch</th>
                          <th className="px-3 py-2 text-left">Account No</th>
                          <th className="px-3 py-2 text-left">IFSC Code</th>
                          <th className="px-3 py-2 text-left">Swift Code</th>
                          <th className="px-3 py-2 text-left">Account Type</th>
                          {!isReadOnly && <th className="px-3 py-2 w-8"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {form.banks.map((b, i) => (
                          <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50 align-top">
                            <td className="px-3 py-2 text-xs text-gray-400">{i + 1}</td>
                            <td className="px-3 py-2 min-w-[200px]"><TSelect value={b.bankName} onChange={(e) => updBank(i, "bankName", e.target.value)} disabled={isReadOnly} options={BANK_NAMES} placeholder="Select Bank" /></td>
                            <td className="px-3 py-2 min-w-[130px]"><TInput value={b.branch} onChange={(e) => updBank(i, "branch", e.target.value)} disabled={isReadOnly} placeholder="Branch" /></td>
                            <td className="px-3 py-2 min-w-[160px]">
                              <TInput value={b.accountNo} onChange={(e) => updBank(i, "accountNo", e.target.value)} disabled={isReadOnly} placeholder="Min 9 digits" error={errors[`bank_acno_${i}`]} />
                              {errors[`bank_acno_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`bank_acno_${i}`]}</p>}
                            </td>
                            <td className="px-3 py-2 min-w-[140px]">
                              <TInput value={b.ifscCode} onChange={(e) => updBank(i, "ifscCode", e.target.value.toUpperCase())} disabled={isReadOnly} placeholder="HDFC0001234" maxLength={11} error={errors[`bank_ifsc_${i}`]} />
                              {errors[`bank_ifsc_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`bank_ifsc_${i}`]}</p>}
                            </td>
                            <td className="px-3 py-2 min-w-[120px]">
                              <TInput value={b.swiftCode} onChange={(e) => updBank(i, "swiftCode", e.target.value.toUpperCase())} disabled={isReadOnly} placeholder="HDFCINBB" error={errors[`bank_swift_${i}`]} />
                              {errors[`bank_swift_${i}`] && <p className="text-xs text-red-500 mt-0.5">{errors[`bank_swift_${i}`]}</p>}
                            </td>
                            <td className="px-3 py-2 min-w-[130px]">
                              <TSelect value={b.accountType} onChange={(e) => updBank(i, "accountType", e.target.value)} disabled={isReadOnly} options={ACCOUNT_TYPES} placeholder="Type" />
                            </td>
                            {!isReadOnly && (
                              <td className="px-3 py-2">
                                <button onClick={() => delBank(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
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
                    onChange={(e) => setField("remark", e.target.value)}
                    disabled={isReadOnly}
                    rows={6}
                    placeholder="Internal notes — not printed on any document. Use for credit risk notes, relationship history."
                  />
                </Field>
                <p className="text-xs text-gray-400 mt-1">This field is for internal reference only and will not appear on SOs, invoices, or any printed document.</p>
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
    </Layout>
  );
}
