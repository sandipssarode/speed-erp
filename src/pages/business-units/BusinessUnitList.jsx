import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../lib/api.js";

export default function BusinessUnitList() {
  const navigate = useNavigate();
  const [units, setUnits]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterState, setFilterState]   = useState("all");

  useEffect(() => {
    api.get("/api/business-units")
      .then(setUnits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allStates = [...new Set(units.map(u => u.state).filter(Boolean))].sort();

  const filtered = units.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.locationCode?.toLowerCase().includes(q) ||
      u.contactName?.toLowerCase().includes(q) ||
      u.contactNumber?.toLowerCase().includes(q) ||
      u.state?.toLowerCase().includes(q) ||
      u.city?.toLowerCase().includes(q) ||
      u.gstNumber?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active"   && u.isActive !== false) ||
      (filterStatus === "inactive" && u.isActive === false);
    const matchState = filterState === "all" || u.state === filterState;
    return matchSearch && matchStatus && matchState;
  });

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete business unit "${code}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/business-units/${id}`);
      setUnits(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert("Failed to delete business unit: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">

        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <span>System Setup</span>
              <ChevronRight size={12} />
              <span className="text-gray-600 font-medium">Business Unit Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Business Unit Master</h1>
          </div>
          <button
            onClick={() => navigate("/system/business-units/new")}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> New
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Contact, State, City, GST..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All States</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {units.length} record(s)
          </span>
        </div>

        {/* Table */}
        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading business units...</p>}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">BU Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">GST Number</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                      {units.length === 0
                        ? 'No business units yet. Click "New" to get started.'
                        : "No business units match your search."}
                    </td>
                  </tr>
                ) : filtered.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    onClick={() => navigate(`/system/business-units/${u.id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-600">{u.locationCode}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{u.contactName || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{u.contactNumber || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{u.state || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{u.city || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{u.enableGst && u.gstNumber ? u.gstNumber : "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        u.isActive !== false
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/system/business-units/${u.id}`)}
                          className="p-1.5 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(u.id, u.locationCode)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right px-1">
            Showing {filtered.length} business unit(s)
          </p>
        )}

      </div>
    </Layout>
  );
}
