import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  ChevronsUpDown,
} from "lucide-react";
import { api } from "../../lib/api.js";

const PAGE_SIZE = 12;

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/api/vendors")
      .then(setVendors)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, filterStatus, filterGroup]);

  const groups = [...new Set(vendors.map((v) => v.group).filter(Boolean))];

  const filtered = vendors
    .filter((v) => {
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
    })
    .sort((a, b) => {
      const r = (a.name || "").localeCompare(b.name || "");
      return sortDir === "asc" ? r : -r;
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/vendors/${id}`);
      setVendors((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      alert("Failed to delete vendor: " + err.message);
    }
  };

  const th =
    "text-left px-5 py-3.5 text-[11px] font-bold text-white/90 uppercase tracking-wider";
  const actionBtn =
    "w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 transition-colors";

  return (
    <Layout>
      <div className="w-full space-y-4">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Vendor Master
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage vendors, groups &amp; GST details
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search vendors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="relative min-w-[130px]">
            <SlidersHorizontal
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-10 pr-9 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronRight
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative min-w-[130px]">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer"
            >
              <option value="all">All Groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronRight
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
            />
          </div>

          <button
            onClick={() => navigate("/vendors/new")}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-200 transition-all"
          >
            <Plus size={16} /> New Vendor
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-brand-800 to-brand-600">
                  <th className={th}>
                    <button
                      onClick={() =>
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                      }
                      className="inline-flex items-center gap-1.5 hover:text-white"
                    >
                      Vendor Name <ChevronsUpDown size={13} className="opacity-70" />
                    </button>
                  </th>
                  <th className={th}>Code</th>
                  <th className={th}>Group</th>
                  <th className={th}>City</th>
                  <th className={th}>GST No</th>
                  <th className={th}>Currency</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      {vendors.length === 0
                        ? 'No vendors yet. Click "New Vendor" to add one.'
                        : "No vendors match your search."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((v) => (
                    <tr
                      key={v.id}
                      className="group border-b border-gray-100 last:border-0 hover:bg-brand-100 hover:scale-[1.01] cursor-pointer transition-all"
                      onClick={() => navigate(`/vendors/${v.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                            {v.name}
                            {v.isManufacturer && <span className="ml-1.5 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">Mfg</span>}
                            {v.isServiceJobwork && <span className="ml-1.5 text-xs bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">SVC</span>}
                            {v.isAgentDealer && <span className="ml-1.5 text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Agent</span>}
                          </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                        {v.code}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {v.group || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {v.corporateCity || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">
                        {v.gstRegistrationNo || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {v.currency || "INR"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${v.isDeactivated ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${v.isDeactivated ? "bg-red-500" : "bg-green-500"}`}
                          />
                          {v.isDeactivated ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/vendors/${v.id}`)}
                            className={`${actionBtn} hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200`}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(v.id, v.name)}
                            className={`${actionBtn} hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-sm flex-wrap gap-3">
              <span className="text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {filtered.length}
                </span>{" "}
                vendors
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-brand-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pageCount}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
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



