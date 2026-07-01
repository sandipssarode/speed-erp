export default function AuthLayout({ headline, subtext, children }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-gray-900 font-sans">

      {/* ── Left Hero Panel ── */}
      <div
        className="hidden lg:flex lg:w-3/5 relative overflow-hidden flex-col p-10"
        style={{ background: "linear-gradient(135deg, #0d0b2b 0%, #1e1b5e 52%, #0f2045 100%)" }}
      >
        {/* Dot grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute -top-28 -right-28 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(75,73,172,0.35) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute -bottom-36 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(125,160,250,0.25) 0%, transparent 70%)", filter: "blur(36px)" }} />
        <div className="absolute top-1/2 right-12 w-52 h-52 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(121,120,233,0.2) 0%, transparent 70%)", filter: "blur(28px)" }} />

        {/* Logo — top left */}
        <div className="relative z-10">
          <img src="/si_logo_trans.png" alt="Speed Innovations" className="h-10 w-auto"
            style={{ filter: "brightness(0) invert(1)" }} />
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-lg">
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
            {headline}
          </h2>
          <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {subtext}
          </p>
        </div>

        {/* Feature chips — bottom */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          {[
            {
              label: "Inventory",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              ),
            },
            {
              label: "Finance",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              ),
            },
            {
              label: "HR & Payroll",
              icon: (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              ),
            },
          ].map((chip) => (
            <div
              key={chip.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <span style={{ color: "#7da0fa" }}>{chip.icon}</span>
              {chip.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-2/5 min-h-screen bg-white px-6 sm:px-10 lg:px-14 py-12">
        {/* Mobile logo */}
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
