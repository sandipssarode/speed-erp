import SpeedHero from "./SpeedHero.jsx";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex text-gray-900 font-sans">

      {/* ── Left 50% — Dark hero panel ── */}
      <div
        className="hidden lg:block w-1/2 relative overflow-hidden"
        style={{ background: "radial-gradient(120% 90% at 35% 8%,#1E0935 0%,#0E1428 52%,#081B24 100%)" }}
      >
        {/* Hero cards — scaled from top-left so nothing is cropped on the left edge */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: "scale(0.88)",
          transformOrigin: "top left",
        }}>
          <SpeedHero />
        </div>

        {/* Logo — sits above the hero */}
        <div className="absolute top-7 left-8 z-10">
          <img
            src="/si_logo_trans.png"
            alt="Speed Innovations"
            className="h-11 w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
          />
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
