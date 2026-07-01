import { useRef, useLayoutEffect, useState } from "react";
import SpeedHero from "./SpeedHero.jsx";

const HERO_W = 440; // SpeedHero canvas width

export default function AuthLayout({ children }) {
  const heroColRef = useRef(null);
  const [scale, setScale] = useState(0.9);

  useLayoutEffect(() => {
    const resize = () => {
      if (heroColRef.current) {
        setScale(heroColRef.current.offsetWidth / HERO_W);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen flex text-gray-900 font-sans">

      {/* ── Left 55% panel — row: text col | hero col ── */}
      <div
        className="hidden lg:flex flex-row w-[55%] h-screen overflow-hidden"
        style={{ background: "radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)" }}
      >
        {/* Text column */}
        <div className="flex flex-col shrink-0 h-full z-10" style={{ width: "48%", padding: "36px 32px 36px 40px" }}>
          {/* Logo */}
          <div className="shrink-0">
            <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-14 w-auto" />
          </div>

          {/* Heading + subheading — vertically centred */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 style={{
              fontSize: 36, fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.025em",
              background: "linear-gradient(115deg,#1C0F35 10%,#482C80 55%,#10A48A 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 12,
            }}>
              Manage<br />Smarter.<br />Grow<br />Faster.
            </h2>
            <p style={{ fontSize: 13, color: "rgba(72,44,128,0.55)", lineHeight: 1.75, maxWidth: 220 }}>
              Procurement, inventory, sales & finance — all in one place.
            </p>
          </div>
        </div>

        {/* Hero column — hero anchored to top with same 36px padding as logo */}
        <div ref={heroColRef} className="flex-1 relative overflow-hidden">
          <div style={{
            position: "absolute",
            top: 36,
            bottom: 36,
            left: 0,
            right: 0,
            overflow: "hidden",
          }}>
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
