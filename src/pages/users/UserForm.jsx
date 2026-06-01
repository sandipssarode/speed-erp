import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/Layout";

const dummyUser = {
  code: "U001",
  name: "Amit Sharma",
  mobile: "9876543210",
  department: "Admin",
  fixLoginPC: "DESKTOP-ERP01",
  password: "password123",
  confirmPassword: "password123",
  emailAddress: "amit.sharma@example.com",
  displayName: "Amit S",
  emailPassword: "",
  smtpServer: "smtp.example.com",
  smtpPort: "587",
  smtpSSL: true,
  ccEmails: "a@x.com|b@y.com",
  outlookEmail: false,
};

export default function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = !id;

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    mobile: "",
    department: "",
    fixLoginPC: "",
    password: "",
    confirmPassword: "",
    emailAddress: "",
    displayName: "",
    emailPassword: "",
    smtpServer: "",
    smtpPort: "",
    smtpSSL: false,
    ccEmails: "",
    outlookEmail: false,
  });

  useEffect(() => {
    if (!isNew) {
      setForm(dummyUser);
    }
  }, [isNew]);

  const handleSave = () => {
    alert("User saved successfully!");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {isNew ? "New User" : "User Master"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Complete the required user details below.
            </p>
          </div>
          <div className="text-sm font-medium text-gray-700">
            Mode: {isNew ? "New" : "Edit"}
          </div>
        </div>

        <div className="rounded border border-gray-300 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    readOnly={!isNew}
                    placeholder="Enter code"
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-100"
                  />
                </div>

                <button
                  type="button"
                  className="inline-flex items-center rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
                >
                  Login History
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                value={form.name}
                placeholder="Enter name"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Mobile No
              </label>
              <input
                type="text"
                value={form.mobile}
                placeholder="Enter mobile number"
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              >
                <option value="">Select Department</option>
                <option value="Purchase">Purchase</option>
                <option value="Accounts">Accounts</option>
                <option value="Admin">Admin</option>
                <option value="HR">HR</option>
                <option value="IT">IT</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Fix Login PC Name
              </label>
              <input
                type="text"
                value={form.fixLoginPC}
                placeholder="e.g. DESKTOP-ERP01"
                onChange={(e) =>
                  setForm({ ...form, fixLoginPC: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                ERP Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                placeholder="Enter ERP password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                placeholder="Confirm password"
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="h-4 w-4 rounded border-gray-400 text-gray-900"
              />
              <label className="text-sm text-gray-600">Show Password</label>
            </div>
          </div>
        </div>

        <div className="rounded border border-gray-300 bg-white p-5">
          <div className="mb-4 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700">
            Email Configuration
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                value={form.emailAddress}
                placeholder="Enter email address"
                onChange={(e) =>
                  setForm({ ...form, emailAddress: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Display Name
              </label>
              <input
                type="text"
                value={form.displayName}
                placeholder="Enter display name"
                onChange={(e) =>
                  setForm({ ...form, displayName: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Email Password
              </label>
              <input
                type="password"
                value={form.emailPassword}
                placeholder="Enter email password"
                onChange={(e) =>
                  setForm({ ...form, emailPassword: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                SMTP Server
              </label>
              <input
                type="text"
                value={form.smtpServer}
                placeholder="Enter SMTP server"
                onChange={(e) =>
                  setForm({ ...form, smtpServer: e.target.value })
                }
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Port</label>
              <input
                type="text"
                value={form.smtpPort}
                placeholder="Enter port"
                onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
            </div>

            <div className="flex items-end justify-start">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.smtpSSL}
                  onChange={(e) =>
                    setForm({ ...form, smtpSSL: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-400 text-gray-900"
                />
                SSL Enabled
              </label>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">
                CC Email Address
              </label>
              <input
                type="text"
                value={form.ccEmails}
                placeholder="a@x.com|b@y.com"
                onChange={(e) => setForm({ ...form, ccEmails: e.target.value })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
              />
              <p className="text-xs text-gray-500">
                Use | for multiple CC address
              </p>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Email Preferences
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={form.outlookEmail}
                  onChange={(e) =>
                    setForm({ ...form, outlookEmail: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-400 text-gray-900"
                />
                User is using Microsoft Outlook for Email
              </label>
            </div>

            <div className="flex items-end justify-end">
              <button
                type="button"
                onClick={() => alert("Test Mail Sent Successfully!")}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
              >
                Test Mail
              </button>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 rounded border-t border-gray-200 bg-white py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
            <button
              type="button"
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-200"
            >
              File Attachments
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
