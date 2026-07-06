import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Paperclip, Users, XCircle,
} from "lucide-react";

const inputCls = (disabled, error) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm transition-all focus:outline-none
  ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}
  ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white hover:border-gray-300"}`;

function Row({ label, required, error, children, help }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-6">
      <label className={`sm:w-52 sm:pt-2.5 text-sm shrink-0 ${required ? "text-gray-800 font-semibold" : "text-gray-600 font-medium"}`}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="flex-1 max-w-lg">
        {children}
        {help && !error && <p className="text-xs text-gray-400 mt-1.5">{help}</p>}
        {error && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle size={11} className="shrink-0" />{error}</p>}
      </div>
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h2>
        {action}
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

const RESOURCE_TYPES = ["Human", "Machine", "Asset"];
const STATUSES = ["Active", "Inactive", "Completed"];
const WO_ACTIVE_STATUSES = ["Open", "In Progress"];

const STATUS_PILL = {
  Active:    "bg-green-50 text-green-700",
  Inactive:  "bg-gray-100 text-gray-600",
  Completed: "bg-blue-50 text-blue-700",
};

const emptyForm = () => ({
  resourceId: "",
  workOrderId: "", workOrderNo: "",
  supervisorId: "", supervisorName: "",
  resourceType: "",
  labourId: "", labourName: "",
  assetId: "", assetName: "",
  plannedHours: "", actualHours: "",
  status: "Active",
  remark: "",
  attachmentFileNames: [],
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

export default function ResourceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const attachRef = useRef(null);

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assets, setAssets] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    Promise.all([
      api.get("/api/resources").catch(() => []),
      api.get("/api/work-orders").catch(() => []),
      api.get("/api/employees").catch(() => []),
      api.get("/api/assets").catch(() => []),
    ]).then(([resources, wos, emps, asts]) => {
      setAllRecords(resources);
      setWorkOrders(wos.filter(w => WO_ACTIVE_STATUSES.includes(w.status)));
      setEmployees(emps.filter(e => !e.isDeactivated && (e.status || "Active") === "Active"));
      setAssets(asts.filter(a => (a.status || "Active") !== "Decommissioned"));
      if (!isNew && id) {
        const found = resources.find(r => r.id === id);
        if (found) setForm({ ...emptyForm(), ...found });
        else navigate("/asset-management/resources");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const handleWorkOrderChange = (woId) => {
    const wo = workOrders.find(w => w.id === woId);
    setForm(prev => ({ ...prev, workOrderId: woId, workOrderNo: wo?.workOrderId || "" }));
    if (errors.workOrderId) setErrors(p => { const e = { ...p }; delete e.workOrderId; return e; });
  };

  const employeeDisplayName = (e) => `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.employeeId;

  const handleSupervisorChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, supervisorId: eid, supervisorName: e ? employeeDisplayName(e) : "" }));
    if (errors.supervisorId) setErrors(p => { const c = { ...p }; delete c.supervisorId; return c; });
  };

  const handleLabourChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, labourId: eid, labourName: e ? employeeDisplayName(e) : "" }));
    if (errors.labourId) setErrors(p => { const c = { ...p }; delete c.labourId; return c; });
  };

  const handleAssetChange = (aid) => {
    const a = assets.find(x => x.id === aid);
    setForm(prev => ({ ...prev, assetId: aid, assetName: a?.name || "" }));
    if (errors.assetId) setErrors(p => { const c = { ...p }; delete c.assetId; return c; });
  };

  const handleResourceTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      resourceType: type,
      ...(type !== "Human" ? { labourId: "", labourName: "" } : {}),
      ...(type !== "Machine" && type !== "Asset" ? { assetId: "", assetName: "" } : {}),
    }));
    if (errors.resourceType) setErrors(p => { const c = { ...p }; delete c.resourceType; return c; });
  };

  const nextResourceId = () => {
    const nums = allRecords.map(r => parseInt((r.resourceId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "RES-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(5, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.workOrderId) e.workOrderId = "Work Order is required.";
    if (!f.supervisorId) e.supervisorId = "Supervisor Name is required.";
    if (!f.resourceType) e.resourceType = "Resource Type is required.";
    if (f.resourceType === "Human" && !f.labourId) e.labourId = "Labour Name is required when Resource Type is Human.";
    if ((f.resourceType === "Machine" || f.resourceType === "Asset") && !f.assetId) e.assetId = "Asset Name is required when Resource Type is Machine or Asset.";
    if (f.plannedHours !== "" && (isNaN(Number(f.plannedHours)) || Number(f.plannedHours) < 0)) e.plannedHours = "Planned Hours must be a non-negative number.";
    if (f.actualHours !== "" && (isNaN(Number(f.actualHours)) || Number(f.actualHours) < 0)) e.actualHours = "Actual Hours must be a non-negative number.";
    if (!f.status) e.status = "Status is required.";
    return e;
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };
    try {
      let saved;
      if (isNew) {
        const payload = { ...form, id: Date.now().toString(), resourceId: nextResourceId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
        saved = await api.post("/api/resources", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), entry] };
        saved = await api.put(`/api/resources/${id}`, payload);
      }
      setForm({ ...emptyForm(), ...saved });
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Resource allocation saved.");
      if (isNew) navigate(`/asset-management/resources/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/resources"); return; }
    try { const found = await api.get(`/api/resources/${id}`); setForm({ ...emptyForm(), ...found }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete resource allocation "${form.resourceId}"? This cannot be undone.`)) return;
    try { await api.del(`/api/resources/${id}`); navigate("/asset-management/resources"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="w-full space-y-4">

        <button onClick={() => navigate("/asset-management/resources")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Resources
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white shrink-0">
              <Users size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Resource Allocation" : (form.workOrderNo ? `${form.resourceId} — ${form.workOrderNo}` : form.resourceId || "Resource")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.resourceType && <span>{form.resourceType}</span>}
                {!isNew && form.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[form.status] || "bg-white/20 text-white"}`}>
                    {form.status}
                  </span>
                )}
                {isNew && "Allocate a resource to a Work Order"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}>
                  <FileText size={13} /> History
                </button>
              )}
              {mode === "view" && (
                <button onClick={() => setMode("edit")} className={headerBtn}>
                  <Edit2 size={13} /> Edit
                </button>
              )}
              {mode === "view" && !isNew && (
                <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-red-500/80 transition-colors">
                  <Trash2 size={13} /> Delete
                </button>
              )}
            </div>
          </div>

          {showChangelog && !isNew && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">History</h3>
              {!form.changelog?.length ? <p className="text-xs text-gray-400">No changes recorded yet.</p> : (
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 text-left"><th className="pb-1.5 font-medium">Date &amp; Time</th><th className="pb-1.5 font-medium">User</th><th className="pb-1.5 font-medium">Action</th></tr></thead>
                  <tbody>{form.changelog.map((c, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td>
                      <td className="py-1.5 text-gray-600">{c.user}</td>
                      <td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[11px] ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-brand-50 text-brand-600"}`}>{c.action}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Section: Allocation Details */}
        <SectionCard title="Allocation Details">
          <Row label="Resource ID" help="Auto-generated on first save.">
            <input value={form.resourceId || "Auto (RES-XXXXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Work Order No." required error={errors.workOrderId} help="Only Work Orders that are Open or In Progress can be selected.">
            <select value={form.workOrderId} onChange={e => handleWorkOrderChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.workOrderId)}>
              <option value="">Select Work Order</option>
              {workOrders.map(w => <option key={w.id} value={w.id}>{w.workOrderId} — {w.productName || w.workOrderType}</option>)}
            </select>
          </Row>
          <Row label="Supervisor Name" required error={errors.supervisorId}>
            <select value={form.supervisorId} onChange={e => handleSupervisorChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.supervisorId)}>
              <option value="">Select supervisor</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
          <Row label="Resource Type" required error={errors.resourceType} help="Determines whether Labour Name or Asset Name is required below.">
            <select value={form.resourceType} onChange={e => handleResourceTypeChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.resourceType)}>
              <option value="">Select resource type</option>
              {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Row>
          {form.resourceType === "Human" && (
            <Row label="Labour Name" required error={errors.labourId} help="Employee performing this work.">
              <select value={form.labourId} onChange={e => handleLabourChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.labourId)}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
              </select>
            </Row>
          )}
          {(form.resourceType === "Machine" || form.resourceType === "Asset") && (
            <Row label="Asset Name" required error={errors.assetId} help="Machine or asset allocated to this Work Order.">
              <select value={form.assetId} onChange={e => handleAssetChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assetId)}>
                <option value="">Select asset</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.assetId} — {a.name}</option>)}
              </select>
            </Row>
          )}
        </SectionCard>

        {/* Section: Hours */}
        <SectionCard title="Hours">
          <Row label="Planned Hours" error={errors.plannedHours} help="Planned number of hours this resource is scheduled for this Work Order.">
            <input type="number" min="0" step="any" value={form.plannedHours} onChange={e => setField("plannedHours", e.target.value)} disabled={isReadOnly} placeholder="e.g. 8" className={inputCls(isReadOnly, errors.plannedHours)} />
          </Row>
          <Row label="Actual Hours" error={errors.actualHours} help="Actual hours consumed by this resource on this Work Order.">
            <input type="number" min="0" step="any" value={form.actualHours} onChange={e => setField("actualHours", e.target.value)} disabled={isReadOnly} placeholder="e.g. 7.5" className={inputCls(isReadOnly, errors.actualHours)} />
          </Row>
        </SectionCard>

        {/* Section: Status & Remarks */}
        <SectionCard title="Status &amp; Remarks">
          <Row label="Status" required error={errors.status}>
            <select value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.status)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
          <Row label="Remark">
            <textarea
              value={form.remark ?? ""}
              onChange={e => setField("remark", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="Additional notes about this resource allocation…"
              className={inputCls(isReadOnly, false) + " resize-none"}
            />
          </Row>
        </SectionCard>

        {/* Section: Attachments */}
        <SectionCard title="Attachments">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-sm text-gray-500">
              {form.attachmentFileNames?.length
                ? `${form.attachmentFileNames.length} file(s) attached`
                : "No attachments yet."}
            </div>
            {editing && (
              <label className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition-colors">
                <Paperclip size={14} /> Add Files
                <input
                  ref={attachRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
                  onChange={e => {
                    const names = Array.from(e.target.files).map(f => f.name);
                    setField("attachmentFileNames", [...(form.attachmentFileNames || []), ...names]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
          {form.attachmentFileNames?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {form.attachmentFileNames.map((name, i) => (
                <li key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <span className="flex items-center gap-2"><Paperclip size={13} className="text-gray-400" />{name}</span>
                  {editing && (
                    <button onClick={() => setField("attachmentFileNames", form.attachmentFileNames.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 transition-colors">
                      <XCircle size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-gray-400 mt-2">PDF, JPG, PNG, DOCX — max 10 MB each</p>
        </SectionCard>

        {/* Footer actions */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3 flex-wrap">
            <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all">
              <Save size={15} /> Save
            </button>
            <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors ml-auto">
              Discard
            </button>
          </div>
        )}

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields.</p>
              <ul className="text-xs text-red-600 space-y-0.5">{Object.values(errors).map((e, i) => <li key={i}>• {e}</li>)}</ul>
            </div>
          </div>
        )}

        {!isNew && form.createdAt && (
          <p className="text-xs text-gray-400 px-1">
            Created {new Date(form.createdAt).toLocaleString()} by {form.createdBy} · Updated {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}
          </p>
        )}
      </div>
    </Layout>
  );
}
