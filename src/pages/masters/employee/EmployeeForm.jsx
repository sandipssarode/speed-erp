import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, X, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";

const LEVEL_OPTIONS = [
  { value: "L1", label: "L1 — Top Management" },
  { value: "L2", label: "L2 — Senior Management" },
  { value: "L3", label: "L3 — Middle Management" },
  { value: "L4", label: "L4 — Executive" },
  { value: "L5", label: "L5 — Staff / Operator" },
];

const EMP_TYPE_OPTIONS = ["Permanent", "Contract", "Probation", "Intern"];
const STATUS_OPTIONS = ["Active", "On Leave", "Resigned", "Terminated"];

function Field({ label, required, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={11} className="shrink-0" />{error}</p>}
    </div>
  );
}

const inputBase = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-blue-400"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

function TInput({ value, onChange, disabled, placeholder, maxLength, type = "text", error }) {
  return <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} maxLength={maxLength} className={inputBase(disabled, error)} />;
}

function TSelect({ value, onChange, disabled, options, placeholder, error }) {
  return (
    <select value={value ?? ""} onChange={onChange} disabled={disabled} className={inputBase(disabled, error)}>
      <option value="">{placeholder || "Select..."}</option>
      {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

const emptyForm = () => ({
  employeeId: `EMP-${Date.now().toString().slice(-5)}`,
  firstName: "",
  lastName: "",
  mobile: "",
  email: "",
  departmentId: "",
  departmentName: "",
  designationId: "",
  designationName: "",
  level: "",
  employeeType: "",
  dateOfJoining: "",
  reportingManagerId: "",
  reportingManagerName: "",
  status: "Active",
  isDeactivated: false,
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.employeeId?.trim()) e.employeeId = "Employee ID is required.";
  else if (allRecords.some(r => r.employeeId?.trim().toLowerCase() === form.employeeId.trim().toLowerCase() && r.id !== editingId))
    e.employeeId = "Employee ID already exists.";
  if (!form.firstName?.trim()) e.firstName = "First Name is required.";
  if (!form.lastName?.trim()) e.lastName = "Last Name is required.";
  if (!form.mobile?.trim()) e.mobile = "Mobile No. is required.";
  else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = "Mobile No. must be exactly 10 digits.";
  if (!form.email?.trim()) e.email = "Email ID is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email format.";
  else if (allRecords.some(r => r.email?.trim().toLowerCase() === form.email.trim().toLowerCase() && r.id !== editingId))
    e.email = "Email ID already exists.";
  if (!form.departmentId) e.departmentId = "Department is required.";
  if (!form.designationId) e.designationId = "Designation is required.";
  if (!form.level) e.level = "Level is required.";
  if (!form.employeeType) e.employeeType = "Employee Type is required.";
  if (!form.status) e.status = "Status is required.";
  return e;
}

export default function EmployeeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    Promise.all([
      api.get("/api/employees"),
      api.get("/api/departments").catch(() => []),
      api.get("/api/designations").catch(() => []),
    ]).then(([employees, depts, desigs]) => {
      setAllRecords(employees);
      setDepartments(depts.filter(d => !d.isDeactivated));
      setDesignations(desigs.filter(d => !d.isDeactivated));
      if (!isNew && id) {
        const found = employees.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/employee");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => { setForm(prev => ({ ...prev, [key]: value })); if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; }); };

  const handleDeptChange = (deptId) => {
    const found = departments.find(d => d.id === deptId);
    setForm(prev => ({ ...prev, departmentId: deptId, departmentName: found?.departmentName || "" }));
    if (errors.departmentId) setErrors(prev => { const e = { ...prev }; delete e.departmentId; return e; });
  };

  const handleDesigChange = (desigId) => {
    const found = designations.find(d => d.id === desigId);
    setForm(prev => ({ ...prev, designationId: desigId, designationName: found?.designationName || "", level: found?.level || prev.level }));
    if (errors.designationId) setErrors(prev => { const e = { ...prev }; delete e.designationId; delete e.level; return e; });
  };

  const handleSave = async () => {
    const errs = validate(form, allRecords, isNew ? null : id);
    if (Object.keys(errs).length > 0) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    const now = new Date().toISOString();
    const userName = user.name || user.fullName || "System";
    const changeEntry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };
    try {
      let saved;
      if (isNew) {
        const payload = { ...form, id: Date.now().toString(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [changeEntry] };
        saved = await api.post("/api/employees", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/employees/${id}`, payload);
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Employee saved successfully.");
      if (isNew) navigate(`/masters/employee/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/employee"); return; }
    try { const found = await api.get(`/api/employees/${id}`); setForm(found); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete employee "${form.firstName} ${form.lastName}"? This cannot be undone.`)) return;
    try { await api.del(`/api/employees/${id}`); navigate("/masters/employee"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const deptOptions = departments.map(d => ({ value: d.id, label: d.departmentName }));
  const desigOptions = designations.map(d => ({ value: d.id, label: d.designationName }));
  const managerOptions = allRecords.filter(e => e.status === "Active" && e.id !== id).map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName} (${e.employeeId})` }));

  const statusColors = {
    Active: "bg-green-50 text-green-700 border border-green-200",
    "On Leave": "bg-amber-50 text-amber-700 border border-amber-200",
    Resigned: "bg-gray-100 text-gray-500 border border-gray-200",
    Terminated: "bg-red-50 text-red-600 border border-red-200",
  };

  return (
    <Layout>
      <div className="space-y-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Masters</span><ChevronRight size={12} />
          <button onClick={() => navigate("/masters/employee")} className="hover:text-blue-500 transition-colors">Employee</button>
          {form.employeeId && <><ChevronRight size={12} /><span className="text-blue-600 font-medium">{form.employeeId}</span></>}
        </div>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <button onClick={() => navigate("/masters/employee")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"><ArrowLeft size={13} /> Back</button>
          {mode === "view" && <button onClick={() => setMode("edit")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium"><Edit2 size={13} /> Edit</button>}
          {(mode === "new" || mode === "edit") && (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"><Save size={13} /> Save</button>
              <button onClick={handleDiscard} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"><X size={13} /> Discard</button>
            </>
          )}
          {mode === "view" && !isNew && <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium"><Trash2 size={13} /> Delete</button>}
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button onClick={() => setShowChangelog(!showChangelog)} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 border rounded font-medium transition-colors ${showChangelog ? "border-blue-300 bg-blue-50 text-blue-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <FileText size={13} /> Changelog
          </button>
          {form.updatedAt && <div className="ml-auto text-xs text-gray-400 text-right"><span>Updated: {new Date(form.updatedAt).toLocaleString()}</span><span className="ml-2">by {form.updatedBy}</span></div>}
        </div>

        {showChangelog && (
          <div className="bg-white border border-gray-200 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FileText size={14} /> Audit Log — {form.employeeId || "New"}</h3>
            {!form.changelog?.length ? <p className="text-xs text-gray-400 py-4 text-center">No changes recorded yet.</p> : (
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200"><th className="text-left pb-2 text-gray-500 font-medium">Date & Time</th><th className="text-left pb-2 text-gray-500 font-medium">User</th><th className="text-left pb-2 text-gray-500 font-medium">Action</th><th className="text-left pb-2 text-gray-500 font-medium">Details</th></tr></thead>
                <tbody>{form.changelog.map((c, i) => (<tr key={i} className="border-b border-gray-50"><td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td><td className="py-1.5 text-gray-600">{c.user}</td><td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-xs ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>{c.action}</span></td><td className="py-1.5 text-gray-600">{c.changes}</td></tr>))}</tbody>
              </table>
            )}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.employeeId || "NEW EMPLOYEE"}</span>
            <span className="text-blue-200 text-sm">{[form.firstName, form.lastName].filter(Boolean).join(" ") || "—"}</span>
            {form.status && (
              <span className={`ml-auto text-xs px-2 py-0.5 rounded font-medium ${form.status === "Active" ? "bg-green-400/30 text-green-100 border border-green-300/30" : "bg-white/10 text-white/80 border border-white/20"}`}>
                {form.status}
              </span>
            )}
          </div>
          <div className="p-5 space-y-4">

            {/* Identity */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Identity</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Employee ID" required error={errors.employeeId}>
                  <TInput value={form.employeeId} onChange={e => setField("employeeId", e.target.value.toUpperCase())} disabled={isReadOnly || !isNew} placeholder="e.g. EMP-001" maxLength={20} error={errors.employeeId} />
                </Field>
                <Field label="First Name" required error={errors.firstName}>
                  <TInput value={form.firstName} onChange={e => setField("firstName", e.target.value)} disabled={isReadOnly} placeholder="Rajesh" error={errors.firstName} />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <TInput value={form.lastName} onChange={e => setField("lastName", e.target.value)} disabled={isReadOnly} placeholder="Patil" error={errors.lastName} />
                </Field>
                <Field label="Mobile No." required error={errors.mobile}>
                  <TInput value={form.mobile} onChange={e => setField("mobile", e.target.value.replace(/\D/g, ""))} disabled={isReadOnly} placeholder="10-digit number" maxLength={10} error={errors.mobile} />
                </Field>
                <Field label="Email ID" required error={errors.email} className="sm:col-span-1 lg:col-span-2">
                  <TInput type="email" value={form.email} onChange={e => setField("email", e.target.value)} disabled={isReadOnly} placeholder="name@company.com" error={errors.email} />
                </Field>
              </div>
            </div>

            {/* Organisation */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Organisation</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Department" required error={errors.departmentId}>
                  <TSelect value={form.departmentId} onChange={e => handleDeptChange(e.target.value)} disabled={isReadOnly} options={deptOptions} placeholder="Select Department" error={errors.departmentId} />
                </Field>
                <Field label="Designation" required error={errors.designationId}>
                  <TSelect value={form.designationId} onChange={e => handleDesigChange(e.target.value)} disabled={isReadOnly} options={desigOptions} placeholder="Select Designation" error={errors.designationId} />
                </Field>
                <Field label="Level" required error={errors.level}>
                  <TSelect value={form.level} onChange={e => setField("level", e.target.value)} disabled={isReadOnly} options={LEVEL_OPTIONS} placeholder="Select Level" error={errors.level} />
                  {!isReadOnly && <p className="text-[11px] text-gray-400 mt-0.5">Auto-filled from Designation — editable for exceptions.</p>}
                </Field>
                <Field label="Employee Type" required error={errors.employeeType}>
                  <TSelect value={form.employeeType} onChange={e => setField("employeeType", e.target.value)} disabled={isReadOnly} options={EMP_TYPE_OPTIONS} placeholder="Select Type" error={errors.employeeType} />
                </Field>
                <Field label="Status" required error={errors.status}>
                  <TSelect value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} options={STATUS_OPTIONS} placeholder="Select Status" error={errors.status} />
                </Field>
                <Field label="Date of Joining">
                  <TInput type="date" value={form.dateOfJoining} onChange={e => setField("dateOfJoining", e.target.value)} disabled={isReadOnly} />
                </Field>
                <Field label="Reporting Manager" className="sm:col-span-2 lg:col-span-3">
                  <TSelect value={form.reportingManagerId} onChange={e => { const found = allRecords.find(r => r.id === e.target.value); setField("reportingManagerId", e.target.value); setField("reportingManagerName", found ? `${found.firstName} ${found.lastName}` : ""); }} disabled={isReadOnly} options={managerOptions} placeholder="Select Reporting Manager (optional)" />
                  <p className="text-[11px] text-gray-400 mt-0.5">Shows Active employees only.</p>
                </Field>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDeactivated" checked={!!form.isDeactivated} onChange={e => setField("isDeactivated", e.target.checked)} disabled={isReadOnly} className="rounded border-gray-300 text-blue-600 focus:ring-blue-400" />
              <label htmlFor="isDeactivated" className="text-xs text-gray-600 select-none cursor-pointer">Deactivate (hides from transaction entry fields)</label>
            </div>
          </div>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields.</p>
              <ul className="text-xs text-red-600 space-y-0.5 list-disc list-inside">{Object.values(errors).map((e, i) => <li key={i}>{e}</li>)}</ul>
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
