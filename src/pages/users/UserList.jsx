import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, List, LayoutGrid, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { api } from "../../lib/api.js";

export default function UserList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    api.get("/api/users")
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    const t = searchTerm.toLowerCase();
    return !t || u.name?.toLowerCase().includes(t) || u.code?.toLowerCase().includes(t) ||
      u.email?.toLowerCase().includes(t) || u.department?.toLowerCase().includes(t);
  });

  return (
    <Layout title="User Master">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex flex-col gap-3 md:flex-row md:items-center">
            <h2 className="text-lg font-semibold text-gray-900">User Master</h2>
            <input type="text" placeholder="Search by name, code, email..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300" />
          </div>
          <div className="flex items-center gap-2 justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-sm rounded-md border flex items-center gap-1 ${viewMode === "list" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-900 hover:bg-gray-100"}`}><List size={16} /></button>
              <button onClick={() => setViewMode("kanban")} className={`px-3 py-2 text-sm rounded-md border flex items-center gap-1 ${viewMode === "kanban" ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-900 hover:bg-gray-100"}`}><LayoutGrid size={16} /></button>
            </div>
            <button onClick={() => navigate("/system/users/new")}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-1">
              <Plus size={16} /> New User
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-sm">Loading users...</div>
        ) : viewMode === "list" ? (
          <div className="border border-gray-300 rounded-lg bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 font-semibold text-gray-900">Code</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Mobile</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Role</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Department</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No users found.</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-brand-600 font-semibold">{u.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-700">{u.mobile}</td>
                    <td className="px-4 py-3 text-gray-700">{u.email}</td>
                    <td className="px-4 py-3 text-gray-700">{u.role}</td>
                    <td className="px-4 py-3 text-gray-700">{u.department}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${u.isActive !== false ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                        {u.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/system/users/${u.id}`} className="text-gray-900 hover:text-gray-700 font-medium flex items-center gap-1"><Edit size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <div key={u.id} className="border border-gray-300 rounded-lg bg-white p-4 hover:shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{u.name}</p>
                    <p className="text-xs text-gray-600">{u.department}</p>
                  </div>
                  <span className="text-xs text-gray-700">{u.code}</span>
                </div>
                <p className="text-xs text-gray-700">Mobile: {u.mobile}</p>
                <p className="text-xs text-gray-700">Email: {u.email}</p>
                <p className="text-xs text-gray-700">Role: {u.role}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`text-xs inline-flex px-2 py-1 rounded-full ${u.isActive !== false ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {u.isActive !== false ? "Active" : "Inactive"}
                  </span>
                  <Link to={`/system/users/${u.id}`} className="text-sm text-gray-900 hover:text-gray-700 font-medium">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>Showing {filtered.length} of {users.length}</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"><ChevronLeft size={16} /></button>
            <button className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}



