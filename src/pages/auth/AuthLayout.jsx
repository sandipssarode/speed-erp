import { useRef, useLayoutEffect, useState } from "react";
import SpeedHero from "./SpeedHero.jsx";

export default function AuthLayout({ children }) {
  const heroColRef = useRef(null);
  const [scale, setScale] = useState(0.9);

  useLayoutEffect(() => {
    const resize = () => {
      if (heroColRef.current) {
        /* scale hero to fill its column width exactly */
        setScale(heroColRef.current.offsetWidth / 440);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen flex text-gray-900 font-sans">

      {/* ── Left 55% panel — row split: text | hero ── */}
      <div
        className="hidden lg:flex flex-row w-[55%] overflow-hidden"
        style={{ background: "radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)" }}
      >
        {/* Text column — left-left */}
        <div className="flex flex-col shrink-0 pt-9 pb-9 px-10 z-10" style={{ width: "48%" }}>
          {/* Logo */}
          <div className="shrink-0">
            <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-14 w-auto" />
          </div>

          {/* Heading + subheading vertically centred in remaining space */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 style={{
              fontSize: 36, fontWeight: 900, lineHeight: 1.12, letterSpacing: "-0.025em",
              background: "linear-gradient(115deg,#1C0F35 10%,#482C80 55%,#10A48A 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 12,
            }}>
              Manage<br />Smarter.<br />Grow<br />Faster.
            </h2>
            <p style={{ fontSize: 13, color: "rgba(72,44,128,0.55)", lineHeight: 1.75, maxWidth: 230 }}>
              Procurement, inventory, sales & finance — all in one place.
            </p>
          </div>
        </div>

        {/* Hero column — left-right */}
        <div
          ref={heroColRef}
          className="flex-1 relative overflow-hidden flex items-center justify-center"
        >
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: "center center",
            flexShrink: 0,
          }}>
            <SpeedHero />
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
