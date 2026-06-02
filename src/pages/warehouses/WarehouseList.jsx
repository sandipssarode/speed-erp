import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, List, LayoutGrid, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { api } from "../../lib/api.js";

export default function WarehouseList() {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterState, setFilterState] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  useEffect(() => {
    api.get("/api/warehouses")
      .then(setWarehouses)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allStates   = [...new Set(warehouses.map(w => w.state).filter(Boolean))].sort();
  const allCompanies = [...new Set(warehouses.map(w => w.companyName).filter(Boolean))].sort();

  const filtered = warehouses.filter((w) => {
    const t = searchTerm.toLowerCase();
    const matchText = !t ||
      w.warehouseName?.toLowerCase().includes(t) ||
      w.warehouseCode?.toLowerCase().includes(t) ||
      w.companyName?.toLowerCase().includes(t) ||
      w.city?.toLowerCase().includes(t) ||
      w.accessibleBranch?.toLowerCase().includes(t);
    const matchState   = !filterState   || w.state === filterState;
    const matchCompany = !filterCompany || w.companyName === filterCompany;
    return matchText && matchState && matchCompany;
  });

  return (
    <Layout>
      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Warehouse Master</h2>
            <p className="text-xs text-gray-500 mt-0.5">System Setup › Warehouse Master</p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm rounded-md border ${viewMode === "list" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-2 text-sm rounded-md border ${viewMode === "kanban" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-700 hover:bg-gray-100"}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
            <button
              onClick={() => navigate("/system/warehouses/new")}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-1.5"
            >
              <Plus size={15} /> New Warehouse
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search by name, code, company, city, branch..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[220px] px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">All States</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterCompany}
            onChange={e => setFilterCompany(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">All Companies</option>
            {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading warehouses...</div>
        ) : viewMode === "list" ? (
          <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Warehouse Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Company</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">State</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">City</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Contact Number</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      {warehouses.length === 0 ? "No warehouses yet. Click New Warehouse to get started." : "No warehouses match your search."}
                    </td>
                  </tr>
                ) : filtered.map(w => (
                  <tr key={w.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{w.warehouseName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{w.warehouseCode || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{w.companyName}</td>
                    <td className="px-4 py-3 text-gray-700">{w.state}</td>
                    <td className="px-4 py-3 text-gray-700">{w.city || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{w.contactNumber}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium ${w.isActive !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {w.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/system/warehouses/${w.id}`} className="text-gray-700 hover:text-gray-900">
                        <Edit size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <p className="text-gray-400 text-sm col-span-full text-center py-12">No warehouses match your search.</p>
            ) : filtered.map(w => (
              <div key={w.id} className="border border-gray-300 rounded-lg bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{w.warehouseName}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{w.companyName}</p>
                  </div>
                  <span className="font-mono text-xs text-blue-600 font-semibold shrink-0">{w.warehouseCode || "—"}</span>
                </div>
                <div className="space-y-0.5 text-xs text-gray-600">
                  <p>State: {w.state || "—"}</p>
                  <p>City: {w.city || "—"}</p>
                  <p>Contact: {w.contactNumber || "—"}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs inline-flex px-2 py-0.5 rounded-full font-medium ${w.isActive !== false ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                    {w.isActive !== false ? "Active" : "Inactive"}
                  </span>
                  <Link to={`/system/warehouses/${w.id}`} className="text-sm text-gray-700 hover:text-gray-900 flex items-center gap-1">
                    <Edit size={13} /> Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {filtered.length} of {warehouses.length} warehouse{warehouses.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100"><ChevronLeft size={15} /></button>
            <button className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100"><ChevronRight size={15} /></button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
