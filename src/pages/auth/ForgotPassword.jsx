import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // placeholder submit
    // replace with real reset logic as needed
    console.log("Send reset link to:", email);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-900 font-sans">
      <div className="w-[360px] p-8 bg-white border border-gray-200 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center gap-3 mb-7">
          <svg viewBox="0 0 48 48" className="w-14 h-14 rounded-2xl shadow-md">
            <defs>
              <linearGradient id="si-forgot" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4338ca"/>
                <stop offset="100%" stopColor="#7c3aed"/>
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="12" fill="url(#si-forgot)"/>
            <path d="M 29 4 L 13 28 L 22 28 L 19 44 L 35 20 L 26 20 Z" fill="white" fillOpacity="0.95"/>
          </svg>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Speed ERP</h1>
            <p className="text-xs text-gray-500 tracking-widest uppercase mt-0.5">Speed Innovations</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
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

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-gray-900 text-white text-sm font-medium"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <Link to="/" className="text-gray-900 hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
