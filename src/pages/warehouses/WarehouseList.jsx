import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../lib/api.js";

export default function WarehouseList() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus]   = useState("all");
  const [filterState, setFilterState]     = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");

  useEffect(() => {
    api.get("/api/warehouses")
      .then(setWarehouses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allStates    = [...new Set(warehouses.map(w => w.state).filter(Boolean))].sort();
  const allCompanies = [...new Set(warehouses.map(w => w.companyName).filter(Boolean))].sort();

  const filtered = warehouses.filter((w) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      w.warehouseName?.toLowerCase().includes(q) ||
      w.warehouseCode?.toLowerCase().includes(q) ||
      w.companyName?.toLowerCase().includes(q) ||
      w.city?.toLowerCase().includes(q) ||
      w.contactNumber?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active"   && w.isActive !== false) ||
      (filterStatus === "inactive" && w.isActive === false);
    const matchState   = filterState   === "all" || w.state       === filterState;
    const matchCompany = filterCompany === "all" || w.companyName === filterCompany;
    return matchSearch && matchStatus && matchState && matchCompany;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete warehouse "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/warehouses/${id}`);
      setWarehouses(prev => prev.filter(w => w.id !== id));
    } catch (err) {
      alert("Failed to delete warehouse: " + err.message);
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
              <span className="text-gray-600 font-medium">Warehouse Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Warehouse Master</h1>
          </div>
          <button
            onClick={() => navigate("/system/warehouses/new")}
            className="flex items-center gap-2 bg-violet-700 hover:bg-violet-800 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New Warehouse
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Name, Code, Company, City..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="all">All States</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="all">All Companies</option>
            {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {warehouses.length} record(s)
          </span>
        </div>

        {/* Table */}
        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading warehouses...</p>}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[750px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Warehouse Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Number</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                      {warehouses.length === 0
                        ? 'No warehouses yet. Click "Add New Warehouse" to get started.'
                        : "No warehouses match your search."}
                    </td>
                  </tr>
                ) : filtered.map((w, i) => (
                  <tr
                    key={w.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    onClick={() => navigate(`/system/warehouses/${w.id}`)}
                  >
                    <td className="px-4 py-2.5 font-medium text-gray-800">{w.warehouseName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-violet-600">{w.warehouseCode || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{w.companyName || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{w.state || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{w.city || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{w.contactNumber || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        w.isActive !== false
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-red-50 text-red-600 border-red-200"
                      }`}>
                        {w.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/system/warehouses/${w.id}`)}
                          className="p-1.5 text-violet-500 hover:text-violet-700 hover:bg-violet-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id, w.warehouseName)}
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
            Showing {filtered.length} warehouse(s)
          </p>
        )}

      </div>
    </Layout>
  );
}
