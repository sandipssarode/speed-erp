import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, X, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronRight, ArrowLeft, KeyRound, Paperclip, User } from "lucide-react";

const LEVEL_OPTIONS = [
  { value: "L1",  label: "L1 — Top Management (Director / CEO / MD / CXO)" },
  { value: "L2",  label: "L2 — Senior Management (VP / General Manager / AGM)" },
  { value: "L3",  label: "L3 — Middle Management (Manager / Deputy Manager / AM)" },
  { value: "L4",  label: "L4 — Executive (Sr. Executive / Engineer / Officer)" },
  { value: "L5",  label: "L5 — Staff / Operator (Technician / Associate / Helper)" },
  { value: "L6",  label: "L6" },
  { value: "L7",  label: "L7" },
  { value: "L8",  label: "L8" },
  { value: "L9",  label: "L9" },
  { value: "L10", label: "L10" },
  { value: "L11", label: "L11" },
  { value: "L12", label: "L12" },
  { value: "L13", label: "L13" },
  { value: "L14", label: "L14" },
  { value: "L15", label: "L15" },
];

const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
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

function nextEmpId(records) {
  const nums = records.map(r => { const m = (r.employeeId || "").match(/(\d+)$/); return m ? parseInt(m[1], 10) : 0; });
  return `EMP-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}

const emptyForm = () => ({
  employeeId: "",
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  bloodGroup: "",
  mobile: "",
  email: "",
  countryId: "",
  countryName: "",
  stateId: "",
  stateName: "",
  districtId: "",
  districtName: "",
  talukaId: "",
  talukaName: "",
  village: "",
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
  photoFileName: "",
  attachmentFileNames: [],
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.firstName?.trim()) e.firstName = "First Name is required.";
  if (!form.lastName?.trim()) e.lastName = "Last Name is required.";
  if (!form.mobile?.trim()) e.mobile = "Mobile No. is required.";
  else if (!/^\d{10}$/.test(form.mobile.trim())) e.mobile = "Mobile No. must be exactly 10 digits.";
  if (!form.email?.trim()) e.email = "Email ID is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email format.";
  else if (allRecords.some(r => r.email?.trim().toLowerCase() === form.email.trim().toLowerCase() && r.id !== editingId))
    e.email = "Email ID already exists.";
  if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) e.dateOfBirth = "Date of Birth cannot be a future date.";
  if (form.dateOfJoining && new Date(form.dateOfJoining) > new Date()) e.dateOfJoining = "Date of Joining cannot be a future date.";
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
  const photoRef = useRef();
  const attachRef = useRef();

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [allStates, setAllStates] = useState([]);
  const [allDistricts, setAllDistricts] = useState([]);
  const [allVillageTalukas, setAllVillageTalukas] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    Promise.all([
      api.get("/api/employees"),
      api.get("/api/departments").catch(() => []),
      api.get("/api/designations").catch(() => []),
      api.get("/api/countries").catch(() => []),
      api.get("/api/states").catch(() => []),
      api.get("/api/districts").catch(() => []),
      api.get("/api/village-talukas").catch(() => []),
    ]).then(([employees, depts, desigs, ctries, states, districts, villages]) => {
      setAllRecords(employees);
      setDepartments(depts);
      setDesignations(desigs);
      setCountries(ctries.filter(c => !c.isDeactivated));
      setAllStates(states.filter(s => !s.isDeactivated));
      setAllDistricts(districts.filter(d => !d.isDeactivated));
      setAllVillageTalukas(villages.filter(v => !v.isDeactivated));
      if (isNew) {
        setForm(prev => ({ ...prev, employeeId: nextEmpId(employees) }));
      } else if (id) {
        const found = employees.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/employee");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => { setForm(prev => ({ ...prev, [key]: value })); if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; }); };

  const handleCountryChange = (val) => {
    const found = countries.find(c => c.id === val);
    setForm(prev => ({ ...prev, countryId: val, countryName: found?.countryName || "", stateId: "", stateName: "", districtId: "", districtName: "", talukaId: "", talukaName: "", village: "" }));
  };
  const handleStateChange = (val) => {
    const found = filteredStates.find(s => s.id === val);
    setForm(prev => ({ ...prev, stateId: val, stateName: found?.stateName || "", districtId: "", districtName: "", talukaId: "", talukaName: "", village: "" }));
  };
  const handleDistrictChange = (val) => {
    const found = filteredDistricts.find(d => d.id === val);
    setForm(prev => ({ ...prev, districtId: val, districtName: found?.districtName || "", talukaId: "", talukaName: "", village: "" }));
  };
  const handleTalukaChange = (val) => {
    const found = filteredTalukas.find(t => t.id === val);
    setForm(prev => ({ ...prev, talukaId: val, talukaName: found?.villageName || "" }));
  };

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

  const handleResetPassword = () => {
    showToast("Reset Password: feature will send a new password to the employee's registered email. (Backend integration pending)", "error");
  };

  // Cascading filter options
  const filteredStates = form.countryId ? allStates.filter(s => s.countryId === form.countryId) : allStates;
  const filteredDistricts = form.stateName ? allDistricts.filter(d => d.state === form.stateName) : allDistricts;
  const filteredTalukas = form.districtId ? allVillageTalukas.filter(v => v.districtId === form.districtId) : allVillageTalukas;

  const deptOptions = departments.map(d => ({ value: d.id, label: d.departmentName }));
  const desigOptions = designations.map(d => ({ value: d.id, label: d.designationName }));
  const managerOptions = allRecords.filter(e => e.status === "Active" && e.id !== id).map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName} (${e.employeeId})` }));
  const countryOptions = countries.map(c => ({ value: c.id, label: c.countryName }));
  const stateOptions = filteredStates.map(s => ({ value: s.id, label: s.stateName }));
  const districtOptions = filteredDistricts.map(d => ({ value: d.id, label: d.districtName }));
  const talukaOptions = filteredTalukas.map(t => ({ value: t.id, label: t.villageName }));

  const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");

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
          {mode === "view" && !isNew && (
            <>
              <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium"><Trash2 size={13} /> Delete</button>
              <button onClick={handleResetPassword} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-purple-300 text-purple-600 hover:bg-purple-50 rounded font-medium"><KeyRound size={13} /> Reset Password</button>
            </>
          )}
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
            <span className="text-blue-200 text-sm">{fullName || "—"}</span>
            {form.designationName && <span className="text-blue-300 text-xs">{form.designationName}</span>}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Employee ID">
                  <TInput value={form.employeeId} disabled={true} placeholder="Auto-generated" />
                </Field>
                <Field label="First Name" required error={errors.firstName}>
                  <TInput value={form.firstName} onChange={e => setField("firstName", e.target.value)} disabled={isReadOnly} placeholder="Rajesh" error={errors.firstName} />
                </Field>
                <Field label="Middle Name">
                  <TInput value={form.middleName} onChange={e => setField("middleName", e.target.value)} disabled={isReadOnly} placeholder="Suresh" />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <TInput value={form.lastName} onChange={e => setField("lastName", e.target.value)} disabled={isReadOnly} placeholder="Patil" error={errors.lastName} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Field label="Date of Birth" error={errors.dateOfBirth}>
                  <TInput type="date" value={form.dateOfBirth} onChange={e => setField("dateOfBirth", e.target.value)} disabled={isReadOnly} error={errors.dateOfBirth} />
                </Field>
                <Field label="Blood Group">
                  <TSelect value={form.bloodGroup} onChange={e => setField("bloodGroup", e.target.value)} disabled={isReadOnly} options={BLOOD_GROUP_OPTIONS} placeholder="Select Blood Group" />
                </Field>
                <Field label="Mobile No." required error={errors.mobile}>
                  <TInput value={form.mobile} onChange={e => setField("mobile", e.target.value.replace(/\D/g, ""))} disabled={isReadOnly} placeholder="10-digit number" maxLength={10} error={errors.mobile} />
                </Field>
                <Field label="Email ID" required error={errors.email}>
                  <TInput type="email" value={form.email} onChange={e => setField("email", e.target.value)} disabled={isReadOnly} placeholder="name@company.com" error={errors.email} />
                </Field>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Residential Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Country">
                  <TSelect value={form.countryId} onChange={e => handleCountryChange(e.target.value)} disabled={isReadOnly} options={countryOptions} placeholder="Select Country" />
                </Field>
                <Field label="State">
                  <TSelect value={form.stateId} onChange={e => handleStateChange(e.target.value)} disabled={isReadOnly || !form.countryId} options={stateOptions} placeholder={form.countryId ? "Select State" : "Select Country first"} />
                </Field>
                <Field label="District">
                  <TSelect value={form.districtId} onChange={e => handleDistrictChange(e.target.value)} disabled={isReadOnly || !form.stateId} options={districtOptions} placeholder={form.stateId ? "Select District" : "Select State first"} />
                </Field>
                <Field label="Taluka">
                  <TSelect value={form.talukaId} onChange={e => handleTalukaChange(e.target.value)} disabled={isReadOnly || !form.districtId} options={talukaOptions} placeholder={form.districtId ? "Select Taluka" : "Select District first"} />
                </Field>
                <Field label="Village">
                  <TInput value={form.village} onChange={e => setField("village", e.target.value)} disabled={isReadOnly} placeholder="Village / Locality" />
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
                <Field label="Date of Joining" error={errors.dateOfJoining}>
                  <TInput type="date" value={form.dateOfJoining} onChange={e => setField("dateOfJoining", e.target.value)} disabled={isReadOnly} error={errors.dateOfJoining} />
                </Field>
                <Field label="Reporting Manager (Report To)" className="sm:col-span-2 lg:col-span-3">
                  <TSelect value={form.reportingManagerId} onChange={e => { const found = allRecords.find(r => r.id === e.target.value); setField("reportingManagerId", e.target.value); setField("reportingManagerName", found ? `${found.firstName} ${found.lastName}` : ""); }} disabled={isReadOnly} options={managerOptions} placeholder="Select Reporting Manager (optional)" />
                  <p className="text-[11px] text-gray-400 mt-0.5">Shows Active employees only.</p>
                </Field>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Documents & Photo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo upload */}
                <Field label="Upload Photo">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {form.photoFileName
                        ? <span className="text-xs text-gray-500 text-center px-1 leading-tight">{form.photoFileName}</span>
                        : <User size={22} className="text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={photoRef}
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        disabled={isReadOnly}
                        onChange={e => { if (e.target.files[0]) setField("photoFileName", e.target.files[0].name); }}
                        className="hidden"
                      />
                      {!isReadOnly ? (
                        <button type="button" onClick={() => photoRef.current?.click()} className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 font-medium">
                          Choose Photo
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">{form.photoFileName || "No photo uploaded"}</span>
                      )}
                      <p className="text-[11px] text-gray-400 mt-1">JPG, JPEG, PNG — max 2 MB</p>
                    </div>
                  </div>
                </Field>

                {/* Attachments */}
                <Field label="Attachments">
                  <div>
                    <input
                      ref={attachRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      multiple
                      disabled={isReadOnly}
                      onChange={e => {
                        const names = Array.from(e.target.files).map(f => f.name);
                        setField("attachmentFileNames", [...(form.attachmentFileNames || []), ...names]);
                      }}
                      className="hidden"
                    />
                    {!isReadOnly && (
                      <button type="button" onClick={() => attachRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 font-medium">
                        <Paperclip size={12} /> Add Files
                      </button>
                    )}
                    {form.attachmentFileNames?.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {form.attachmentFileNames.map((name, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Paperclip size={11} className="text-gray-400 shrink-0" />{name}
                            {!isReadOnly && <button type="button" onClick={() => setField("attachmentFileNames", form.attachmentFileNames.filter((_, j) => j !== i))} className="ml-auto text-red-400 hover:text-red-600"><X size={11} /></button>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1.5">No attachments uploaded.</p>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1">PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG — max 10 MB each</p>
                  </div>
                </Field>
              </div>
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
