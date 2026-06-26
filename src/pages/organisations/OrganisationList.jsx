import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight, Building2 } from "lucide-react";
import { api } from "../../lib/api.js";

export default function OrganisationList() {
  const navigate = useNavigate();
  const [orgs, setOrgs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [filterType, setFilterType]   = useState("all");
  const [filterState, setFilterState] = useState("all");
  const [filterCurrency, setFilterCurrency] = useState("all");

  useEffect(() => {
    api.get("/api/organisations")
      .then(setOrgs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allTypes      = [...new Set(orgs.map(o => o.type).filter(Boolean))].sort();
  const allStates     = [...new Set(orgs.map(o => o.state).filter(Boolean))].sort();
  const allCurrencies = [...new Set(orgs.map(o => o.defaultCurrency).filter(Boolean))].sort();

  const filtered = orgs.filter(o => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.companyCode?.toLowerCase().includes(q) ||
      o.companyName?.toLowerCase().includes(q) ||
      o.state?.toLowerCase().includes(q) ||
      o.city?.toLowerCase().includes(q);
    const matchType     = filterType     === "all" || o.type            === filterType;
    const matchState    = filterState    === "all" || o.state           === filterState;
    const matchCurrency = filterCurrency === "all" || o.defaultCurrency === filterCurrency;
    return matchSearch && matchType && matchState && matchCurrency;
  });

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete organisation "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/organisations/${id}`);
      setOrgs(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
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
              <span className="text-gray-600 font-medium">Organisation Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Organisation Master</h1>
          </div>
          <button
            onClick={() => navigate("/system/organisations/new")}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New Organisation
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Name, State, City..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Types</option>
            {allTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All States</option>
            {allStates.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            value={filterCurrency}
            onChange={e => setFilterCurrency(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="all">All Currencies</option>
            {allCurrencies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {orgs.length} record(s)
          </span>
        </div>

        {/* Table */}
        {loading && <p className="text-center text-sm text-gray-400 py-6">Loading organisations...</p>}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Code</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">State</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Default Currency</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Time Zone</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                      {orgs.length === 0
                        ? 'No organisations yet. Click "Add New Organisation" to get started.'
                        : "No organisations match your search."}
                    </td>
                  </tr>
                ) : filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    onClick={() => navigate(`/system/organisations/${o.id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-600">{o.companyCode}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {o.companyLogo ? (
                          <img src={o.companyLogo} alt="logo" className="w-6 h-6 rounded object-contain border border-gray-200 bg-white" />
                        ) : (
                          <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center shrink-0">
                            <Building2 size={12} className="text-blue-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-800 truncate max-w-[200px]">{o.companyName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        o.type === "Head Office"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : o.type === "Branch"
                          ? "bg-brand-50 text-brand-600 border-blue-200"
                          : o.type === "Subsidiary"
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : o.type === "Division"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}>
                        {o.type || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{o.state || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{o.city || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs font-semibold text-gray-700">{o.defaultCurrency || "—"}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-500 text-xs truncate max-w-[160px]">{o.timeZone || "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/system/organisations/${o.id}`)}
                          className="p-1.5 text-brand-500 hover:text-brand-600 hover:bg-brand-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(o.id, o.companyName)}
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
            Showing {filtered.length} organisation(s)
          </p>
        )}

      </div>
    </Layout>
  );
}

