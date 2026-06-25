import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";
import {
  Save, X, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronRight, ArrowLeft,
  Paperclip, Plus, Play, Send, Flag, Printer,
} from "lucide-react";

function Field({ label, required, error, children, className = "", hint }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1"><AlertCircle size={11} className="shrink-0" />{error}</p>}
    </div>
  );
}

const inputBase = (disabled, error) =>
  `w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 transition-colors
  ${error ? "border-red-300 focus:ring-red-300 bg-red-50/20" : "focus:ring-brand-600"}
  ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`;

const TInput = ({ value, onChange, disabled, placeholder, type = "text", error, max }) =>
  <input type={type} value={value ?? ""} onChange={onChange} disabled={disabled} placeholder={placeholder} max={max} className={inputBase(disabled, error)} />;

const TSelect = ({ value, onChange, disabled, options, placeholder, error }) => (
  <select value={value ?? ""} onChange={onChange} disabled={disabled} className={inputBase(disabled, error)}>
    <option value="">{placeholder || "Select..."}</option>
    {options.map(o => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

const WO_TYPES = ["Manufacturing Order", "Repair Order", "Job Work Order", "Rework Order", "Sub-contracting Order", "Trial Production Order"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];
const STATUSES = ["Draft", "Open", "In Progress", "Completed", "Cancelled"];

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

const statusBadge = (s) => ({
  Draft: "bg-gray-100 text-gray-600",
  Open: "bg-blue-50 text-brand-600",
  "In Progress": "bg-amber-50 text-amber-700",
  Completed: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-600",
}[s] || "bg-gray-100 text-gray-600");

export default function WorkOrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const attachRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";

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
  const setField = (key, value) => { setForm(p => ({ ...p, [key]: value })); if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; }); };

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

  // Material requirement lines
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
      return true;
    } catch (err) { showToast(err.message || "Failed to save.", "error"); return false; }
  };

  const handleSave = async (statusOverride) => {
    const next = statusOverride ? { ...form, status: statusOverride } : form;
    const errs = validate(next);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    await persist(next);
  };

  const handleCancelWO = async () => {
    if (!window.confirm("Cancel this Work Order? This cannot be undone.")) return;
    await handleSave("Cancelled");
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

  const productOptions = products.map(p => ({ value: p.id, label: `${p.productCode} — ${p.productName}` }));
  const employeeOptions = employees.map(e => ({ value: e.id, label: `${e.employeeId} — ${`${e.firstName || ""} ${e.lastName || ""}`.trim()}` }));
  const st = form.status;
  const editing = mode === "new" || mode === "edit";

  return (
    <Layout>
      <div className="space-y-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span>Asset Management</span><ChevronRight size={12} />
          <button onClick={() => navigate("/asset-management/work-order")} className="hover:text-brand-500 transition-colors">Work Order</button>
          {form.workOrderId && <><ChevronRight size={12} /><span className="text-brand-600 font-medium">{form.workOrderId}</span></>}
        </div>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
          </div>
        )}

        {/* Action bar */}
        <div className="bg-white border border-gray-200 rounded px-4 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <button onClick={() => navigate("/asset-management/work-order")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"><ArrowLeft size={13} /> Back</button>
          {mode === "view" && st !== "Cancelled" && <button onClick={() => setMode("edit")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-medium"><Edit2 size={13} /> Edit</button>}
          {editing && (
            <>
              <button onClick={() => handleSave(isNew ? "Draft" : undefined)} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"><Save size={13} /> {isNew ? "Save Draft" : "Save"}</button>
              <button onClick={handleDiscard} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium"><X size={13} /> Discard</button>
            </>
          )}
          {/* Lifecycle actions (view mode) */}
          {mode === "view" && st === "Draft" && <button onClick={() => handleSave("Open")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium"><Send size={13} /> Release</button>}
          {mode === "view" && st === "Open" && <button onClick={() => handleSave("In Progress")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded font-medium"><Play size={13} /> Start Production</button>}
          {mode === "view" && st === "In Progress" && <button onClick={() => handleSave("Completed")} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded font-medium"><Flag size={13} /> Mark Complete</button>}
          {mode === "view" && !isNew && !["Completed", "Cancelled"].includes(st) && <button onClick={handleCancelWO} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium"><X size={13} /> Cancel WO</button>}
          {mode === "view" && !isNew && <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded font-medium"><Printer size={13} /> Print</button>}
          {mode === "view" && !isNew && <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 rounded font-medium"><Trash2 size={13} /> Delete</button>}
          {form.updatedAt && <div className="ml-auto text-xs text-gray-400 text-right"><span>Updated: {new Date(form.updatedAt).toLocaleString()}</span></div>}
        </div>

        <div className="bg-white border border-gray-200 rounded shadow-sm">
          <div className="bg-gradient-to-r from-brand-900 to-brand-600 px-5 py-2.5 rounded-t flex items-center gap-4 text-white">
            <span className="font-bold text-base tracking-wide">{form.workOrderId || "NEW WORK ORDER"}</span>
            <span className="text-blue-200 text-sm">{form.productName || "—"}</span>
            <span className={`ml-auto px-2 py-0.5 rounded text-xs font-semibold ${statusBadge(st)}`}>{st}</span>
          </div>

          <div className="p-5 space-y-4">

            {/* Order details */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Order Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Work Order ID"><TInput value={form.workOrderId || "Auto (WO-XXX)"} disabled /></Field>
                <Field label="Work Order Date" required error={errors.workOrderDate}>
                  <TInput type="date" value={form.workOrderDate} max={todayStr()} onChange={e => setField("workOrderDate", e.target.value)} disabled={isReadOnly} error={errors.workOrderDate} />
                </Field>
                <Field label="Work Order Type" required error={errors.workOrderType}>
                  <TSelect value={form.workOrderType} onChange={e => setField("workOrderType", e.target.value)} disabled={isReadOnly} options={WO_TYPES} placeholder="Select type" error={errors.workOrderType} />
                </Field>
                <Field label="Job ID" hint="Job List master — coming soon">
                  <TInput value={form.jobId} onChange={e => setField("jobId", e.target.value)} disabled={isReadOnly} placeholder="e.g. JOB-001 (optional)" />
                </Field>
                <Field label="Asset Name" className="lg:col-span-2">
                  <TInput value={form.assetName} onChange={e => setField("assetName", e.target.value)} disabled={isReadOnly} placeholder="Auto-fetched from Job (optional)" />
                </Field>
              </div>
            </div>

            {/* Production */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Production</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Product" required error={errors.productId} className="lg:col-span-2">
                  <TSelect value={form.productId} onChange={e => handleProductChange(e.target.value)} disabled={isReadOnly} options={productOptions} placeholder="Select Finished / Semi-Finished product" error={errors.productId} />
                </Field>
                <Field label="Unit"><TInput value={form.unit} disabled placeholder="From product" /></Field>
                <Field label="BOM" hint="BOM master — coming soon">
                  <TInput value={form.bom} onChange={e => setField("bom", e.target.value)} disabled={isReadOnly} placeholder="e.g. BOM-001 (optional)" />
                </Field>
                <Field label="Quantity to Produce" required error={errors.quantityToProduce}>
                  <TInput type="number" value={form.quantityToProduce} onChange={e => setField("quantityToProduce", e.target.value)} disabled={isReadOnly} placeholder="e.g. 100" error={errors.quantityToProduce} />
                </Field>
                <Field label="Floor Name" hint="Work Centre master — coming soon">
                  <TInput value={form.floorName} onChange={e => setField("floorName", e.target.value)} disabled={isReadOnly} placeholder="e.g. Production Line 1" />
                </Field>
                <Field label="Assigned To">
                  <TSelect value={form.assignedToId} onChange={e => handleAssigneeChange(e.target.value)} disabled={isReadOnly} options={employeeOptions} placeholder="Select operator (optional)" />
                </Field>
                <Field label="Priority" required error={errors.priority}>
                  <TSelect value={form.priority} onChange={e => setField("priority", e.target.value)} disabled={isReadOnly} options={PRIORITIES} error={errors.priority} />
                </Field>
                <Field label="Status">
                  <TSelect value={form.status} onChange={e => setField("status", e.target.value)} disabled={isReadOnly} options={STATUSES} />
                </Field>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Schedule (Planned)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Start Time" required error={errors.startTime}>
                  <TInput type="datetime-local" value={form.startTime} onChange={e => setField("startTime", e.target.value)} disabled={isReadOnly} error={errors.startTime} />
                </Field>
                <Field label="End Time" error={errors.endTime}>
                  <TInput type="datetime-local" value={form.endTime} onChange={e => setField("endTime", e.target.value)} disabled={isReadOnly} error={errors.endTime} />
                </Field>
              </div>
            </div>

            {/* Material Requirements */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Material Requirements</p>
                {!isReadOnly && <button onClick={addLine} className="flex items-center gap-1 text-xs px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 font-medium"><Plus size={12} /> Add Line</button>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[640px]">
                  <thead>
                    <tr className="bg-white border-b border-gray-200 text-gray-500">
                      <th className="text-left px-2 py-1.5 font-medium w-10">#</th>
                      <th className="text-left px-2 py-1.5 font-medium">Component</th>
                      <th className="text-left px-2 py-1.5 font-medium w-28">Required Qty</th>
                      <th className="text-left px-2 py-1.5 font-medium w-24">Unit</th>
                      <th className="text-left px-2 py-1.5 font-medium w-28">Issued Qty</th>
                      <th className="text-left px-2 py-1.5 font-medium w-32">Material Status</th>
                      {!isReadOnly && <th className="w-8" />}
                    </tr>
                  </thead>
                  <tbody>
                    {(!form.materials || form.materials.length === 0) ? (
                      <tr><td colSpan={isReadOnly ? 6 : 7} className="text-center py-6 text-gray-400">No material lines. {!isReadOnly && "Click “Add Line” (BOM auto-populate coming soon)."}</td></tr>
                    ) : form.materials.map((m, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                        <td className="px-2 py-1"><input value={m.component ?? ""} onChange={e => setLine(i, "component", e.target.value)} disabled={isReadOnly} placeholder="Component code / name" className={inputBase(isReadOnly)} /></td>
                        <td className="px-2 py-1"><input type="number" value={m.requiredQty ?? ""} onChange={e => setLine(i, "requiredQty", e.target.value)} disabled={isReadOnly} className={inputBase(isReadOnly)} /></td>
                        <td className="px-2 py-1"><input value={m.unit ?? ""} onChange={e => setLine(i, "unit", e.target.value)} disabled={isReadOnly} className={inputBase(isReadOnly)} /></td>
                        <td className="px-2 py-1"><input type="number" value={m.issuedQty ?? ""} onChange={e => setLine(i, "issuedQty", e.target.value)} disabled={isReadOnly} className={inputBase(isReadOnly)} /></td>
                        <td className="px-2 py-1"><span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${matStatus(m) === "Fully Issued" ? "bg-green-50 text-green-700" : matStatus(m) === "Partially Issued" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{matStatus(m)}</span></td>
                        {!isReadOnly && <td className="px-2 py-1"><button onClick={() => removeLine(i)} className="text-red-400 hover:text-red-600"><X size={13} /></button></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Remarks + attachments */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Remarks">
                  <textarea value={form.remarks ?? ""} onChange={e => setField("remarks", e.target.value)} disabled={isReadOnly} rows={3} placeholder="Production notes, special instructions..."
                    className={`w-full px-2.5 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-brand-600 resize-none transition-colors ${isReadOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-300 hover:border-gray-400"}`} />
                </Field>
                <Field label="Attachments">
                  <div>
                    <input ref={attachRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" multiple disabled={isReadOnly}
                      onChange={e => { const names = Array.from(e.target.files).map(f => f.name); setField("attachmentFileNames", [...(form.attachmentFileNames || []), ...names]); e.target.value = ""; }}
                      className="hidden" />
                    {!isReadOnly && <button type="button" onClick={() => attachRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 text-gray-600 font-medium"><Paperclip size={12} /> Add Files</button>}
                    {form.attachmentFileNames?.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {form.attachmentFileNames.map((name, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600"><Paperclip size={11} className="text-gray-400 shrink-0" /><span className="truncate">{name}</span>
                            {!isReadOnly && <button type="button" onClick={() => setField("attachmentFileNames", form.attachmentFileNames.filter((_, j) => j !== i))} className="ml-auto text-red-400 hover:text-red-600 shrink-0"><X size={11} /></button>}
                          </li>
                        ))}
                      </ul>
                    ) : <p className="text-xs text-gray-400 mt-1.5">No attachments uploaded.</p>}
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
              <ul className="text-xs text-red-600 space-y-0.5">{Object.values(errors).map((e, i) => <li key={i}>• {e}</li>)}</ul>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
