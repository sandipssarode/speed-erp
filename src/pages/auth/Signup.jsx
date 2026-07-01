import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const key = "users";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const emailLower = email.trim().toLowerCase();
    const exists = existing.some((u) => (u.email || "").toLowerCase() === emailLower);

    if (exists) {
      setError("An account with this email already exists");
      return;
    }

    const user = { fullName: fullName.trim(), email: email.trim(), password };
    existing.push(user);
    localStorage.setItem(key, JSON.stringify(existing));

    navigate("/");
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Create Account</h1>
      <p className="text-sm text-gray-500 mb-7">Get started with Speed ERP.</p>

      <form onSubmit={handleSubmit}>
        {error && (
          <p className="text-sm text-red-600 mb-4 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="fullName">Full Name</label>
          <input
            id="fullName" name="fullName" type="text" value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="John Doe" required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="you@example.com" required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
          <input
            id="password" name="password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="Create a password" required
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="Confirm your password" required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: "#482C80", color: "#fff",
            fontSize: 14.5, fontWeight: 700, fontFamily: "inherit",
            cursor: "pointer", letterSpacing: "-0.01em",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 8px 24px rgba(72,44,128,0.35)"; }}
          onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}
        >
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/" className="text-brand-600 font-medium hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
