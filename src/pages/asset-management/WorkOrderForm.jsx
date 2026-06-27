import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Paperclip, Plus, Play, Send, Flag, ClipboardList, XCircle,
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

const WO_TYPES = ["Manufacturing Order", "Repair Order", "Job Work Order", "Rework Order", "Sub-contracting Order", "Trial Production Order"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Draft", "Open", "In Progress", "Completed", "Cancelled"];

const STATUS_PILL = {
  Draft:        "bg-gray-100 text-gray-600",
  Open:         "bg-blue-50 text-blue-700",
  "In Progress":"bg-amber-50 text-amber-700",
  Completed:    "bg-green-50 text-green-700",
  Cancelled:    "bg-red-50 text-red-600",
};

const PRIORITY_PILL = {
  Critical: "bg-red-100 text-red-700",
  High:     "bg-orange-100 text-orange-700",
  Medium:   "bg-amber-100 text-amber-700",
  Low:      "bg-green-100 text-green-700",
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  jobId: "", assetName: "",
  workOrderId: "", workOrderDate: todayStr(),
  workOrderType: "", productId: "", productName: "", productCode: "", unit: "",
  bom: "", quantityToProduce: "", floorName: "", assignedToId: "", assignedToName: "",
  priority: "Medium", startTime: "", endTime: "", status: "Draft", remarks: "",
  materials: [],
  attachmentFileNames: [],
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

const matStatus = (line) => {
  const req = Number(line.requiredQty) || 0, iss = Number(line.issuedQty) || 0;
  if (iss <= 0) return "Pending";
  if (iss < req) return "Partially Issued";
  return "Fully Issued";
};

export default function WorkOrderForm() {
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
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";
  const st = form.status;

  useEffect(() => {
    Promise.all([
      api.get("/api/work-orders").catch(() => []),
      api.get("/api/product-masters").catch(() => []),
      api.get("/api/employees").catch(() => []),
    ]).then(([wos, prods, emps]) => {
      setAllRecords(wos);
      setProducts(prods.filter(p => !p.isDeactivated));
      setEmployees(emps.filter(e => !e.isDeactivated && (e.status || "Active") === "Active"));
      if (!isNew && id) {
        const found = wos.find(r => r.id === id);
        if (found) setForm({ ...emptyForm(), ...found });
        else navigate("/asset-management/work-order");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const handleProductChange = (productId) => {
    const p = products.find(x => x.id === productId);
    setForm(prev => ({ ...prev, productId, productName: p?.productName || "", productCode: p?.productCode || "", unit: p?.units || "" }));
    if (errors.productId) setErrors(p => { const e = { ...p }; delete e.productId; return e; });
  };

  const handleAssigneeChange = (eid) => {
    const e = employees.find(x => x.id === eid);
    const nm = e ? `${e.firstName || ""} ${e.lastName || ""}`.trim() || e.employeeId : "";
    setForm(prev => ({ ...prev, assignedToId: eid, assignedToName: nm }));
  };

  const addLine = () => setForm(p => ({ ...p, materials: [...(p.materials || []), { component: "", requiredQty: "", unit: "", issuedQty: "" }] }));
  const removeLine = (i) => setForm(p => ({ ...p, materials: p.materials.filter((_, j) => j !== i) }));
  const setLine = (i, key, value) => setForm(p => ({ ...p, materials: p.materials.map((m, j) => j === i ? { ...m, [key]: value } : m) }));

  const nextWoId = () => {
    const nums = allRecords.map(r => parseInt((r.workOrderId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "WO-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.workOrderType) e.workOrderType = "Work Order Type is required.";
    if (!f.productId) e.productId = "Product is required.";
    if (f.quantityToProduce === "" || Number(f.quantityToProduce) <= 0) e.quantityToProduce = "Quantity must be greater than zero.";
    if (!f.priority) e.priority = "Priority is required.";
    if (!f.startTime) e.startTime = "Start Time is required.";
    if (f.endTime && f.startTime && f.endTime < f.startTime) e.endTime = "End Time must be on/after Start Time.";
    if (!f.workOrderDate) e.workOrderDate = "Work Order Date is required.";
    return e;
  };

  const persist = async (nextForm) => {
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: `Status: ${nextForm.status}` };
    try {
      let saved;
      if (isNew) {
        const payload = { ...nextForm, id: Date.now().toString(), workOrderId: nextForm.workOrderId || nextWoId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
        saved = await api.post("/api/work-orders", payload);
      } else {
        const payload = { ...nextForm, updatedAt: now, updatedBy: userName, changelog: [...(nextForm.changelog || []), entry] };
        saved = await api.put(`/api/work-orders/${id}`, payload);
      }
      setForm({ ...emptyForm(), ...saved });
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Work Order saved.");
      if (isNew) navigate(`/asset-management/work-order/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleSave = async (statusOverride) => {
    const next = statusOverride ? { ...form, status: statusOverride } : form;
    const errs = validate(next);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    await persist(next);
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete Work Order "${form.workOrderId}"? This cannot be undone.`)) return;
    try { await api.del(`/api/work-orders/${id}`); navigate("/asset-management/work-order"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/asset-management/work-order"); return; }
    try { const found = await api.get(`/api/work-orders/${id}`); setForm({ ...emptyForm(), ...found }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">

        <button onClick={() => navigate("/asset-management/work-order")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Work Order
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />} {toast.msg}
          </div>
        )}

        {/* Header card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {!isNew && form.workOrderId
                ? form.workOrderId.replace(/\D/g, "").slice(-3).replace(/^0+/, "") || "WO"
                : <ClipboardList size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New Work Order" : (form.productName ? `${form.workOrderId} — ${form.productName}` : form.workOrderId || "Work Order")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5 flex items-center gap-2">
                {!isNew && form.workOrderType && <span>{form.workOrderType}</span>}
                {!isNew && form.priority && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PRIORITY_PILL[form.priority] || "bg-white/20 text-white"}`}>
                    {form.priority}
                  </span>
                )}
                {isNew && "Create a new production work order"}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}>
                  <FileText size={13} /> History
                </button>
              )}
              {mode === "view" && st !== "Cancelled" && st !== "Completed" && (
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

        {/* Section: Order Details */}
        <SectionCard title="Order Details">
          <Row label="Work Order ID" help="Auto-generated on first save.">
            <input value={form.workOrderId || "Auto (WO-XXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Work Order Date" required error={errors.workOrderDate}>
            <input type="date" value={form.workOrderDate} max={todayStr()} onChange={e => setField("workOrderDate", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.workOrderDate)} />
          </Row>
          <Row label="Work Order Type" required error={errors.workOrderType}>
            <select value={form.workOrderType} onChange={e => setField("workOrderType", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.workOrderType)}>
              <option value="">Select type…</option>
              {WO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Row>
          <Row label="Job ID" help="Link to a Job List entry (optional).">
            <input value={form.jobId} onChange={e => setField("jobId", e.target.value)} disabled={isReadOnly} placeholder="e.g. JOB-000001" className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Asset Name" help="Auto-fetched from linked Job (optional).">
            <input value={form.assetName} onChange={e => setField("assetName", e.target.value)} disabled={isReadOnly} placeholder="e.g. CNC Machine Model X200" className={inputCls(isReadOnly, false)} />
          </Row>
        </SectionCard>

        {/* Section: Production */}
        <SectionCard title="Production">
          <Row label="Product" required error={errors.productId}>
            <select value={form.productId} onChange={e => handleProductChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.productId)}>
              <option value="">Select Finished / Semi-Finished product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.productCode} — {p.productName}</option>)}
            </select>
          </Row>
          {form.unit && (
            <Row label="Unit">
              <input value={form.unit} disabled className={inputCls(true, false)} />
            </Row>
          )}
          <Row label="BOM" help="BOM master — coming soon.">
            <input value={form.bom} onChange={e => setField("bom", e.target.value)} disabled={isReadOnly} placeholder="e.g. BOM-001 (optional)" className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Quantity to Produce" required error={errors.quantityToProduce}>
            <input type="number" value={form.quantityToProduce} onChange={e => setField("quantityToProduce", e.target.value)} disabled={isReadOnly} placeholder="e.g. 100" min={1} className={inputCls(isReadOnly, errors.quantityToProduce)} />
          </Row>
          <Row label="Floor / Work Centre" help="Work Centre master — coming soon.">
            <input value={form.floorName} onChange={e => setField("floorName", e.target.value)} disabled={isReadOnly} placeholder="e.g. Production Line 1" className={inputCls(isReadOnly, false)} />
          </Row>
          <Row label="Assigned To">
            <select value={form.assignedToId} onChange={e => handleAssigneeChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)}>
              <option value="">Select operator (optional)</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.employeeId} — {`${e.firstName || ""} ${e.lastName || ""}`.trim()}</option>)}
            </select>
          </Row>
          <Row label="Priority" required error={errors.priority}>
            <select value={form.priority} onChange={e => setField("priority", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.priority)}>
              <option value="">Select priority</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </Row>
          <Row label="Status">
            <select value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
        </SectionCard>

        {/* Section: Schedule */}
        <SectionCard title="Schedule (Planned)">
          <Row label="Start Time" required error={errors.startTime}>
            <input type="datetime-local" value={form.startTime} onChange={e => setField("startTime", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.startTime)} />
          </Row>
          <Row label="End Time" error={errors.endTime}>
            <input type="datetime-local" value={form.endTime} onChange={e => setField("endTime", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.endTime)} />
          </Row>
        </SectionCard>

        {/* Section: Material Requirements */}
        <SectionCard
          title="Material Requirements"
          action={!isReadOnly && (
            <button onClick={addLine} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 font-medium transition-colors">
              <Plus size={12} /> Add Line
            </button>
          )}
        >
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left pb-2 font-medium w-8">#</th>
                  <th className="text-left pb-2 font-medium">Component</th>
                  <th className="text-left pb-2 font-medium w-28">Required Qty</th>
                  <th className="text-left pb-2 font-medium w-24">Unit</th>
                  <th className="text-left pb-2 font-medium w-28">Issued Qty</th>
                  <th className="text-left pb-2 font-medium w-32">Status</th>
                  {!isReadOnly && <th className="w-8" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!form.materials || form.materials.length === 0) ? (
                  <tr>
                    <td colSpan={isReadOnly ? 6 : 7} className="text-center py-8 text-gray-400">
                      No material lines.{!isReadOnly && ' Click "Add Line" to add components.'}
                    </td>
                  </tr>
                ) : form.materials.map((m, i) => (
                  <tr key={i}>
                    <td className="py-2 pr-2 text-gray-400">{i + 1}</td>
                    <td className="py-2 pr-2">
                      <input value={m.component ?? ""} onChange={e => setLine(i, "component", e.target.value)} disabled={isReadOnly} placeholder="Component code / name" className={inputCls(isReadOnly, false)} />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" value={m.requiredQty ?? ""} onChange={e => setLine(i, "requiredQty", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)} />
                    </td>
                    <td className="py-2 pr-2">
                      <input value={m.unit ?? ""} onChange={e => setLine(i, "unit", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)} />
                    </td>
                    <td className="py-2 pr-2">
                      <input type="number" value={m.issuedQty ?? ""} onChange={e => setLine(i, "issuedQty", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, false)} />
                    </td>
                    <td className="py-2 pr-2">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${matStatus(m) === "Fully Issued" ? "bg-green-50 text-green-700" : matStatus(m) === "Partially Issued" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>
                        {matStatus(m)}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="py-2">
                        <button onClick={() => removeLine(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <XCircle size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Section: Remarks */}
        <SectionCard title="Remarks">
          <Row label="Remarks">
            <textarea
              value={form.remarks ?? ""}
              onChange={e => setField("remarks", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              placeholder="Production notes, special instructions…"
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
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
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
          <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG — max 10 MB each</p>
        </SectionCard>

        {/* Footer actions */}
        {editing && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3 flex-wrap">
            <button onClick={() => handleSave(isNew ? "Draft" : undefined)} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all">
              <Save size={15} /> {isNew ? "Save Draft" : "Save"}
            </button>
            {st === "Draft" && !isNew && (
              <button onClick={() => handleSave("Open")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <Send size={14} /> Release
              </button>
            )}
            {st === "Open" && (
              <button onClick={() => handleSave("In Progress")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                <Play size={14} /> Start Production
              </button>
            )}
            {st === "In Progress" && (
              <button onClick={() => handleSave("Completed")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
                <Flag size={14} /> Mark Complete
              </button>
            )}
            {!isNew && !["Completed", "Cancelled"].includes(st) && (
              <button onClick={() => handleSave("Cancelled")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
                <XCircle size={14} /> Cancel WO
              </button>
            )}
            <button onClick={handleDiscard} className="text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors ml-auto">
              Discard
            </button>
          </div>
        )}

        {mode === "view" && !isNew && st !== "Cancelled" && st !== "Completed" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-6 py-4 flex items-center gap-3 flex-wrap">
            {st === "Draft" && (
              <button onClick={() => handleSave("Open")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                <Send size={14} /> Release
              </button>
            )}
            {st === "Open" && (
              <button onClick={() => handleSave("In Progress")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                <Play size={14} /> Start Production
              </button>
            )}
            {st === "In Progress" && (
              <button onClick={() => handleSave("Completed")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
                <Flag size={14} /> Mark Complete
              </button>
            )}
            <button onClick={() => handleSave("Cancelled")} className="flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-xl font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
              <XCircle size={14} /> Cancel WO
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
