import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../../components/Layout";
import { api } from "../../../lib/api.js";
import { Save, X, Trash2, Edit2, FileText, CheckCircle, AlertCircle, ChevronLeft, Paperclip, Image as ImageIcon, Package } from "lucide-react";

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
  `w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm transition-all focus:outline-none
  ${error ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
          : "border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"}
  ${disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white hover:border-gray-300"}`;

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
  productCode: "",
  productName: "",
  productTypeId: "",
  productTypeName: "",
  subtypeId: "",
  subtypeName: "",
  units: "",
  reorderLevel: "",
  description: "",
  isAsset: "No",
  photoFileName: "",
  attachmentFileNames: [],
  isDeactivated: false,
  createdAt: "", updatedAt: "", createdBy: "", updatedBy: "",
  changelog: [],
});

function validate(form, allRecords, editingId) {
  const e = {};
  if (!form.productCode?.trim()) e.productCode = "Product Code is required.";
  else if (allRecords.some(r => r.productCode?.trim().toLowerCase() === form.productCode.trim().toLowerCase() && r.id !== editingId))
    e.productCode = "Product Code already exists.";
  if (!form.productName?.trim()) e.productName = "Product Name is required.";
  if (!form.productTypeId) e.productTypeId = "Product Type is required.";
  if (!form.units?.trim()) e.units = "Unit is required.";
  if (form.reorderLevel !== "" && form.reorderLevel !== undefined && isNaN(Number(form.reorderLevel)))
    e.reorderLevel = "Reorder Level must be a number.";
  return e;
}

