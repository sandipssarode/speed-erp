import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // placeholder — replace with real reset logic
    console.log("Send reset link to:", email);
  }

  return (
    <AuthLayout>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Reset Password</h1>
      <p className="text-sm text-gray-500 mb-7">We&apos;ll email you a reset link.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 transition-colors"
            placeholder="you@example.com" required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          Send Reset Link
        </button>
      </form>

      <p className="mt-6 text-center text-sm">
        <Link to="/" className="text-brand-600 font-medium hover:underline">← Back to Login</Link>
      </p>
    </AuthLayout>
  );
}
