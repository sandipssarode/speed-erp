import { useRef, useLayoutEffect, useState } from "react";
import SpeedHero from "./SpeedHero.jsx";

export default function AuthLayout({ children }) {
  const panelRef = useRef(null);
  const [scale, setScale] = useState(0.8);

  useLayoutEffect(() => {
    const resize = () => {
      if (panelRef.current) {
        setScale(panelRef.current.offsetWidth / 780);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen flex text-gray-900 font-sans">

      {/* ── Left 55% — Dark hero panel ── */}
      <div
        ref={panelRef}
        className="hidden lg:flex flex-col w-[55%] overflow-hidden"
        style={{ background: "radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)" }}
      >
        {/* Logo */}
        <div className="shrink-0 pt-9 px-10 z-10 relative">
          <img
            src="/si_logo_trans.png"
            alt="Speed Innovations"
            className="h-16 w-auto"
          />
        </div>

        {/* Heading + subheading */}
        <div className="shrink-0 px-10 mt-9 z-10 relative">
          <h2 style={{
            fontSize: 40, fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.025em",
            background: "linear-gradient(110deg,#1C0F35 10%,#482C80 55%,#10A48A 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 10,
          }}>
            Manage Smarter.<br />Grow Faster.
          </h2>
          <p style={{ fontSize: 13.5, color: "rgba(72,44,128,0.55)", lineHeight: 1.7, maxWidth: 360 }}>
            Procurement, inventory, sales & finance —<br />all in one place, built for Speed Innovations.
          </p>
        </div>

        {/* SpeedHero — centered in remaining space */}
        <div className="flex-1 relative overflow-hidden">
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <div style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
              flexShrink: 0,
            }}>
              <SpeedHero />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right 45% — White form panel ── */}
      <div
        className="
          flex flex-col items-center justify-center
          w-full min-h-screen bg-white
          px-6 sm:px-10 py-12
          lg:w-[45%] lg:px-16
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