export default function ProductMasterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [mode, setMode] = useState(isNew ? "new" : "view");
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [showChangelog, setShowChangelog] = useState(false);
  const [allRecords, setAllRecords] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [allSubtypes, setAllSubtypes] = useState([]);
  const photoRef = useRef(null);
  const attachRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const isReadOnly = mode === "view";

  useEffect(() => {
    Promise.all([
      api.get("/api/product-masters"),
      api.get("/api/product-types").catch(() => []),
      api.get("/api/product-subtypes").catch(() => []),
    ]).then(([masters, types, subtypes]) => {
      setAllRecords(masters);
      setProductTypes(types.filter(t => !t.isDeactivated));
      setAllSubtypes(subtypes.filter(s => !s.isDeactivated));
      if (!isNew && id) {
        const found = masters.find(r => r.id === id);
        if (found) setForm(found);
        else navigate("/masters/product-master");
      }
    }).catch(console.error);
  }, [id, isNew]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const setField = (key, value) => { setForm(prev => ({ ...prev, [key]: value })); if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; }); };

  const handleTypeChange = (typeId) => {
    const found = productTypes.find(t => t.id === typeId);
    setForm(prev => ({ ...prev, productTypeId: typeId, productTypeName: found?.name || "", subtypeId: "", subtypeName: "" }));
    if (errors.productTypeId) setErrors(prev => { const e = { ...prev }; delete e.productTypeId; return e; });
  };

  const handleSubtypeChange = (subtypeId) => {
    const found = allSubtypes.find(s => s.id === subtypeId);
    setForm(prev => ({ ...prev, subtypeId, subtypeName: found?.subtypeName || "" }));
  };

  const filteredSubtypes = allSubtypes.filter(s => !form.productTypeId || s.productTypeId === form.productTypeId);

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
        saved = await api.post("/api/product-masters", payload);
      } else {
        const payload = { ...form, updatedAt: now, updatedBy: userName, changelog: [...(form.changelog || []), changeEntry] };
        saved = await api.put(`/api/product-masters/${id}`, payload);
      }
      setForm(saved);
      setAllRecords(prev => isNew ? [...prev, saved] : prev.map(r => r.id === saved.id ? saved : r));
      setMode("view"); setErrors({});
      showToast("Product saved successfully.");
      if (isNew) navigate(`/masters/product-master/${saved.id}`, { replace: true });
    } catch (err) { showToast(err.message || "Failed to save.", "error"); }
  };

  const handleDiscard = async () => {
    if (isNew) { navigate("/masters/product-master"); return; }
    try { const found = await api.get(`/api/product-masters/${id}`); setForm(found); } catch { /* keep */ }
    setMode("view"); setErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete product "${form.productName}"? This cannot be undone.`)) return;
    try { await api.del(`/api/product-masters/${id}`); navigate("/masters/product-master"); }
    catch (err) { showToast(err.message || "Failed to delete.", "error"); }
  };

  const typeOptions = productTypes.map(t => ({ value: t.id, label: t.name }));
  const subtypeOptions = filteredSubtypes.map(s => ({ value: s.id, label: s.subtypeName }));

  const headerBtn = "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-white/15 transition-colors";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-4">

        <button onClick={() => navigate("/masters/product-master")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 transition-colors font-medium">
          <ChevronLeft size={15} /> Product Master
        </button>

        {toast && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
            {toast.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}{toast.msg}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-brand-800 to-brand-600 px-6 py-5 flex items-center gap-4 flex-wrap">
            <div className="w-12 h-12 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center text-white font-bold shrink-0">
              {form.productCode ? form.productCode.slice(0, 2).toUpperCase() : <Package size={22} />}
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-white tracking-tight leading-tight">{isNew ? "New Product" : (form.productName || "Product")}</h1>
              <p className="text-sm text-white/70 mt-0.5">
                {form.productCode ? <span className="font-mono">{form.productCode}</span> : "Add a new product to the master"}
                {form.productTypeName && <span className="ml-2">· {form.productTypeName}</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {!isNew && <button onClick={() => setShowChangelog(!showChangelog)} className={headerBtn}><FileText size={13} /> Changelog</button>}
              {mode === "view" && <button onClick={() => setMode("edit")} className={headerBtn}><Edit2 size={13} /> Edit</button>}
              {mode === "view" && !isNew && <button onClick={handleDelete} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium border border-white/25 text-white hover:bg-red-500/80 transition-colors"><Trash2 size={13} /> Delete</button>}
            </div>
          </div>

          {showChangelog && (
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
              <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-2"><FileText size={13} /> Audit Log — {form.productCode || "New"}</h3>
              {!form.changelog?.length ? <p className="text-xs text-gray-400">No changes recorded yet.</p> : (
                <table className="w-full text-xs">
                  <thead><tr className="text-gray-400 text-left"><th className="pb-1.5 font-medium">Date &amp; Time</th><th className="pb-1.5 font-medium">User</th><th className="pb-1.5 font-medium">Action</th><th className="pb-1.5 font-medium">Details</th></tr></thead>
                  <tbody>{form.changelog.map((c, i) => (<tr key={i} className="border-t border-gray-100"><td className="py-1.5 text-gray-600">{new Date(c.timestamp).toLocaleString()}</td><td className="py-1.5 text-gray-600">{c.user}</td><td className="py-1.5"><span className={`px-1.5 py-0.5 rounded text-[11px] ${c.action === "Created" ? "bg-green-50 text-green-600" : "bg-brand-50 text-brand-600"}`}>{c.action}</span></td><td className="py-1.5 text-gray-600">{c.changes}</td></tr>))}</tbody>
                </table>
              )}
            </div>
          )}

          <div className="p-5 space-y-4">

            {/* Classification */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Classification</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Product Type" required error={errors.productTypeId}>
                  <TSelect value={form.productTypeId} onChange={e => handleTypeChange(e.target.value)} disabled={isReadOnly} options={typeOptions} placeholder="Select Product Type" error={errors.productTypeId} />
                </Field>
                <Field label="Product Sub-type">
                  <TSelect
                    value={form.subtypeId}
                    onChange={e => handleSubtypeChange(e.target.value)}
                    disabled={isReadOnly || !form.productTypeId}
                    options={subtypeOptions}
                    placeholder={form.productTypeId ? "Select Sub-type (optional)" : "Select Product Type first"}
                  />
                </Field>
              </div>
            </div>

            {/* Core Details */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Product Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Product Code" required error={errors.productCode}>
                  <TInput value={form.productCode} onChange={e => setField("productCode", e.target.value.toUpperCase())} disabled={isReadOnly} placeholder="e.g. RM-001" maxLength={30} error={errors.productCode} />
                </Field>
                <Field label="Product Name" required error={errors.productName} className="sm:col-span-1 lg:col-span-2">
                  <TInput value={form.productName} onChange={e => setField("productName", e.target.value)} disabled={isReadOnly} placeholder="e.g. MS Plate 10mm" maxLength={128} error={errors.productName} />
                </Field>
                <Field label="Units" required error={errors.units}>
                  <TInput value={form.units} onChange={e => setField("units", e.target.value.toUpperCase())} disabled={isReadOnly} placeholder="e.g. KGS, MTR, NOS" maxLength={20} error={errors.units} />
                  <p className="text-[11px] text-gray-400 mt-0.5">UOM Master dropdown coming soon.</p>
                </Field>
                <Field label="Reorder Level" error={errors.reorderLevel}>
                  <TInput type="number" value={form.reorderLevel} onChange={e => setField("reorderLevel", e.target.value)} disabled={isReadOnly} placeholder="e.g. 50" error={errors.reorderLevel} />
                </Field>
                <Field label="Is Asset">
                  <TSelect value={form.isAsset} onChange={e => setField("isAsset", e.target.value)} disabled={isReadOnly} options={[{ value: "No", label: "No" }, { value: "Yes", label: "Yes — Capital Asset" }]} />
                </Field>
              </div>
              <Field label="Description">
                <textarea
                  value={form.description ?? ""}
                  onChange={e => setField("description", e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Technical specs, storage instructions, quality notes..."
                  rows={3}
                  className={`w-full px-3.5 py-2.5 text-sm border rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 resize-none transition-all ${isReadOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200" : "bg-white border-gray-200 hover:border-gray-300"}`}
                />
              </Field>
            </div>

            {/* Documents & Photo */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Documents & Photo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Product photo */}
                <Field label="Product Photo">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {form.photoFileName
                        ? <span className="text-xs text-gray-500 text-center px-1 leading-tight break-all">{form.photoFileName}</span>
                        : <ImageIcon size={22} className="text-gray-400" />}
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
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => photoRef.current?.click()} className="text-xs px-3 py-1.5 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-600 font-medium">
                            Choose Photo
                          </button>
                          {form.photoFileName && (
                            <button type="button" onClick={() => setField("photoFileName", "")} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                          )}
                        </div>
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
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    {!isReadOnly && (
                      <button type="button" onClick={() => attachRef.current?.click()} className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-600 font-medium">
                        <Paperclip size={12} /> Add Files
                      </button>
                    )}
                    {form.attachmentFileNames?.length > 0 ? (
                      <ul className="mt-2 space-y-1">
                        {form.attachmentFileNames.map((name, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Paperclip size={11} className="text-gray-400 shrink-0" /><span className="truncate">{name}</span>
                            {!isReadOnly && <button type="button" onClick={() => setField("attachmentFileNames", form.attachmentFileNames.filter((_, j) => j !== i))} className="ml-auto text-red-400 hover:text-red-600 shrink-0"><X size={11} /></button>}
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

            <div className="flex items-center gap-2">
              <input type="checkbox" id="isDeactivated" checked={!!form.isDeactivated} onChange={e => setField("isDeactivated", e.target.checked)} disabled={isReadOnly} className="rounded border-gray-300 text-brand-600 focus:ring-brand-600" />
              <label htmlFor="isDeactivated" className="text-xs text-gray-600 select-none cursor-pointer">Deactivate (hides from new transaction entry)</label>
            </div>
          </div>

          {/* Footer actions */}
          {(mode === "new" || mode === "edit") && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/60 flex items-center gap-2.5">
              <button onClick={handleSave} className="flex items-center gap-2 text-sm px-6 py-2.5 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white rounded-xl font-semibold shadow-md shadow-brand-200 transition-all"><Save size={15} /> Save Product</button>
              <button onClick={handleDiscard} className="flex items-center gap-2 text-sm px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-semibold transition-colors"><X size={15} /> Discard</button>
            </div>
          )}
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={15} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-700 mb-1">Please correct the highlighted fields.</p>
              <div className="text-xs text-red-600 space-y-0.5">{Object.values(errors).map((e, i) => <p key={i}>• {e}</p>)}</div>
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



