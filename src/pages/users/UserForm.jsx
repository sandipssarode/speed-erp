import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { api } from "../../lib/api.js";

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [form, setForm] = useState({
    code: "", name: "", mobile: "", department: "", fixLoginPC: "",
    password: "", confirmPassword: "", email: "", displayName: "",
    emailPassword: "", smtpServer: "", smtpPort: "587", smtpSSL: false,
    ccEmails: "", outlookEmail: false, role: "User", isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isNew) {
      api.get(`/api/users/${id}`)
        .then((u) => setForm({ ...u, password: "", confirmPassword: "" }))
        .catch(() => navigate("/system/users"))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  const handleSave = async () => {
    const e = {};
    if (!form.code.trim()) e.code = "Code is required.";
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    if (isNew && !form.password) e.password = "Password is required.";
    if (form.password && form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const userName = loggedInUser.name || "System";
      const payload = {
        ...form,
        id: isNew ? Date.now().toString() : id,
        createdAt: isNew ? now : form.createdAt || now,
        updatedAt: now,
        createdBy: isNew ? userName : (form.createdBy || userName),
        updatedBy: userName,
      };
      delete payload.confirmPassword;

      if (isNew) {
        await api.post("/api/users", payload);
        navigate("/system/users");
      } else {
        await api.put(`/api/users/${id}`, payload);
        navigate("/system/users");
      }
    } catch (err) {
      setErrors({ save: err.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="text-center py-16 text-gray-400">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{isNew ? "New User" : "User Master"}</h1>
            <p className="mt-1 text-sm text-gray-600">Complete the required user details below.</p>
          </div>
          <div className="text-sm font-medium text-gray-700">Mode: {isNew ? "New" : "Edit"}</div>
        </div>

        {errors.save && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{errors.save}</p>}

        <div className="rounded border border-gray-300 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700">Code *</label>
                <input type="text" value={form.code} readOnly={!isNew}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. U001"
                  className={`w-full rounded border px-3 py-2 text-sm text-gray-900 ${!isNew ? "bg-gray-100 border-gray-200" : "bg-white border-gray-300"}`} />
                {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 pb-2">
                <input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded border-gray-400" />
                Active
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@speedinnovations.in"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mobile No</label>
              <input type="text" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit mobile"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                <option value="">Select Department</option>
                <option>Purchase</option><option>Sales</option><option>Accounts</option>
                <option>Admin</option><option>HR</option><option>IT</option><option>Operations</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fix Login PC Name</label>
              <input type="text" value={form.fixLoginPC} onChange={(e) => setForm({ ...form, fixLoginPC: e.target.value })} placeholder="e.g. DESKTOP-ERP01"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{isNew ? "Password *" : "New Password"}</label>
              <input type={showPassword ? "text" : "password"} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={isNew ? "Enter password" : "Leave blank to keep current"}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input type={showPassword ? "text" : "password"} value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Confirm password"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>

            <div className="flex items-center gap-3 mt-1">
              <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} className="h-4 w-4 rounded border-gray-400" />
              <label className="text-sm text-gray-600">Show Password</label>
            </div>
          </div>
        </div>

        <div className="rounded border border-gray-300 bg-white p-5">
          <div className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700">Email Configuration</div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Display name for emails"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">SMTP Server</label>
              <input type="text" value={form.smtpServer} onChange={(e) => setForm({ ...form, smtpServer: e.target.value })} placeholder="smtp.example.com"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Port</label>
              <input type="text" value={form.smtpPort} onChange={(e) => setForm({ ...form, smtpPort: e.target.value })} placeholder="587"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">CC Email Addresses</label>
              <input type="text" value={form.ccEmails} onChange={(e) => setForm({ ...form, ccEmails: e.target.value })} placeholder="a@x.com|b@y.com"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900" />
              <p className="text-xs text-gray-500">Use | for multiple CC addresses</p>
            </div>
            <div className="flex flex-col gap-2 justify-end">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.smtpSSL} onChange={(e) => setForm({ ...form, smtpSSL: e.target.checked })} className="h-4 w-4" />
                SSL Enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" checked={form.outlookEmail} onChange={(e) => setForm({ ...form, outlookEmail: e.target.checked })} className="h-4 w-4" />
                Using Outlook
              </label>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 rounded border-t border-gray-200 bg-white py-4">
          <div className="flex gap-2">
            <button type="button" onClick={handleSave} disabled={saving}
              className="rounded border border-gray-300 bg-gray-900 text-white px-4 py-2 text-sm transition hover:bg-gray-800 disabled:opacity-60">
              {saving ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => navigate("/system/users")}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}



