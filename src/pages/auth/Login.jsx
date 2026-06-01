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
      <div className="w-[360px] p-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center gap-3 mb-7">
          <svg viewBox="0 0 48 48" className="w-14 h-14 rounded-2xl shadow-md">
            <defs>
              <linearGradient id="si-login" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4338ca"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#si-login)"/>
            <path d="M 29 4 L 13 28 L 22 28 L 19 44 L 35 20 L 26 20 Z" fill="white" fillOpacity="0.95"/>
          </svg>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Speed ERP</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">Speed Innovations</p>
          </div>
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
