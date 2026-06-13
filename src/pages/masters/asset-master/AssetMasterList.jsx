import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../../lib/api.js";

const STATUS_BADGE = {
  Active:              "bg-green-50 text-green-600 border-green-200",
  "Under Maintenance": "bg-amber-50 text-amber-600 border-amber-200",
  Decommissioned:      "bg-red-50 text-red-600 border-red-200",
};

export default function AssetMasterList() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    api.get("/api/assets")
      .then(setRecords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const assetTypes = [...new Set(records.map((r) => r.assetTypeName).filter(Boolean))].sort();

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.assetId?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.assetTypeName?.toLowerCase().includes(q) ||
      r.locationName?.toLowerCase().includes(q) ||
      r.manufacturer?.toLowerCase().includes(q) ||
      r.serialNo?.toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    const matchType = filterType === "all" || r.assetTypeName === filterType;
    return matchSearch && matchStatus && matchType;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete asset "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/assets/${id}`);
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
              <span className="text-gray-600 font-medium">Asset Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Asset Master</h1>
          </div>
          <button
            onClick={() => navigate("/masters/asset-master/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New Asset
          </button>
        </div>

        {/* Filter bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Asset ID, Name, Type, Location, Serial No..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Decommissioned">Decommissioned</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">All Types</option>
            {assetTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {records.length} record(s)
          </span>
        </div>

        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading...</p>}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asset ID</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asset Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Asset Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Manufacturer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                      {records.length === 0
                        ? 'No assets yet. Click "Add New Asset" to get started.'
                        : "No records match your search."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((r, i) => (
                    <tr
                      key={r.id}
                      className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                      onClick={() => navigate(`/masters/asset-master/${r.id}`)}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600">{r.assetId}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{r.name}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.assetTypeName || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.locationName || r.locationId || "—"}</td>
                      <td className="px-4 py-2.5 text-gray-600">{r.manufacturer || "—"}</td>
                      <td className="px-4 py-2.5">
                        {r.status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_BADGE[r.status] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {r.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/masters/asset-master/${r.id}`)}
                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.name)}
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
