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
      <div className="w-[360px] p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="h-14 flex items-center justify-center bg-gray-200 border border-dashed border-gray-300 mb-4 font-semibold text-gray-800">
          Speed Innovations
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-gray-900 text-white text-sm font-medium"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <Link to="/" className="text-gray-900 hover:underline ml-1">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
