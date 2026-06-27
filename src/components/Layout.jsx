import { useState, useRef, useEffect } from "react";
import {
  LogOut, ChevronDown, ChevronUp, LayoutDashboard, Menu, X,
  ChevronRight, Search, Bell, User,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import siLogo from "../../logo/si_logo_trans.png";
import { menu, isModuleActive, getActiveState } from "../lib/menu.js";

// ─────────────────────────────────────────────────────────────
// LAYOUT
// ─────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const userName = user.name || user.fullName || "User";
  const userInitial = userName[0].toUpperCase();

  const active = getActiveState(location.pathname);
  const [openModule,  setOpenModule]  = useState(null);        // open flyout / accordion
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const asideRef   = useRef(null);
  const topMenuRef = useRef(null);

  const handleLogoff = () => { localStorage.removeItem("loggedInUser"); navigate("/"); };

  const toggleModule = (label) => setOpenModule(p => p === label ? null : label);

  // Close the desktop flyout on outside-click / Escape
  useEffect(() => {
    if (!openModule) return;
    const onDown = (e) => {
      if (asideRef.current && !asideRef.current.contains(e.target)) setOpenModule(null);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpenModule(null); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openModule]);

  // Close the top-bar dropdowns on outside-click / Escape
  useEffect(() => {
    if (!notifOpen && !profileOpen) return;
    const close = () => { setNotifOpen(false); setProfileOpen(false); };
    const onDown = (e) => { if (topMenuRef.current && !topMenuRef.current.contains(e.target)) close(); };
    const onKey  = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen, profileOpen]);

  // ── Single flyout link (shared by flat grid + sectioned columns) ───────────
  const FlyoutLink = ({ link }) => (
    <Link
      to={link.path}
      onClick={() => setOpenModule(null)}
      className={`block whitespace-nowrap px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
        link.deprecated
          ? location.pathname === link.path
            ? "bg-red-50 text-red-600 font-semibold"
            : "text-red-400 hover:bg-red-50"
          : location.pathname === link.path
          ? "bg-brand-50 text-brand-600 font-semibold"
          : "text-gray-600 hover:bg-gray-100 hover:text-brand-600"
      }`}
    >
      {link.label}
      {link.deprecated && (
        <span className="ml-1.5 align-middle text-[9px] bg-red-100 text-red-500 border border-red-200 px-1 py-0.5 rounded font-semibold uppercase">Old</span>
      )}
    </Link>
  );

  // ── Desktop flyout panel anchored to the right of a module row ──────────────
  const FlyoutPanel = ({ mod, nearBottom }) => (
    <div className={`absolute left-full pl-2 z-50 ${nearBottom ? "bottom-0" : "top-0"} animate-flyout`}>
      <div className="bg-white rounded-2xl border border-brand-200 ring-1 ring-black/5 shadow-[0_16px_48px_-12px_rgba(45,43,58,0.45)] p-4 max-h-[78vh] overflow-y-auto">
        {mod.flat ? (
          <div className="grid grid-cols-[repeat(3,max-content)] gap-x-6 gap-y-0.5">
            {mod.links.map(link => <FlyoutLink key={link.path} link={link} />)}
          </div>
        ) : (
          <div className="flex gap-8">
            {Object.entries(mod.children).map(([section, links]) => (
              <div key={section} className="min-w-[150px]">
                <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1 px-2.5">{section}</p>
                <div className="flex flex-col whitespace-nowrap">
                  {links.map(link => <FlyoutLink key={link.path} link={link} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Desktop nav: Dashboard + module rows (icon + label) with flyout ─────────
  const DesktopNav = () => (
    <div className="flex flex-col flex-1 min-h-0 py-3 px-2 gap-1">

      {/* Dashboard */}
      <Link
        to="/dashboard"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
          location.pathname === "/dashboard"
            ? "bg-brand-600 text-white shadow-md shadow-brand-200"
            : "text-gray-500 hover:bg-brand-50 hover:text-brand-600"
        }`}
      >
        <LayoutDashboard size={18} className="shrink-0" />
        <span>Dashboard</span>
      </Link>

      <div className="mx-2 border-t border-gray-100 my-1" />

      {/* Modules */}
      {menu.map((mod, i) => {
        const ModIcon   = mod.icon;
        const isOpen    = openModule === mod.label;
        const hasActive = isModuleActive(mod, location.pathname);
        const nearBottom = i >= menu.length - 2;

        const highlight = isOpen || hasActive;
        return (
          <div
            key={mod.label}
            className="relative"
          >
            <button
              onClick={() => setOpenModule(p => p === mod.label ? null : mod.label)}
              className={`relative flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                highlight
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : "text-gray-500 hover:bg-brand-50 hover:text-brand-600"
              }`}
            >
              <span className="flex items-center gap-3">
                <ModIcon size={17} className="shrink-0" />
                <span>{mod.label}</span>
              </span>
              <ChevronRight size={14} className={highlight ? "text-white/80" : "text-gray-400"} />
            </button>

            {isOpen && <FlyoutPanel mod={mod} nearBottom={nearBottom} />}
          </div>
        );
      })}

      <div className="flex-1" />
    </div>
  );

  // ── Mobile drawer nav: inline accordion — one tap to expand, links shown directly ──
  const renderMobileNav = (onLinkClick) => (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Dashboard link */}
      <Link
        to="/dashboard"
        onClick={onLinkClick}
        className={`flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-xl text-sm font-semibold transition-all ${
          location.pathname === "/dashboard"
            ? "bg-brand-600 text-white shadow-md shadow-brand-200"
            : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
        }`}
      >
        <LayoutDashboard size={18} className="shrink-0" />
        <span>Dashboard</span>
      </Link>

      <div className="mx-4 border-t border-gray-100 my-1" />

      {/* Module items */}
      {menu.map((mod, i) => {
        const ModIcon   = mod.icon;
        const isOpen    = openModule === mod.label;
        const hasActive = isModuleActive(mod, location.pathname);

        return (
          <div key={mod.label}>
            <button
              onClick={() => toggleModule(mod.label)}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all my-0.5 ${
                isOpen
                  ? "bg-brand-600 text-white"
                  : hasActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
              style={{ width: "calc(100% - 16px)", marginLeft: 8 }}
            >
              <span className="flex items-center gap-3">
                <ModIcon size={17} className="shrink-0" />
                <span>{mod.label}</span>
              </span>
              <span className={isOpen ? "text-brand-200" : "text-gray-400"}>
                {isOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </span>
            </button>

            {isOpen && (
              <div className="ml-2 mr-2 mb-1 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                {mod.flat ? (
                  /* Flat module: links shown directly */
                  <div className="py-1">
                    {mod.links.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={onLinkClick}
                        className={`block pl-6 pr-3 py-2 text-sm transition-colors ${
                          link.deprecated
                            ? location.pathname === link.path
                              ? "bg-red-50 text-red-600 font-semibold border-r-2 border-red-400"
                              : "text-red-400 hover:bg-red-50"
                            : location.pathname === link.path
                            ? "bg-brand-100 text-brand-600 font-semibold border-r-2 border-brand-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        {link.label}
                        {link.deprecated && (
                          <span className="ml-1.5 text-[9px] bg-red-100 text-red-500 border border-red-200 px-1 py-0.5 rounded font-semibold uppercase">Old</span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  /* Sectioned module: section names are static labels, all links visible immediately */
                  <div className="py-1">
                    {Object.entries(mod.children).map(([section, links]) => (
                      <div key={section}>
                        <p className="px-4 pt-2.5 pb-1 text-[10px] font-bold text-brand-500 uppercase tracking-wider">
                          {section}
                        </p>
                        {links.map(link => (
                          <Link
                            key={link.path}
                            to={link.path}
                            onClick={onLinkClick}
                            className={`block pl-6 pr-3 py-2 text-sm transition-colors ${
                              location.pathname === link.path
                                ? "bg-brand-100 text-brand-600 font-semibold border-r-2 border-brand-600"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {i < menu.length - 1 && !isOpen && (
              <div className="border-t border-dashed border-gray-100 mx-4 my-0.5" />
            )}
          </div>
        );
      })}

      <div className="flex-1" />
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f3f4fb] text-gray-800">
      {/* ── TOP BAR ── */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-brand-200 flex items-center gap-2 lg:gap-0 pl-3 lg:pl-0 pr-3 lg:pr-4 py-2 shadow-sm shrink-0 z-30">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-brand-50 text-gray-500"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo zone (aligns with the fixed sidebar width) */}
        <div className="flex items-center shrink-0 lg:w-64 lg:px-4">
          <img src={siLogo} alt="Speed Innovations" className="h-14 w-auto object-contain" />
        </div>

        {/* Search (aligned with the dashboard content) */}
        <div className="hidden md:flex items-center gap-2 flex-1 max-w-md lg:ml-5 bg-brand-50/70 border border-brand-100 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-brand-200 transition-all">
          <Search size={16} className="text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-gray-400"
          />
        </div>

        {/* Actions: notification + profile */}
        <div ref={topMenuRef} className="flex items-center gap-1.5 ml-auto">

          {/* Notification */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-gray-500 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              <Bell size={19} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-coral ring-2 ring-white" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] z-40 animate-flyout bg-white rounded-2xl border border-brand-200 ring-1 ring-black/5 shadow-[0_16px_48px_-12px_rgba(45,43,58,0.45)] overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Notifications</p>
                  <span className="text-[10px] font-bold text-white bg-coral rounded-full px-2 py-0.5">3 new</span>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {[
                    { t: "Purchase Order #PO-0245 awaiting approval", d: "10 min ago" },
                    { t: "GRN pending for PO #PO-0231", d: "1 hour ago" },
                    { t: "New sales quotation SQ-0089 received", d: "Today" },
                  ].map((n, i) => (
                    <div key={i} className="group px-4 py-2.5 hover:bg-brand-600 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                      <p className="text-xs text-gray-700 group-hover:text-white leading-snug">{n.t}</p>
                      <p className="text-[10px] text-gray-400 group-hover:text-white/70 mt-0.5">{n.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
              aria-label="Profile"
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-sm font-bold shadow-sm hover:shadow-md transition-shadow"
            >
              {userInitial}
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-52 z-40 animate-flyout bg-white rounded-2xl border border-brand-200 ring-1 ring-black/5 shadow-[0_16px_48px_-12px_rgba(45,43,58,0.45)] overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 truncate">{userName}</p>
                  <p className="text-[10px] text-gray-400">Speed IT Innovations</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-600 hover:text-white transition-colors"
                >
                  <User size={15} /> My Profile
                </Link>
                <button
                  onClick={handleLogoff}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-brand-600 hover:text-white transition-colors border-t border-gray-100"
                >
                  <LogOut size={15} /> Log Off
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── MOBILE OVERLAY ── */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* ── MOBILE SIDEBAR (full overlay) ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white/98 backdrop-blur-md border-r border-brand-200 flex flex-col
          transition-transform duration-300 ease-in-out shadow-2xl
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:hidden
        `}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <img src={siLogo} alt="Speed Innovations" className="h-7 w-auto max-w-[140px] object-contain" />
            <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {renderMobileNav(() => setMobileOpen(false))}
          </div>
        </aside>

        {/* ── DESKTOP SIDEBAR: fixed column with flyout menus ── */}
        <aside
          ref={asideRef}
          className="hidden lg:flex flex-col shrink-0 relative z-20 w-64 bg-white/90 backdrop-blur-sm border-r border-brand-200"
        >
          {/* Nav + flyout */}
          <DesktopNav />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main key={location.pathname} className="flex-1 overflow-y-auto p-3 lg:p-5 animate-page">{children}</main>
      </div>

    </div>
  );
}
