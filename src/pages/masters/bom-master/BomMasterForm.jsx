import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import {
  Save, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft,
  Layers3, Plus, XCircle,
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

const emptyLine = () => ({ consumableId: "", consumableCode: "", consumableName: "", quantityPerUnit: "", unit: "" });

const emptyForm = () => ({
  bomId: "",
  produceItemId: "", produceItemName: "", produceItemCode: "",
  quantityToProduce: "1",
  unit: "",
  lines: [emptyLine()],
  isDeactivated: false,
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "", changelog: [],
});

export default function BomMasterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [jobs, setJobs] = useState([]);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "System";
  const isReadOnly = mode === "view";
  const editing = mode === "new" || mode === "edit";

  useEffect(() => {
    Promise.all([
      api.get("/api/bom-masters").catch(() => []),
      api.get("/api/product-masters").catch(() => []),
      api.get("/api/work-orders").catch(() => []),
      api.get("/api/job-list").catch(() => []),
    ]).then(([boms, prods, wos, jbs]) => {
      setAllRecords(boms);
      setProducts(prods.filter(p => !p.isDeactivated));
      setWorkOrders(wos);
      setJobs(jbs);
      if (!isNew && id) {
        const found = boms.find(r => r.id === id);
        if (found) setForm({ ...emptyForm(), ...found, lines: found.lines?.length ? found.lines : [emptyLine()] });
        else navigate("/masters/bom-master");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    if (errors[key]) setErrors(p => { const e = { ...p }; delete e[key]; return e; });
  };

  const handleProduceItemChange = (pid) => {
    const p = products.find(x => x.id === pid);
    setForm(prev => ({ ...prev, produceItemId: pid, produceItemName: p?.productName || "", produceItemCode: p?.productCode || "", unit: p?.units || "" }));
    if (errors.produceItemId) setErrors(prevE => { const e = { ...prevE }; delete e.produceItemId; return e; });
  };

  const setLine = (i, key, value) => {
    setForm(p => ({
      ...p,
      lines: p.lines.map((l, j) => {
        if (j !== i) return l;
        if (key === "consumableId") {
          const prod = products.find(x => x.id === value);
          return { ...l, consumableId: value, consumableCode: prod?.productCode || "", consumableName: prod?.productName || "", unit: prod?.units || "" };
        }
        return { ...l, [key]: value };
      }),
    }));
  };

  const addLine = () => setForm(p => ({ ...p, lines: [...p.lines, emptyLine()] }));
  const removeLine = (i) => setForm(p => (p.lines.length <= 1 ? p : { ...p, lines: p.lines.filter((_, j) => j !== i) }));

  const nextBomId = () => {
    const nums = allRecords.map(r => parseInt((r.bomId || "").replace(/\D/g, ""), 10)).filter(n => !isNaN(n));
    return "BOM-" + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0");
  };

  const validate = (f) => {
    const e = {};
    if (!f.produceItemId) e.produceItemId = "Produce Item is required.";
    if (f.quantityToProduce === "" || Number(f.quantityToProduce) <= 0) e.quantityToProduce = "Quantity to Produce must be greater than zero.";
    const lineErrors = f.lines.map(l => {
      const le = {};
      if (!l.consumableId) le.consumableId = "Consumable Item is required.";
      else if (l.consumableId === f.produceItemId) le.consumableId = "Consumable Item cannot be the same as the Produce Item.";
      if (l.quantityPerUnit === "" || Number(l.quantityPerUnit) <= 0) le.quantityPerUnit = "Quantity per Unit must be greater than zero.";
      return le;
    });
    if (lineErrors.some(le => Object.keys(le).length)) e.lines = lineErrors;
    if (!f.lines.length) e.linesGeneral = "At least one child item line is required.";
    return e;
  };

  const persist = async (nextForm) => {
    const now = new Date().toISOString();
    const entry = { timestamp: now, user: userName, action: isNew ? "Created" : "Updated", changes: isNew ? "Record created" : "Record updated" };
    let saved;
    if (isNew) {
      const payload = { ...nextForm, id: Date.now().toString(), bomId: nextForm.bomId || nextBomId(), createdAt: now, updatedAt: now, createdBy: userName, updatedBy: userName, changelog: [entry] };
      saved = await api.post("/api/bom-masters", payload);
    } else {
      const payload = { ...nextForm, updatedAt: now, updatedBy: userName, changelog: [...(nextForm.changelog || []), entry] };
      saved = await api.put(`/api/bom-masters/${id}`, payload);
    }
    setForm({ ...emptyForm(), ...saved, lines: saved.lines?.length ? saved.lines : [emptyLine()] });
    setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
    return saved;
  };

  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); showToast("Please correct the highlighted fields.", "error"); return; }
    try {
      const saved = await persist(form);
      setMode("view"); setErrors({});
      showToast("BOM saved.");
      if (isNew) navigate(`/masters/bom-master/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/bom-master"); return; }
    try { const found = await api.get(`/api/bom-masters/${id}`); setForm({ ...emptyForm(), ...found, lines: found.lines?.length ? found.lines : [emptyLine()] }); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    const referenced =
      workOrders.some(w => (w.bom || "").trim().toLowerCase() === form.bomId.toLowerCase()) ||
      jobs.some(j => (j.bom || "").trim().toLowerCase() === form.bomId.toLowerCase());
    if (referenced) { showToast("This BOM cannot be deleted as it is referenced by one or more Work Orders or Job List records. Deactivate instead.", "error"); return; }
    if (!window.confirm(`Delete BOM "${form.bomId}"? This cannot be undone.`)) return;
    try { await api.del(`/api/bom-masters/${id}`); navigate("/masters/bom-master"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";
  const lineErrors = errors.lines || [];

  return (
    <Layout>
      <div className="w-full space-y-4">

        <button onClick={() => navigate("/masters/bom-master")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> BOM Master
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
              <Layers3 size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
                {isNew ? "New BOM" : (form.produceItemName ? `${form.bomId} — ${form.produceItemName}` : form.bomId || "BOM")}
              </h1>
              <p className="text-sm text-white/70 mt-0.5">
                {isNew ? "Define parent product and child item consumption" : (form.isDeactivated ? "Deactivated" : "Active")}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {!isNew && (
                <button onClick={() => setShowChangelog(s => !s)} className={headerBtn}><FileText size={13} /> History</button>
              )}
              {mode === "view" && (
                <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>
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

        {/* Section: Parent Item */}
        <SectionCard title="Parent Item">
          <Row label="BOM ID" help="Auto-generated on first save.">
            <input value={form.bomId || "Auto (BOM-XXX)"} disabled className={inputCls(true, false)} />
          </Row>
          <Row label="Produce Item" required error={errors.produceItemId}>
            <select value={form.produceItemId} onChange={e => handleProduceItemChange(e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.produceItemId)}>
              <option value="">Select finished product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.productCode} — {p.productName}</option>)}
            </select>
          </Row>
          {form.produceItemCode && <Row label="Product Code"><input value={form.produceItemCode} disabled className={inputCls(true, false)} /></Row>}
          <Row label="Quantity to Produce" required error={errors.quantityToProduce}>
            <input type="number" min="1" step="any" value={form.quantityToProduce} onChange={e => setField("quantityToProduce", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, errors.quantityToProduce)} />
          </Row>
          {form.unit && <Row label="Unit"><input value={form.unit} disabled className={inputCls(true, false)} /></Row>}
        </SectionCard>

        {/* Section: BOM Line Items */}
        <SectionCard
          title="BOM Line Items"
          action={!isReadOnly && (
            <button onClick={addLine} className="flex items-center gap-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 text-gray-600 font-medium transition-colors">
              <Plus size={12} /> Add Line
            </button>
          )}
        >
          {errors.linesGeneral && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{errors.linesGeneral}</p>}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500">
                  <th className="text-left pb-2 font-medium w-8">#</th>
                  <th className="text-left pb-2 font-medium">Consumable Item</th>
                  <th className="text-left pb-2 font-medium w-32">Qty per Unit</th>
                  <th className="text-left pb-2 font-medium w-20">Unit</th>
                  <th className="text-left pb-2 font-medium w-32">Total Required</th>
                  {!isReadOnly && <th className="w-8" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {form.lines.map((l, i) => {
                  const le = lineErrors[i] || {};
                  const total = (l.quantityPerUnit !== "" && form.quantityToProduce !== "" && !isNaN(Number(l.quantityPerUnit)) && !isNaN(Number(form.quantityToProduce)))
                    ? (Number(l.quantityPerUnit) * Number(form.quantityToProduce))
                    : "";
                  return (
                    <tr key={i}>
                      <td className="py-2 pr-2 text-gray-400 align-top pt-3">{i + 1}</td>
                      <td className="py-2 pr-2 align-top">
                        <select value={l.consumableId} onChange={e => setLine(i, "consumableId", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, le.consumableId)}>
                          <option value="">Select consumable</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.productCode} — {p.productName}</option>)}
                        </select>
                        {le.consumableId && <p className="text-red-500 mt-1">{le.consumableId}</p>}
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <input type="number" min="0" step="any" value={l.quantityPerUnit} onChange={e => setLine(i, "quantityPerUnit", e.target.value)} disabled={isReadOnly} className={inputCls(isReadOnly, le.quantityPerUnit)} />
                        {le.quantityPerUnit && <p className="text-red-500 mt-1">{le.quantityPerUnit}</p>}
                      </td>
                      <td className="py-2 pr-2 align-top pt-3 text-gray-600">{l.unit || "—"}</td>
                      <td className="py-2 pr-2 align-top pt-3 font-medium text-gray-800">{total !== "" ? total : "—"}</td>
                      {!isReadOnly && (
                        <td className="py-2 align-top pt-3">
                          <button onClick={() => removeLine(i)} disabled={form.lines.length <= 1} className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                            <XCircle size={15} />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

        {!isNew && form.createdAt && (
          <p className="text-xs text-gray-400 px-1">
            Created {new Date(form.createdAt).toLocaleString()} by {form.createdBy} · Updated {new Date(form.updatedAt).toLocaleString()} by {form.updatedBy}
          </p>
        )}
      </div>
    </Layout>
  );
}
