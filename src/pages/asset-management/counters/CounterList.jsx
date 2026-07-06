import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import {
  Plus, Search, Edit2, Trash2, ChevronLeft, ChevronRight, X,
  SlidersHorizontal, ChevronsUpDown, AlertTriangle,
} from "lucide-react";
import { api } from "../../../lib/api.js";

const PAGE_SIZE = 12;

const STATUSES = ["Active", "Inactive", "Reset"];

const STATUS_PILL = {
  Active:   "bg-green-50 text-green-700",
  Inactive: "bg-gray-100 text-gray-600",
  Reset:    "bg-amber-50 text-amber-700",
};

const STATUS_DOT = {
  Active:   "bg-green-500",
  Inactive: "bg-gray-400",
  Reset:    "bg-amber-500",
};

const thresholdReached = (r) =>
  r.thresholdValue !== "" && r.thresholdValue != null &&
  r.currentReading !== "" && r.currentReading != null &&
  Number(r.currentReading) >= Number(r.thresholdValue);

export default function CounterList() {
  const navigate = useNavigate();
  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortDir, setSortDir]           = useState("desc");
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    api.get("/api/counters")
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const filtered = records
    .filter(r => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        r.counterId?.toLowerCase().includes(q) ||
        r.counterName?.toLowerCase().includes(q) ||
        r.assetName?.toLowerCase().includes(q);
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const r = (a.counterId || "").localeCompare(b.counterId || "");
      return sortDir === "asc" ? r : -r;
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, counterId) => {
    if (!window.confirm(`Delete counter "${counterId}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/counters/${id}`);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const th = "text-left px-5 py-3.5 text-[11px] font-bold text-white/90 uppercase tracking-wider";
  const actionBtn = "w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 transition-colors";

  return (
    <Layout>
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Counters</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Record asset usage readings and trigger preventive maintenance
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Counter ID, name or asset…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>

          <div className="relative min-w-[130px]">
            <SlidersHorizontal size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="appearance-none pl-10 pr-9 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer">
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronRight size={15} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={() => navigate("/asset-management/counters/new")}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-200 transition-all"
          >
            <Plus size={16} /> New Counter
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-brand-800 to-brand-600">
                  <th className={th}>
                    <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")} className="inline-flex items-center gap-1.5 hover:text-white">
                      Counter ID <ChevronsUpDown size={13} className="opacity-70" />
                    </button>
                  </th>
                  <th className={th}>Asset</th>
                  <th className={th}>Counter Name</th>
                  <th className={th}>Type</th>
                  <th className={th}>Current Reading</th>
                  <th className={th}>Threshold</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">Loading…</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                    {records.length === 0
                      ? 'No counters yet. Click "New Counter" to get started.'
                      : "No records match your search."}
                  </td></tr>
                ) : paginated.map(r => (
                  <tr
                    key={r.id}
                    className="group border-b border-gray-100 last:border-0 hover:bg-brand-100 hover:scale-[1.01] cursor-pointer transition-all"
                    onClick={() => navigate(`/asset-management/counters/${r.id}`)}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors font-mono text-xs">
                        {r.counterId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800 leading-tight">{r.assetName || "—"}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.counterName || "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600">{r.counterType || "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-gray-800 font-medium">
                        {r.currentReading !== "" && r.currentReading != null ? r.currentReading : "—"}{r.unitLabel ? ` ${r.unitLabel}` : ""}
                      </span>
                      {thresholdReached(r) && (
                        <span title="Threshold reached" className="ml-1.5 inline-flex items-center text-amber-500"><AlertTriangle size={12} /></span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.thresholdValue !== "" && r.thresholdValue != null ? r.thresholdValue : "—"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_PILL[r.status] || "bg-gray-50 text-gray-600"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[r.status] || "bg-gray-400"}`} />
                        {r.status || "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/asset-management/counters/${r.id}`)}
                          className={`${actionBtn} hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200`}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r.id, r.counterId)}
                          className={`${actionBtn} hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-sm flex-wrap gap-3">
              <span className="text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
                counters
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                  <ChevronLeft size={15} /> Prev
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-brand-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === pageCount}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium">
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
