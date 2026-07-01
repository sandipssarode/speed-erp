import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import AuthLayout from "./AuthLayout.jsx";

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
    <AuthLayout
      headline="Manage Smarter. Grow Faster."
      subtext="The complete operations platform for Speed Innovations."
    >
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Welcome Back!</h1>
      <p className="text-sm text-gray-500 mb-7">Log in to continue to Speed ERP.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email</label>
          <input
            id="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="you@example.com" required
          />
        </div>

        <div className="mb-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline">Forgot password?</Link>
          </div>
          <input
            id="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="Enter your password" required
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="text-brand-600 font-medium hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
