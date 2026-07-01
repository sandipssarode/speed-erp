import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../../lib/api.js";
import AuthLayout from "./AuthLayout.jsx";

const field = {
  width: "100%", boxSizing: "border-box",
  padding: "11px 14px", borderRadius: 12,
  border: "1.5px solid #E0D6F3",
  background: "#F8F6FD", color: "#1C0F35",
  fontSize: 14, outline: "none", fontFamily: "inherit",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A2268", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Login() {
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const navigate = useNavigate();

  const focusStyle  = e => { e.target.style.borderColor = "#482C80"; e.target.style.boxShadow = "0 0 0 3px rgba(72,44,128,0.1)"; };
  const blurStyle   = e => { e.target.style.borderColor = "#E0D6F3"; e.target.style.boxShadow = "none"; };

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
    <AuthLayout>
      {/* Heading */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: "#1C0F35",
          letterSpacing: "-0.025em", lineHeight: 1.2,
          fontFamily: "'Inter', system-ui, sans-serif", marginBottom: 6,
        }}>
          Welcome Back!
        </h1>
        <p style={{ fontSize: 13.5, color: "rgba(72,44,128,0.55)", lineHeight: 1.5 }}>
          Log in to continue to Speed ERP.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <Field label="Email address">
          <input
            type="email" value={email} placeholder="you@example.com" required
            onChange={e => setEmail(e.target.value)}
            style={field} onFocus={focusStyle} onBlur={blurStyle}
          />
        </Field>

        {/* Password */}
        <Field label="Password">
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"} value={password}
              placeholder="Enter your password" required
              onChange={e => setPassword(e.target.value)}
              style={{ ...field, paddingRight: 44 }}
              onFocus={focusStyle} onBlur={blurStyle}
            />
            <button
              type="button" onClick={() => setShowPass(p => !p)}
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 4,
                color: "#9E8CC8", display: "flex", alignItems: "center",
              }}
              tabIndex={-1}
            >
              {showPass ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </Field>

        {/* Forgot password — below password field */}
        <div style={{ textAlign: "right", marginTop: -6, marginBottom: 28 }}>
          <Link to="/forgot-password" style={{
            fontSize: 12.5, color: "#482C80", fontWeight: 600, textDecoration: "none",
          }}>
            Forgot password?
          </Link>
        </div>

        {error && (
          <div style={{
            fontSize: 13, color: "#C0432F",
            background: "rgba(192,67,47,0.07)", border: "1px solid rgba(192,67,47,0.18)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit" disabled={loading}
          style={{
            width: "100%", padding: "13px", borderRadius: 12, border: "none",
            background: "#482C80", color: "#fff",
            fontSize: 14.5, fontWeight: 700, fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
            letterSpacing: "-0.01em",
            transition: "transform 0.18s ease, box-shadow 0.18s ease",
          }}
          onMouseEnter={e => { if (!loading) { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 8px 24px rgba(72,44,128,0.35)"; }}}
          onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = ""; }}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>
      </form>

      {/* Sign up */}
      <p style={{ textAlign: "center", marginTop: 28, fontSize: 13.5, color: "rgba(72,44,128,0.55)" }}>
        Don't have an account?{" "}
        <Link to="/signup" style={{ color: "#482C80", fontWeight: 700, textDecoration: "none" }}>
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
