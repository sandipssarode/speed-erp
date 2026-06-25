import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2, Globe, Phone, Coins, ChevronLeft, ChevronRight, X } from "lucide-react";
import { api } from "../../../lib/api.js";

const PAGE_SIZE = 12;

export default function CountryList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/api/countries").then(setRecords).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const activeCount = records.filter(r => !r.isDeactivated).length;
  const inactiveCount = records.length - activeCount;

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

  const Stat = ({ label, value, dot }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15">
      {dot && <span className={`w-2 h-2 rounded-full ${dot}`} />}
      <span className="text-lg font-bold leading-none">{value}</span>
      <span className="text-[11px] text-white/70 uppercase tracking-wide">{label}</span>
    </div>
  );

  const FilterTab = ({ id, label, count }) => (
    <button
      onClick={() => setStatusFilter(id)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        statusFilter === id ? "bg-brand-600 text-white shadow-sm" : "text-gray-500 hover:bg-brand-50 hover:text-brand-600"
      }`}
    >
      {label} <span className={statusFilter === id ? "text-white/70" : "text-gray-400"}>· {count}</span>
    </button>
  );

  return (
    <Layout>
      <div className="space-y-4 max-w-6xl mx-auto">

        {/* ── Hero header ── */}
        <div className="rounded-2xl bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white shadow-lg shadow-brand-200 p-5 flex items-center gap-4 flex-wrap">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Globe size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">Country Master</h1>
            <p className="text-xs text-white/75 mt-0.5">Manage countries, dial codes & currencies</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <Stat label="Total" value={records.length} />
            <Stat label="Active" value={activeCount} dot="bg-green-300" />
            <Stat label="Inactive" value={inactiveCount} dot="bg-red-300" />
          </div>
          <button
            onClick={() => navigate("/system/countries/new")}
            className="ml-auto flex items-center gap-2 bg-white text-brand-700 hover:bg-brand-50 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            <Plus size={16} /> Add Country
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search code, name, dial code, currency…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-brand-50/60 border border-brand-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-brand-50/60 rounded-xl p-1">
            <FilterTab id="all" label="All" count={records.length} />
            <FilterTab id="active" label="Active" count={activeCount} />
            <FilterTab id="inactive" label="Inactive" count={inactiveCount} />
          </div>
          <span className="ml-auto text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="bg-brand-50 border-b border-brand-100">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Country</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Dial Code</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Currency</th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-3 text-[11px] font-bold text-brand-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">Loading countries…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <Globe size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 text-sm">{records.length === 0 ? "No countries yet." : "No records match your filters."}</p>
                      {records.length === 0 && (
                        <button onClick={() => navigate("/system/countries/new")} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:underline"><Plus size={13} /> Add your first country</button>
                      )}
                    </td>
                  </tr>
                ) : paginated.map((r) => (
                  <tr
                    key={r.id}
                    className="group border-b border-gray-50 last:border-0 hover:bg-brand-50/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/system/countries/${r.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {(r.countryCode || "?").slice(0, 2).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 leading-tight truncate">{r.countryName}</p>
                          <p className="text-[11px] font-mono text-gray-400">{r.countryCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-flex items-center gap-1.5"><Phone size={12} className="text-gray-300" />{r.dialCode || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="inline-flex items-center gap-1.5"><Coins size={12} className="text-gray-300" />{r.currency || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${r.isDeactivated ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${r.isDeactivated ? "bg-red-500" : "bg-green-500"}`} />
                        {r.isDeactivated ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => navigate(`/system/countries/${r.id}`)} className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Edit"><Edit2 size={14} /></button>
                        <button onClick={() => handleDelete(r.id, r.countryName)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs">
              <span className="text-gray-500">Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="w-8 h-8 flex items-center justify-center border border-brand-100 rounded-lg text-gray-500 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={15} /></button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? "bg-brand-600 text-white shadow-sm" : "border border-brand-100 text-gray-500 hover:bg-brand-50"}`}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === pageCount} className="w-8 h-8 flex items-center justify-center border border-brand-100 rounded-lg text-gray-500 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={15} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
