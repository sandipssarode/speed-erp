import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../../lib/api.js";

export default function AssetStructureList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/api/asset-structures")
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.locationId?.toLowerCase().includes(q) ||
      r.locationName?.toLowerCase().includes(q) ||
      r.site?.toLowerCase().includes(q) ||
      r.warehouseName?.toLowerCase().includes(q)
    );
  });

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete asset structure "${label}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/asset-structures/${id}`);
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
              <span className="text-gray-600 font-medium">Asset Structure</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Asset Structure</h1>
          </div>
          <button
            onClick={() => navigate("/masters/asset-structure/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm"
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
              placeholder="Search Location ID, Name, Site, Warehouse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {records.length} record(s)
          </span>
        </div>

        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading...</p>}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Site</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Warehouse</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                      {records.length === 0
                        ? 'No asset structures yet. Click "Add New" to get started.'
                        : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                      onClick={() => navigate(`/masters/asset-structure/${r.id}`)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600">{r.locationId || "—"}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{r.locationName || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.site || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.warehouseName || "—"}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/masters/asset-structure/${r.id}`)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.locationName || r.locationId)}
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
