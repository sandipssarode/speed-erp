import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../../lib/api.js";

const PRIORITY_BADGE = {
  Critical: "bg-red-50 text-red-600 border-red-200",
  High:     "bg-orange-50 text-orange-600 border-orange-200",
  Medium:   "bg-amber-50 text-amber-600 border-amber-200",
  Low:      "bg-green-50 text-green-600 border-green-200",
};

export default function MaintenanceTypeList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    api.get("/api/maintenance-types")
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.typeId?.toLowerCase().includes(q) ||
      r.maintenanceName?.toLowerCase().includes(q) ||
      r.priority?.toLowerCase().includes(q);
    const matchPriority = filterPriority === "all" || r.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete maintenance type "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/maintenance-types/${id}`);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <span>Masters</span>
              <ChevronRight size={12} />
              <span className="text-gray-600 font-medium">Maintenance Type</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Maintenance Type</h1>
          </div>
          <button
            onClick={() => navigate("/masters/maintenance-type/new")}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Type ID, Name, Priority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {records.length} record(s)
          </span>
        </div>

        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading...</p>}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Maintenance Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration (hrs)</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                      {records.length === 0
                        ? 'No maintenance types yet. Click "Add New" to get started.'
                        : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                      onClick={() => navigate(`/masters/maintenance-type/${r.id}`)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-600">{r.typeId}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{r.maintenanceName}</td>
                      <td className="px-4 py-2.5">
                        {r.priority && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_BADGE[r.priority] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {r.priority}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-gray-600">{r.duration != null ? `${r.duration} hrs` : "—"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/masters/maintenance-type/${r.id}`)}
                            className="p-1.5 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.maintenanceName)}
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
