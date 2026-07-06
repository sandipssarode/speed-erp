import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Paperclip, ClipboardList, XCircle, ThumbsUp, ThumbsDown, Briefcase, ClipboardPlus,
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

const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["New", "Under Review", "Approved", "Rejected", "Converted", "Cancelled"];
const CAUSE_OPTIONS = ["Wear and Tear", "Electrical Fault", "Mechanical Failure", "Operator Error", "Lack of Maintenance", "Manufacturing Defect", "Environmental", "Other"];
const ASSET_ELIGIBLE = (a) => ["Active", "Under Maintenance"].includes(a.status || "Active");

const PRIORITY_PILL = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-amber-100 text-amber-700",
  Low:      "bg-green-100 text-green-700",
};

const STATUS_PILL = {
  New:            "bg-gray-100 text-gray-600",
  "Under Review": "bg-blue-50 text-blue-700",
  Approved:       "bg-green-50 text-green-700",
  Rejected:       "bg-red-50 text-red-600",
  Converted:      "bg-brand-50 text-brand-600",
  Cancelled:      "bg-gray-100 text-gray-500",
};

const todayStr = () => new Date().toISOString().slice(0, 10);
const nowLocal = () => new Date().toISOString().slice(0, 16);

const emptyForm = () => ({
  requestId: "", requestDate: todayStr(),
  assetId: "", assetName: "", assetLocation: "",
  priority: "", problemDescription: "", causes: [],
  requestedById: "", requestedByName: "",
  assignedToId: "", assignedToName: "",
  estimatedDowntimeHours: "",
  remarks: "",
  attachmentFileNames: [],
  status: "New",
  rejectionReason: "", rejectedBy: "", rejectedAt: "",
  approvedBy: "", approvedAt: "",
  linkedJobId: "", linkedJobNo: "",
  linkedWorkOrderId: "", linkedWorkOrderNo: "",
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

export default function MaintenanceRequestForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const attachRef = useRef(null);

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReasonDraft, setRejectReasonDraft] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [allRecords, setAllRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";
  const st = form.status;

  useEffect(() => {
    Promise.all([
      api.get("/api/maintenance-requests").catch(() => []),
      api.get("/api/assets").catch(() => []),
      api.get("/api/employees").catch(() => []),
    ]).then(([reqs, asts, emps]) => {
      setAllRecords(reqs);
      setAssets(asts.filter(ASSET_ELIGIBLE));
      setEmployees(emps.filter(e => !e.isDeactivated && (e.status || "Active") === "Active"));
      if (!isNew && id) {
        const found = reqs.find(r => r.id === id);
        if (found) setForm({ ...emptyForm(), ...found });
        else navigate("/asset-management/maintenance-request");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const handleAssetChange = (aid) => {
    const a = assets.find(x => x.id === aid);
    setForm(prev => ({ ...prev, assetId: aid, assetName: a?.name || "", assetLocation: a?.locationName || "" }));
    if (errors.assetId) setErrors(p => { const e = { ...p }; delete e.assetId; return e; });
  };

  const employeeDisplayName = (e) => `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.employeeId;

  const handleRequestedByChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, requestedById: eid, requestedByName: e ? employeeDisplayName(e) : "" }));
    if (errors.requestedById) setErrors(p => { const c = { ...p }; delete c.requestedById; return c; });
  };

  const handleAssignedToChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    setForm(prev => ({ ...prev, assignedToId: eid, assignedToName: e ? employeeDisplayName(e) : "" }));
    if (errors.assignedToId) setErrors(p => { const c = { ...p }; delete c.assignedToId; return c; });
  };

  const toggleCause = (cause) => {
    setForm(prev => ({
      ...prev,
      causes: prev.causes.includes(cause) ? prev.causes.filter(c => c !== cause) : [...prev.causes, cause],
    }));
  };

  const nextRequestId = () => {
    const nums = allRecords.map(r => parseInt((r.requestId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "MR-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(5, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.requestDate) e.requestDate = "Request Date is required.";
    else if (f.requestDate > todayStr()) e.requestDate = "Request Date cannot be in the future.";
    if (!f.assetId) e.assetId = "Asset is required.";
    if (!f.priority) e.priority = "Priority is required.";
    if (!f.problemDescription.trim()) e.problemDescription = "Problem Description is required.";
    else if (f.problemDescription.length > 500) e.problemDescription = "Problem Description must be max 500 characters.";
    if (!f.requestedById) e.requestedById = "Requested By is required.";
    if (f.estimatedDowntimeHours !== "" && Number(f.estimatedDowntimeHours) < 0) e.estimatedDowntimeHours = "Estimated Downtime must be zero or a positive number.";
    if (f.status === "Rejected" && !f.rejectionReason?.trim()) e.rejectionReason = "Rejection Reason is required.";
    return e;
  };

  const persist = async (nextForm, changeNote) => {
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: changeNote || (isNew ? "Record created" : "Record updated") };
    let saved;
    if (isNew) {
      const payload = { ...nextForm, id: Date.now().toString(), requestId: nextForm.requestId || nextRequestId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
      saved = await api.post("/api/maintenance-requests", payload);
    } else {
      const payload = { ...nextForm, updatedAt: now, updatedBy: userName, changelog: [...(nextForm.changelog || []), entry] };
      saved = await api.put(`/api/maintenance-requests/${id}`, payload);
    }
    setForm({ ...emptyForm(), ...saved });
    setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
    return saved;
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    try {
      const saved = await persist(form);
      setMode("view"); setErrors({});
      showToast(isNew ? "Maintenance Request submitted." : "Maintenance Request saved.");
      if (isNew) navigate(`/asset-management/maintenance-request/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/maintenance-request"); return; }
    try { const found = await api.get(`/api/maintenance-requests/${id}`); setForm({ ...emptyForm(), ...found }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (form.status === "Converted") { showToast("This request cannot be deleted as it has been converted to a Job List or Work Order.", "error"); return; }
    if (!window.confirm(`Delete maintenance request "${form.requestId}"? This cannot be undone.`)) return;
    try { await api.del(`/api/maintenance-requests/${id}`); navigate("/asset-management/maintenance-request"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const handleApprove = async () => {
    if (!form.assignedToId) { setErrors(p => ({ ...p, assignedToId: "Assigned To is required to approve this request." })); showToast("Assigned To is required to approve.", "error"); return; }
    const now = new Date().toISOString();
    try {
      await persist({ ...form, status: "Approved", approvedBy: userName, approvedAt: now }, `Approved by ${userName}`);
      showToast("Request approved.");
    } catch (err) { showToast(err.message || "Failed to approve.", "error"); }
  };

  const confirmReject = async () => {
    if (!rejectReasonDraft.trim()) { setRejectError("Rejection Reason is required."); return; }
    const now = new Date().toISOString();
    try {
      await persist({ ...form, status: "Rejected", rejectionReason: rejectReasonDraft, rejectedBy: userName, rejectedAt: now }, `Rejected by ${userName}: ${rejectReasonDraft}`);
      setRejectOpen(false);
      showToast("Request rejected.");
    } catch (err) { showToast(err.message || "Failed to reject.", "error"); }
  };

  const nextId = (records, field, prefix, pad) => {
    const nums = records.map(r => parseInt((r[field] || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(pad, "0");
  };

  const handleConvertToJob = async () => {
    if (!window.confirm("Create a Job List entry from this request?")) return;
    try {
      const jobs = await api.get("/api/job-list").catch(() => []);
      const now = new Date().toISOString();
      const jobPayload = {
        id: Date.now().toString(),
        jobId: nextId(jobs, "jobId", "JOB-", 6),
        jobDate: todayStr(),
        assetId: form.assetId, assetName: form.assetName, assetLocation: form.assetLocation,
        bom: "", maintenanceTypeId: "", maintenanceTypeName: "",
        priority: form.priority,
        estimatedDuration: form.estimatedDowntimeHours || "",
        problemDescription: form.problemDescription,
        assignedToId: form.assignedToId, assignedToName: form.assignedToName,
        startTime: nowLocal(), endTime: "",
        status: "Open", actualDuration: "", workDoneRemarks: "", consumedHoursUpdate: "",
        attachments: [],
        sourceRequestId: form.requestId,
        createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName,
        changelog: [{ timestamp: now, user: userName, action: "Created", changes: `Converted from Maintenance Request ${form.requestId}` }],
      };
      const savedJob = await api.post("/api/job-list", jobPayload);
      await persist({ ...form, status: "Converted", linkedJobId: savedJob.id, linkedJobNo: savedJob.jobId }, `Converted to Job ${savedJob.jobId}`);
      showToast(`Converted to Job ${savedJob.jobId}.`);
    } catch (err) { showToast(err.message || "Failed to convert to Job.", "error"); }
  };

  const handleConvertToWorkOrder = async () => {
    if (!window.confirm("Create a Work Order from this request? You'll need to complete production planning details (product, quantity) on the new Work Order.")) return;
    try {
      const wos = await api.get("/api/work-orders").catch(() => []);
      const now = new Date().toISOString();
      const woPayload = {
        id: Date.now().toString(),
        workOrderId: nextId(wos, "workOrderId", "WO-", 3),
        jobId: "", assetName: form.assetName,
        workOrderDate: todayStr(),
        workOrderType: "", productId: "", productName: "", productCode: "", unit: "",
        bom: "", quantityToProduce: "", floorName: "",
        assignedToId: form.assignedToId, assignedToName: form.assignedToName,
        priority: form.priority, startTime: nowLocal(), endTime: "",
        status: "Draft",
        remarks: `Converted from Maintenance Request ${form.requestId}: ${form.problemDescription}`,
        materials: [], attachmentFileNames: [],
        sourceRequestId: form.requestId,
        createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName,
        changelog: [{ timestamp: now, user: userName, action: "Created", changes: `Converted from Maintenance Request ${form.requestId}` }],
      };
      const savedWo = await api.post("/api/work-orders", woPayload);
      await persist({ ...form, status: "Converted", linkedWorkOrderId: savedWo.id, linkedWorkOrderNo: savedWo.workOrderId }, `Converted to Work Order ${savedWo.workOrderId}`);
      showToast(`Converted to Work Order ${savedWo.workOrderId}. Complete production planning details there.`);
    } catch (err) { showToast(err.message || "Failed to convert to Work Order.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";
  const canApproveReject = st === "New" || st === "Under Review";

  return (
    <Layout>
      <div className="w-full space-y-4">

        <button onClick={() => navigate("/asset-management/maintenance-request")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Maintenance Request
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
          </div>
        )}

        {!isNew && form.status === "Converted" && (form.linkedJobNo || form.linkedWorkOrderNo) && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border bg-brand-50 border-brand-200 text-brand-700">
            <CheckCircle size={15} className="shrink-0" />
            Converted to {form.linkedJobNo ? `Job ${form.linkedJobNo}` : `Work Order ${form.linkedWorkOrderNo}`}.
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white shrink-0">
              <ClipboardList size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Maintenance Request" : (form.assetName ? `${form.requestId} — ${form.assetName}` : form.requestId || "Maintenance Request")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.priority && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_PILL[form.priority] || "bg-white/20 text-white"}`}>{form.priority}</span>
                )}
                {!isNew && form.status && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_PILL[form.status] || "bg-white/20 text-white"}`}>{form.status}</span>
                )}
                {isNew && "Report an asset fault, breakdown or maintenance need"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}><FileText size={13} /> History</button>
              )}
              {mode === "view" && st !== "Converted" && (
                <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>
              )}
              {mode === "view" && canApproveReject && (
                <button onClick={handleApprove} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white bg-green-600/80 hover:bg-green-600 transition-colors">
                  <ThumbsUp size={13} /> Approve
                </button>
              )}
              {mode === "view" && canApproveReject && (
                <button onClick={() => { setRejectReasonDraft(""); setRejectError(""); setRejectOpen(true); }} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-red-500/80 transition-colors">
                  <ThumbsDown size={13} /> Reject
                </button>
              )}
              {mode === "view" && st === "Approved" && (
                <button onClick={handleConvertToJob} className={headerBtn}><Briefcase size={13} /> Convert to Job</button>
              )}
              {mode === "view" && st === "Approved" && (
                <button onClick={handleConvertToWorkOrder} className={headerBtn}><ClipboardPlus size={13} /> Convert to Work Order</button>
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
                  <thead><tr className="text-gray-400 text-left"><th className="pb-1.5 font-medium">Date &amp; Time</th><th className="pb-1.5 font-medium">User</th><th className="pb-1.5 font-medium">Changes</th></tr></thead>
                  <tbody>{form.changelog.map((c, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td>
                      <td className="py-1.5 text-gray-600">{c.user}</td>
                      <td className="py-1.5 text-gray-600">{c.changes}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Reject popup */}
        {rejectOpen && (
          <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
              <ThumbsDown size={15} /> Reject Request
            </div>
            <Row label="Rejection Reason" required>
              <textarea value={rejectReasonDraft} onChange={e => setRejectReasonDraft(e.target.value)} rows={3} className={inputCls(false, false) + " resize-none"} placeholder="Explain why this request is not approved…" />
            </Row>
            {rejectError && <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={11} />{rejectError}</p>}
            <div className="flex items-center gap-2.5">
              <button onClick={confirmReject} className="text-sm px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">Confirm Reject</button>
              <button onClick={() => setRejectOpen(false)} className="text-sm px-5 py-2 border border-red-300 text-red-700 hover:bg-red-100 rounded-xl font-semibold transition-colors">Cancel</button>
            </div>
          </div>
        )}

        {/* Section: Request Details */}
        <SectionCard title="Request Details">
          <Row label="Request ID" help="Auto-generated on first save.">
            <input value={form.requestId || "Auto (MR-XXXXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Request Date" required error={errors.requestDate}>
            <input type="date" value={form.requestDate} max={todayStr()} onChange={e => setField("requestDate", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.requestDate)} />
          </Row>
          <Row label="Asset" required error={errors.assetId}>
            <select value={form.assetId} onChange={e => handleAssetChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assetId)}>
              <option value="">Select asset</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.assetId} — {a.name}</option>)}
            </select>
          </Row>
          {form.assetName && (
            <Row label="Asset Name"><input value={form.assetName} disabled className={inputCls(true, false)} /></Row>
          )}
          {form.assetLocation && (
            <Row label="Location"><input value={form.assetLocation} disabled className={inputCls(true, false)} /></Row>
          )}
          <Row label="Priority" required error={errors.priority}>
            <select value={form.priority} onChange={e => setField("priority", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.priority)}>
              <option value="">Select priority</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Row>
          <Row label="Problem Description" required error={errors.problemDescription} help={`${form.problemDescription.length}/500 characters`}>
            <textarea value={form.problemDescription} onChange={e => setField("problemDescription", e.target.value)} disabled={isReadOnly} rows={3} maxLength={500} placeholder="Describe the fault, breakdown or maintenance need…" className={inputCls(isReadOnly, errors.problemDescription) + " resize-none"} />
          </Row>
          <Row label="Causes" help="Optional — select one or more root-cause categories.">
            <div className="flex flex-wrap gap-2">
              {CAUSE_OPTIONS.map(c => {
                const active = form.causes.includes(c);
                return (
                  <button
                    key={c} type="button" disabled={isReadOnly}
                    onClick={() => toggleCause(c)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                      active ? "bg-brand-600 border-brand-600 text-white" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    } ${isReadOnly ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </Row>
        </SectionCard>

        {/* Section: Routing */}
        <SectionCard title="Routing">
          <Row label="Requested By" required error={errors.requestedById}>
            <select value={form.requestedById} onChange={e => handleRequestedByChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.requestedById)}>
              <option value="">Select employee</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
          <Row label="Assigned To" error={errors.assignedToId} help="Optional at submission — required before this request can be Approved.">
            <select value={form.assignedToId} onChange={e => handleAssignedToChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.assignedToId)}>
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {employeeDisplayName(e)}</option>)}
            </select>
          </Row>
          <Row label="Estimated Downtime (Hours)" error={errors.estimatedDowntimeHours}>
            <input type="number" min="0" step="any" value={form.estimatedDowntimeHours} onChange={e => setField("estimatedDowntimeHours", e.target.value)} disabled={isReadOnly} placeholder="e.g. 4" className={inputCls(isReadOnly, errors.estimatedDowntimeHours)} />
          </Row>
        </SectionCard>

        {/* Section: Status & Remarks */}
        <SectionCard title="Status &amp; Remarks">
          <Row label="Status">
            <select value={form.status} disabled className={inputCls(true, false)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
          {form.status === "Rejected" && (
            <Row label="Rejection Reason" required error={errors.rejectionReason}>
              <textarea value={form.rejectionReason} disabled rows={2} className={inputCls(true, false) + " resize-none"} />
            </Row>
          )}
          <Row label="Remarks">
            <textarea value={form.remarks ?? ""} onChange={e => setField("remarks", e.target.value)} disabled={isReadOnly} rows={3} placeholder="Additional context or instructions…" className={inputCls(isReadOnly, false) + " resize-none"} />
          </Row>
        </SectionCard>

        {/* Section: Attachments */}
        <SectionCard title="Attachments">
          <div className="flex items-center gap-3">
            <div className="flex-1 text-sm text-gray-500">
              {form.attachmentFileNames?.length ? `${form.attachmentFileNames.length} file(s) attached` : "No attachments yet."}
            </div>
            {editing && (
              <label className="flex items-center gap-2 text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 cursor-pointer font-medium transition-colors">
                <Paperclip size={14} /> Add Files
                <input
                  ref={attachRef} type="file" multiple className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
          <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX, JPG, JPEG, PNG — max 10 MB each</p>
        </SectionCard>

        {/* Footer actions */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3 flex-wrap">
            <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all">
              <Save size={15} /> {isNew ? "Submit Request" : "Save"}
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
