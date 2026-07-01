export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex text-gray-900 font-sans"
      style={{ background: "radial-gradient(120% 90% at 50% 8%, #FBFAFF 0%, #F3F0FA 46%, #ECE7F6 100%)" }}
    >

      {/* ── Left Hero Panel (desktop only) ── */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">

        {/* Scaled iframe wrapper — centers and scales the 780×1000 hero component */}
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: 24,
          overflow: "hidden",
        }}>
          <iframe
            src="/speed-hero.html"
            title="Speed ERP Hero"
            scrolling="no"
            style={{
              width: 780,
              height: 1000,
              border: "none",
              pointerEvents: "none",
              display: "block",
              flexShrink: 0,
              transform: "scale(0.86)",
              transformOrigin: "top center",
            }}
          />
        </div>

        {/* Logo overlay — top left, above the iframe */}
        <div className="absolute top-7 left-8 z-10">
          <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-8 w-auto" />
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div
        className="
          flex flex-col items-center justify-center
          w-full min-h-screen
          bg-white
          px-6 sm:px-10 py-12
          lg:w-[440px] lg:px-14
          lg:rounded-l-[32px]
        "
        style={{ boxShadow: "-12px 0 60px rgba(100, 60, 180, 0.10)" }}
      >
        {/* Mobile logo (hidden on desktop — desktop has it in the left panel) */}
        <div className="mb-8 lg:hidden">
          <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-9 w-auto" />
        </div>

        <div className="w-full max-w-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
