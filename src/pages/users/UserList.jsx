import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Plus,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";

const users = [
  {
    id: "U001",
    code: "U001",
    userName: "Amit Sharma",
    employee: "Mukund",
    mobile: "9876543210",
    email: "amit.sharma@example.com",
    userRole: "Admin",
    department: "IT",
    status: "Active",
  },
  {
    id: "U002",
    code: "U002",
    userName: "Nisha Patel",
    employee: "Nisha Patel",
    mobile: "9123456780",
    email: "nisha.patel@example.com",
    userRole: "User",
    department: "Sales",
    status: "Active",
  },
  {
    id: "U003",
    code: "U003",
    userName: "Rahul Verma",
    employee: "Rahul Verma",
    mobile: "9988776655",
    email: "rahul.verma@example.com",
    userRole: "Manager",
    department: "Accounts",
    status: "Inactive",
  },
  {
    id: "U004",
    code: "U004",
    userName: "Priya Singh",
    employee: "Priya Singh",
    mobile: "9012345678",
    email: "priya.singh@example.com",
    userRole: "User",
    department: "HR",
    status: "Active",
  },
];

export default function UserList() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    return (
      user.code.toLowerCase().includes(term) ||
      user.userName.toLowerCase().includes(term) ||
      user.employee.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.department.toLowerCase().includes(term)
    );
  });

  return (
    <Layout title="User Master">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex flex-col gap-3 md:flex-row md:items-center">
            <h2 className="text-lg font-semibold text-gray-900">User Master</h2>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search by name, code, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-between md:justify-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-sm rounded-md border flex items-center gap-1 ${
                  viewMode === "list"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                <List size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-2 text-sm rounded-md border flex items-center gap-1 ${
                  viewMode === "kanban"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                <LayoutGrid size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate("/users/new")}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-1"
            >
              <Plus size={16} /> New User
            </button>
          </div>
        </div>

        {viewMode === "list" ? (
          <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3">
                    <input type="checkbox" className="w-4 h-4" />
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Code
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    User Name
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Employee
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Mobile
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Email
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    User Role
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Department
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4" />
                    </td>
                    <td className="px-4 py-3 text-gray-900">{user.code}</td>
                    <td className="px-4 py-3 text-gray-900">{user.userName}</td>
                    <td className="px-4 py-3 text-gray-700">{user.employee}</td>
                    <td className="px-4 py-3 text-gray-700">{user.mobile}</td>
                    <td className="px-4 py-3 text-gray-700">{user.email}</td>
                    <td className="px-4 py-3 text-gray-700">{user.userRole}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {user.department}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          user.status === "Active"
                            ? "bg-gray-300 text-gray-900"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/users/${user.id}`}
                        className="text-gray-900 hover:text-gray-700 font-medium flex items-center gap-1"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="border border-gray-300 rounded-lg bg-white p-4 hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {user.userName}
                    </p>
                    <p className="text-xs text-gray-600">{user.department}</p>
                  </div>
                  <span className="text-xs text-gray-700">{user.code}</span>
                </div>
                <p className="text-xs text-gray-700">
                  Employee: {user.employee}
                </p>
                <p className="text-xs text-gray-700">Mobile: {user.mobile}</p>
                <p className="text-xs text-gray-700">Email: {user.email}</p>
                <p className="text-xs text-gray-700">Role: {user.userRole}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs inline-flex px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                    {user.status}
                  </span>
                  <Link
                    to={`/users/${user.id}`}
                    className="text-sm text-gray-900 hover:text-gray-700 font-medium"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-gray-700">
          <div>
            Showing 1–{filteredUsers.length} of {users.length}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
