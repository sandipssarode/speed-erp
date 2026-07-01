import { useRef, useLayoutEffect, useState } from "react";
import SpeedHero from "./SpeedHero.jsx";

const HERO_W = 440;
const HERO_PAD_RIGHT = 24;
const BG = "radial-gradient(130% 110% at 30% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)";

export default function AuthLayout({ children }) {
  const heroColRef = useRef(null);
  const [scale, setScale] = useState(0.9);

  useLayoutEffect(() => {
    const resize = () => {
      if (heroColRef.current) {
        setScale((heroColRef.current.offsetWidth - HERO_PAD_RIGHT) / HERO_W);
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="min-h-screen flex text-gray-900 font-sans">

      {/* ── Left panel — lg+ only ── */}
      <div
        className="hidden lg:flex flex-row w-[55%] h-screen overflow-hidden"
        style={{ background: BG }}
      >
        {/* Text column */}
        <div
          className="flex flex-col shrink-0 h-full z-10"
          style={{ width: "48%", padding: "40px 28px 40px 44px" }}
        >
          <div className="shrink-0">
            <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-20 w-auto" />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h2 style={{
              fontSize: 42, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.03em",
              background: "linear-gradient(115deg,#1C0F35 10%,#482C80 60%,#10A48A 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 18,
            }}>
              Manage Smarter.<br />Grow Faster.
            </h2>
            <p style={{ fontSize: 13.5, color: "rgba(72,44,128,0.6)", lineHeight: 1.8, maxWidth: 210 }}>
              Procurement, inventory, sales & finance — all in one place.
            </p>
          </div>
        </div>

        {/* Hero column */}
        <div ref={heroColRef} className="flex-1 relative overflow-hidden">
          <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: HERO_PAD_RIGHT, overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}>
              <SpeedHero />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div
        className="w-full lg:w-[45%] flex flex-col items-center justify-center min-h-screen
                   px-4 py-8 sm:px-8 sm:py-10 lg:py-4 lg:pr-3 lg:pl-2"
        style={{ background: "radial-gradient(130% 110% at 70% 5%, #f5f0ff 0%, #ebe3fd 55%, #e2d9fb 100%)" }}
      >
        {/* Mobile logo */}
        <div className="mb-7 lg:hidden">
          <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-14 w-auto" />
        </div>

        {/* Floating card — responsive padding & radius */}
        <div
          className="w-full bg-white
                     px-6 py-8
                     sm:px-10 sm:py-10
                     lg:px-11 lg:py-12
                     rounded-2xl sm:rounded-3xl"
          style={{
            maxWidth: 440,
            boxShadow: "0 24px 64px rgba(72,44,128,0.13), 0 4px 18px rgba(72,44,128,0.07)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
