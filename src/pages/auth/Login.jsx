import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await api.post("/api/auth/login", { email: email.trim(), password });
      localStorage.setItem("loggedInUser", JSON.stringify(result.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 font-sans">
      <div className="w-[360px] p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="h-14 flex items-center justify-center bg-gray-200 border border-dashed border-gray-300 mb-4 font-semibold text-gray-800">
          Speed Innovations
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2" htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="you@example.com" required />
          </div>

          <div className="mb-4">
            <div className="flex items-baseline justify-between mb-2">
              <label className="text-sm text-gray-700" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-xs text-gray-700 hover:underline">Forgot password?</Link>
            </div>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Enter your password" required />
          </div>

          {error && <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?
          <Link to="/signup" className="ml-1 text-gray-900 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
