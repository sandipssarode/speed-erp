import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    const exists = existing.some(
      (u) => (u.email || "").toLowerCase() === emailLower,
    );

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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 font-sans">
      <div className="w-full max-w-sm mx-4 p-6 sm:p-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center gap-3 mb-7">
          <svg viewBox="0 0 48 48" className="w-14 h-14 rounded-2xl shadow-md">
            <defs>
              <linearGradient id="signup-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#050d1a"/>
                <stop offset="100%" stopColor="#0f2045"/>
              </linearGradient>
              <linearGradient id="signup-s" x1="34" y1="11" x2="12" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e2d4ff"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="11" fill="url(#signup-bg)"/>
            <path d="M 34 11 C 34 11 12 11 12 20 C 12 28 34 26 34 35 C 34 41 12 42 12 42"
              fill="none" stroke="url(#signup-s)" strokeWidth="5.5" strokeLinecap="round"/>
            <circle cx="34" cy="11" r="3.5" fill="white"/>
            <circle cx="12" cy="42" r="2.5" fill="#93c5fd" fillOpacity="0.8"/>
          </svg>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Speed ERP</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">Speed Innovations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-3 text-sm text-gray-700" role="alert">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              className="block text-sm text-gray-700 mb-2"
              htmlFor="fullName"
            >
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="John Doe"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm text-gray-700 mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Enter a password"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm text-gray-700 mb-2"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <Link to="/" className="text-brand-600 font-medium hover:underline ml-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

