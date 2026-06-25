import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { api } from "../../../lib/api.js";

const PAGE_SIZE = 15;

export default function CountryList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/api/countries").then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.countryCode?.toLowerCase().includes(q) || r.countryName?.toLowerCase().includes(q) || r.dialCode?.toLowerCase().includes(q) || r.currency?.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? !r.isDeactivated : r.isDeactivated);
    return matchSearch && matchStatus;
  });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete country "${name}"? This cannot be undone.`)) return;
    try { await api.del(`/api/countries/${id}`); setRecords(prev => prev.filter(r => r.id !== id)); }
    catch (err) { alert("Failed to delete: " + err.message); }
  };

  const th = "text-left px-4 py-3 text-[11px] font-semibold text-white/90 uppercase tracking-wider";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Country Master</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage countries, dial codes &amp; currencies · {records.length} record{records.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 pl-9 pr-8 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-colors"
              />
              {search && <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>}
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-300 rounded-md px-2.5 py-2 text-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button onClick={() => navigate("/system/countries/new")} className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-8 py-2.5 rounded-md shadow-sm transition-colors">
              <Plus size={15} /> New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-gradient-to-r from-brand-800 to-brand-600">
                  <th className={`${th} pl-5`}>Name</th>
                  <th className={th}>Code</th>
                  <th className={th}>Dial Code</th>
                  <th className={th}>Currency</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Loading…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">{records.length === 0 ? 'No countries yet. Click "New" to add one.' : "No records match your search."}</td></tr>
                ) : paginated.map((r) => {
                  return (
                    <tr key={r.id} className="group border-b border-gray-100 last:border-0 cursor-pointer transition-colors hover:bg-gray-50" onClick={() => navigate(`/system/countries/${r.id}`)}>
                      <td className="px-4 py-3 pl-5"><span className="font-medium text-brand-600 hover:underline">{r.countryName}</span></td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.countryCode}</td>
                      <td className="px-4 py-3 text-gray-600">{r.dialCode || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{r.currency || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-600">
                          <span className={`w-1.5 h-1.5 rounded-full ${r.isDeactivated ? "bg-red-400" : "bg-green-500"}`} />
                          {r.isDeactivated ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-0.5 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => navigate(`/system/countries/${r.id}`)} className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded" title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(r.id, r.countryName)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 text-xs">
              <span className="text-gray-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={14} /></button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 rounded text-xs font-medium ${p === page ? "bg-brand-600 text-white" : "border border-gray-200 text-gray-500 hover:bg-gray-50"}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === pageCount} className="w-7 h-7 flex items-center justify-center border border-gray-200 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
