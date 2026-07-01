import { useRef, useLayoutEffect, useState } from "react";
import SpeedHero from "./SpeedHero.jsx";

export default function AuthLayout({ children }) {
  const panelRef = useRef(null);
  const [scale, setScale] = useState(0.75);

  useLayoutEffect(() => {
    const resize = () => {
      if (panelRef.current) {
        /* fill panel width but cap at 85% so cards don't get too large */
        setScale(Math.min(panelRef.current.offsetWidth / 780, 0.85));
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen flex text-gray-900 font-sans">

      {/* ── Left 50% — Dark hero panel ── */}
      <div
        ref={panelRef}
        className="hidden lg:flex flex-col w-1/2 relative overflow-hidden"
        style={{ background: "radial-gradient(120% 90% at 35% 8%,#1E0935 0%,#0E1428 52%,#081B24 100%)" }}
      >
        {/* — Logo — */}
        <div className="relative z-10 pt-9 px-10">
          <img
            src="/si_logo_trans.png"
            alt="Speed Innovations"
            className="h-16 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
        </div>

        {/* — Heading + subheading — */}
        <div className="relative z-10 px-10 mt-7">
          {/* Label chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(45,186,213,0.12)",
            border: "1px solid rgba(45,186,213,0.3)",
            borderRadius: 20, padding: "4px 12px", marginBottom: 14,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2DBAD5", display: "inline-block" }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: "#2DBAD5", letterSpacing: "0.06em" }}>SPEED ERP PLATFORM</span>
          </div>

          <h2 style={{
            fontSize: 38, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.025em",
            background: "linear-gradient(100deg,#fff 30%,#2DBAD5 80%,#10A48A 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 12,
          }}>
            Manage Smarter.<br />Grow Faster.
          </h2>

          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 340 }}>
            Procurement, inventory, sales & finance — all in one place,
            built for Speed Innovations.
          </p>

          {/* Feature chips */}
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {[
              { icon: "📦", label: "Inventory" },
              { icon: "📋", label: "Procurement" },
              { icon: "💰", label: "Finance" },
            ].map(f => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: 5,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20, padding: "5px 12px",
              }}>
                <span style={{ fontSize: 12 }}>{f.icon}</span>
                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* — SpeedHero — */}
        <div className="flex-1 relative overflow-hidden mt-5">
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}>
            <SpeedHero />
          </div>
        </div>
      </div>

      {/* ── Right 50% — White form panel ── */}
      <div
        className="
          flex flex-col items-center justify-center
          w-full min-h-screen bg-white
          px-6 sm:px-10 py-12
          lg:w-1/2 lg:px-16
          lg:rounded-l-[36px]
        "
        style={{ boxShadow: "-16px 0 70px rgba(72,44,128,0.16)" }}
      >
        {/* Mobile logo */}
        <div className="mb-10 lg:hidden">
          <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-12 w-auto" />
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
