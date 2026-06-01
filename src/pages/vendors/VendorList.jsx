import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";
import { api } from "../../lib/api.js";

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");

  useEffect(() => {
    api.get("/api/vendors")
      .then(setVendors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const groups = [...new Set(vendors.map((v) => v.group).filter(Boolean))];

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.code?.toLowerCase().includes(q) ||
      v.name?.toLowerCase().includes(q) ||
      v.group?.toLowerCase().includes(q) ||
      v.gstRegistrationNo?.toLowerCase().includes(q) ||
      v.corporateCity?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !v.isDeactivated) ||
      (filterStatus === "inactive" && v.isDeactivated);
    const matchGroup = filterGroup === "all" || v.group === filterGroup;
    return matchSearch && matchStatus && matchGroup;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/vendors/${id}`);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Failed to delete vendor: " + err.message);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <span>Purchase</span>
              <ChevronRight size={12} />
              <span>Master</span>
              <ChevronRight size={12} />
              <span className="text-gray-600 font-medium">Vendor Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Vendor Master</h1>
          </div>
          <button
            onClick={() => navigate("/vendors/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New Vendor
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Name, Group, GST No, City..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">All Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {vendors.length} record(s)
          </span>
        </div>

        {/* Table */}
        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading vendors...</p>}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Group</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">GST No</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                    {vendors.length === 0
                      ? 'No vendors yet. Click "Add New Vendor" to get started.'
                      : "No vendors match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    onClick={() => navigate(`/vendors/${v.id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600">{v.code}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      {v.name}
                      {v.isManufacturer && <span className="ml-1.5 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">Mfg</span>}
                      {v.isServiceJobwork && <span className="ml-1.5 text-xs bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">SVC</span>}
                      {v.isAgentDealer && <span className="ml-1.5 text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Agent</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{v.group || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{v.corporateCity || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{v.gstRegistrationNo || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{v.currency || "INR"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        v.isDeactivated
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}>
                        {v.isDeactivated ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/vendors/${v.id}`)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
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
            Showing {filtered.length} vendor(s)
          </p>
        )}
      </div>
    </Layout>
  );
}
