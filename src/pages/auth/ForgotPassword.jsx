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
      <div className="w-[360px] p-6 bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="h-14 flex items-center justify-center bg-gray-200 border border-dashed border-gray-300 mb-4 font-semibold text-gray-800">
          Speed Innovations
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
