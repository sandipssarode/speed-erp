import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../../lib/api.js";

export default function DistrictList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");

  useEffect(() => {
    api.get("/api/districts")
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const states = [...new Set(records.map((r) => r.state).filter(Boolean))].sort();

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.districtCode?.toLowerCase().includes(q) ||
      r.districtName?.toLowerCase().includes(q) ||
      r.state?.toLowerCase().includes(q) ||
      r.districtHQ?.toLowerCase().includes(q);
    const matchState = filterState === "all" || r.state === filterState;
    return matchSearch && matchState;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete district "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/districts/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <span>Masters</span>
              <ChevronRight size={12} />
              <span className="text-gray-600 font-medium">District Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">District Master</h1>
          </div>
          <button
            onClick={() => navigate("/masters/district/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Name, State, HQ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {records.length} record(s)
          </span>
        </div>

        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading...</p>}

        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">District Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">District Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Headquarters</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                      {records.length === 0
                        ? 'No districts yet. Click "Add New" to get started.'
                        : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                      onClick={() => navigate(`/masters/district/${r.id}`)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600">{r.districtCode}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{r.districtName}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.state || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.districtHQ || "—"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/masters/district/${r.id}`)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.districtName)}
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
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right px-1">
            Showing {filtered.length} record(s)
          </p>
        )}
      </div>
    </Layout>
  );
}
