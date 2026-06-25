import { useState } from "react";
import {
  LogOut, ChevronDown, ChevronUp, ShoppingCart, BarChart2,
  Package, DollarSign, Settings, LayoutDashboard, Menu, X, Database,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import siLogo from "../../logo/si_logo_trans.png";

// ─────────────────────────────────────────────────────────────
// MENU CONFIG  (icon = component ref, not JSX)
// ─────────────────────────────────────────────────────────────
const menu = [
  {
    label: "Masters", icon: Database, flat: true,
    links: [
      { label: "Country Master",           path: "/system/countries" },
      { label: "State Master",             path: "/system/states" },
      { label: "District Master",          path: "/masters/district" },
      { label: "Village / Taluka",         path: "/masters/village-taluka" },
      { label: "Product Type Master",      path: "/masters/product-type" },
      { label: "Product Sub-type Master",  path: "/masters/product-subtype" },
      { label: "Product Master",           path: "/masters/product-master" },
      { label: "Department Master",        path: "/masters/department" },
      { label: "Designation Master",       path: "/masters/designation" },
      { label: "Employee Master",          path: "/masters/employee" },
      { label: "Vendor Master",            path: "/vendors" },
      { label: "Customer Master",          path: "/sales/customers" },
      { label: "Product Master (Old)",     path: "/products", deprecated: true },
      { label: "Asset Structure",          path: "/masters/asset-structure" },
      { label: "Asset Type",               path: "/masters/asset-type" },
      { label: "Asset Master",             path: "/masters/asset-master" },
      { label: "Maintenance Type",         path: "/masters/maintenance-type" },
    ],
  },
  {
    label: "System Setup", icon: Settings, flat: true,
    links: [
      { label: "User Master",                    path: "/system/users" },
      { label: "Organisation Master",            path: "/system/organisations" },
      { label: "Business Unit Master",           path: "/system/business-units" },
      { label: "Warehouse Master",               path: "/system/warehouses" },
      { label: "UoM",                            path: "/system/uom" },
      { label: "Document Series",                path: "/system/document-series" },
      { label: "Financial Year",                 path: "/system/financial-year" },
      { label: "Email Configuration",            path: "/system/email-config" },
      { label: "User Access Rights Management",  path: "/system/access-rights" },
    ],
  },
  {
    label: "Purchase", icon: ShoppingCart,
    children: {
      Transaction: [
        { label: "Purchase Requisition",  path: "/purchase/requisition" },
        { label: "Purchase Inquiry",      path: "/purchase/inquiry" },
        { label: "Purchase Quotation",    path: "/purchase/quotation" },
        { label: "Quotation Comparison",  path: "/purchase/quotation-comparison" },
        { label: "Purchase Order",        path: "/purchase/order" },
      ],
      Reports: [
        { label: "PR Report", path: "/purchase/reports/pr" },
        { label: "PO Report", path: "/purchase/reports/po" },
      ],
      Configuration: [
        { label: "PO Settings",       path: "/purchase/settings" },
        { label: "Approval Workflow", path: "/purchase/approval-workflow" },
      ],
    },
  },
  {
    label: "Sales", icon: BarChart2,
    children: {
      Transaction: [
        { label: "Sales Quotation",    path: "/sales/quotation" },
        { label: "Sales Order",        path: "/sales/orders" },
        { label: "Delivery Challan",   path: "/sales/delivery-challan" },
        { label: "Sales Invoice",      path: "/sales/invoice" },
      ],
      Reports: [
        { label: "Sales Report",       path: "/sales/reports" },
        { label: "Outstanding Report", path: "/sales/outstanding" },
      ],
      Configuration: [
        { label: "Sales Settings", path: "/sales/settings" },
      ],
    },
  },
  {
    label: "Inventory", icon: Package,
    children: {
      Transaction: [
        { label: "Material Receipt (GRN)", path: "/inventory/grn" },
        { label: "Stock Transfer",          path: "/inventory/transfer" },
        { label: "Stock Adjustment",        path: "/inventory/adjustment" },
      ],
      Reports: [
        { label: "Stock Report",  path: "/inventory/reports" },
        { label: "Stock Ledger",  path: "/inventory/ledger" },
      ],
      Configuration: [
        { label: "Inventory Settings", path: "/inventory/settings" },
      ],
    },
  },
  {
    label: "Finance", icon: DollarSign,
    children: {
      Transaction: [
        { label: "Journal Entry",    path: "/finance/journal" },
        { label: "Payment Voucher",  path: "/finance/payment" },
        { label: "Receipt Voucher",  path: "/finance/receipt" },
      ],
      Reports: [
        { label: "Balance Sheet",  path: "/finance/balance-sheet" },
        { label: "P&L Statement",  path: "/finance/pl" },
        { label: "Trial Balance",  path: "/finance/trial-balance" },
      ],
      Configuration: [
        { label: "Finance Settings", path: "/finance/settings" },
      ],
    },
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function isModuleActive(mod, pathname) {
  if (mod.flat) return mod.links.some(l => pathname.startsWith(l.path));
  return Object.values(mod.children).flat().some(l => pathname.startsWith(l.path));
}

function getActiveState(pathname) {
  for (const mod of menu) {
    if (mod.flat) {
      const sec = mod.links.find(l => pathname.startsWith(l.path));
      if (sec) return { module: mod.label, section: null };
    } else {
      for (const [section, links] of Object.entries(mod.children)) {
        if (links.some(l => pathname.startsWith(l.path)))
          return { module: mod.label, section };
      }
    }
  }
  return { module: null, section: null };
}

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
  const [expanded,    setExpanded]    = useState(false);       // sidebar pinned open?
  const [openModule,  setOpenModule]  = useState(active.module);
  const [openSection, setOpenSection] = useState(active.section);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const handleLogoff = () => { localStorage.removeItem("loggedInUser"); navigate("/"); };

  const toggleModule = (label) => {
    if (!expanded) setExpanded(true);           // auto-expand on click when collapsed
    setOpenModule(p => p === label ? null : label);
    setOpenSection(null);
  };

  const toggleSection = (sec) => setOpenSection(p => p === sec ? null : sec);

  // ── Sidebar content (shared between desktop + mobile) ──────────────────────
  // collapsed = icon-only rail (desktop narrow); otherwise full icon + label nav
  const SidebarContent = ({ onLinkClick, collapsed = false }) => (
    <div className={`flex flex-col h-full overflow-y-auto ${collapsed ? "items-center py-2 gap-1" : ""}`}>

      {/* Dashboard link */}
      <Link
        to="/dashboard"
        onClick={onLinkClick}
        title={collapsed ? "Dashboard" : undefined}
        className={
          collapsed
            ? `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                location.pathname === "/dashboard"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : "text-gray-400 hover:bg-brand-50 hover:text-brand-600"
              }`
            : `flex items-center gap-3 px-3 py-2.5 mx-2 my-1 rounded-xl text-sm font-semibold transition-all ${
                location.pathname === "/dashboard"
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : "text-gray-600 hover:bg-brand-50 hover:text-brand-600"
              }`
        }
      >
        <LayoutDashboard size={18} className="shrink-0" />
        {!collapsed && <span>Dashboard</span>}
      </Link>

      <div className={collapsed ? "w-6 border-t border-gray-200 my-1" : "mx-4 border-t border-gray-100 my-1"} />

      {/* Module items */}
      {menu.map((mod, i) => {
        const ModIcon = mod.icon;
        const isOpen   = openModule === mod.label;
        const hasActive = isModuleActive(mod, location.pathname);

        if (collapsed) {
          return (
            <button
              key={mod.label}
              title={mod.label}
              onClick={() => toggleModule(mod.label)}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isOpen
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : hasActive
                  ? "bg-brand-100 text-brand-600"
                  : "text-gray-400 hover:bg-brand-50 hover:text-brand-600"
              }`}
            >
              <ModIcon size={18} />
              {hasActive && !isOpen && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-600 rounded-full" />
              )}
            </button>
          );
        }

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
                  <div className="py-1">
                    {mod.links.map(link => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={onLinkClick}
                        className={`flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs transition-colors ${
                          link.deprecated
                            ? location.pathname === link.path
                              ? "bg-red-50 text-red-600 font-semibold border-r-2 border-red-400"
                              : "text-red-400 hover:bg-red-50"
                            : location.pathname === link.path
                            ? "bg-brand-100 text-brand-600 font-semibold border-r-2 border-brand-600"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        <span className="w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
                        {link.label}
                        {link.deprecated && (
                          <span className="ml-auto text-[9px] bg-red-100 text-red-500 border border-red-200 px-1 py-0.5 rounded font-semibold uppercase">Old</span>
                        )}
                      </Link>
                    ))}
                  </div>
                ) : (
                  Object.entries(mod.children).map(([section, links]) => (
                    <div key={section}>
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-brand-600 transition-colors"
                      >
                        {section}
                        {openSection === section ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                      </button>
                      {openSection === section && (
                        <div className="pb-1">
                          {links.map(link => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={onLinkClick}
                              className={`flex items-center gap-2 pl-8 pr-3 py-1.5 text-xs transition-colors ${
                                location.pathname === link.path
                                  ? "bg-brand-100 text-brand-600 font-semibold border-r-2 border-brand-600"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-700"
                              }`}
                            >
                              <span className="w-1 h-1 rounded-full bg-current opacity-50 shrink-0" />
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
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
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-brand-50 via-[#f2f0ef] to-brand-100 text-gray-800">
      {/* ── TOP BAR ── */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-brand-200 flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 shadow-sm shrink-0 z-30">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-brand-50 text-gray-500"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <img src={siLogo} alt="Speed Innovations" className="h-14 w-auto object-contain" />
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
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </div>
        </aside>

        {/* ── DESKTOP SIDEBAR: single unified collapsible column ── */}
        <aside
          className={`hidden lg:flex flex-col shrink-0 bg-white/90 backdrop-blur-sm border-r border-brand-200 transition-all duration-300 ease-in-out ${
            expanded ? "w-64" : "w-16"
          }`}
        >
          {/* Nav (scrollable) */}
          <div className="flex-1 overflow-hidden pt-2">
            <SidebarContent onLinkClick={() => {}} collapsed={!expanded} />
          </div>

          {/* Footer: collapse toggle + user zone */}
          <div className="shrink-0 border-t border-brand-200 p-2">
            <button
              onClick={() => setExpanded(p => !p)}
              title={expanded ? "Collapse sidebar" : "Expand sidebar"}
              className={`h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-brand-50 hover:text-brand-600 transition-colors mb-2 ${
                expanded ? "w-8 ml-auto" : "w-10 mx-auto"
              }`}
            >
              {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            {expanded ? (
              <div className="flex items-center gap-2.5 px-1">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-700 truncate">{userName}</p>
                  <p className="text-[10px] text-gray-400 truncate">Speed IT Innovations</p>
                </div>
                <button
                  onClick={handleLogoff}
                  title="Log Off"
                  className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                title={userName}
                onClick={handleLogoff}
                className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
              >
                {userInitial}
              </button>
            )}
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-5">{children}</main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-brand-200 px-4 py-1.5 flex items-center justify-center flex-wrap gap-2 sm:gap-8 text-xs text-gray-400 shrink-0">
        <span>Version 1.0.0</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Login: {new Date().toLocaleString()}</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Duration: 0h 0m</span>
      </footer>
    </div>
  );
}
