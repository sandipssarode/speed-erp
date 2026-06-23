import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { api } from "../../../lib/api.js";

const PAGE_SIZE = 25;

export default function CountryList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/api/countries")
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search]);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.countryCode?.toLowerCase().includes(q) ||
      r.countryName?.toLowerCase().includes(q) ||
      r.dialCode?.toLowerCase().includes(q) ||
      r.currency?.toLowerCase().includes(q)
    );
  });

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete country "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/countries/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-lg font-semibold text-gray-800">Country Master</h1>
          <button
            onClick={() => navigate("/system/countries/new")}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Name, Dial Code, Currency..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {records.length} record(s)
          </span>
        </div>

        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading...</p>}

        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="bg-brand-600">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">Country Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">Country Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">Dial Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">Currency</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                      {records.length === 0
                        ? 'No countries yet. Click "Add New" to get started.'
                        : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-200 hover:bg-brand-50/40 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/50" : ""}`}
                      onClick={() => navigate(`/system/countries/${r.id}`)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-600">{r.countryCode}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{r.countryName}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.dialCode || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.currency || "—"}</td>
                      <td className="px-4 py-2.5">
                        {r.isDeactivated
                          ? <span className="px-2 py-0.5 rounded text-xs bg-red-50 text-red-500 border border-red-100">Inactive</span>
                          : <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600 border border-green-100">Active</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/system/countries/${r.id}`)}
                            className="p-1.5 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.countryName)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && (
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs">
              <span className="text-gray-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} records
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="px-2.5 py-1 border border-gray-300 rounded text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                  ‹ Prev
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-2.5 py-1 border rounded ${p === page ? "bg-brand-600 text-white border-brand-600" : "border-gray-300 text-gray-600 hover:bg-white"}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page === pageCount}
                  className="px-2.5 py-1 border border-gray-300 rounded text-gray-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed">
                  Next ›
                </button>
              </div>
            </div>
          )}
        </div>

        {pageCount <= 1 && filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right px-1">Showing {filtered.length} record(s)</p>
        )}
      </div>
    </Layout>
  );
}
