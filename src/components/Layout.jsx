import { useState } from "react";
import {
  LogOut,
  User,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  BarChart2,
  Package,
  DollarSign,
  Settings,
  LayoutDashboard,
  Menu,
  X,
  Database,
} from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

// ─────────────────────────────────────────────────────────────
// MENU CONFIG
// ─────────────────────────────────────────────────────────────
const menu = [
  {
    label: "System Setup",
    icon: <Settings size={15} className="shrink-0" />,
    flat: true,
    links: [
      { label: "User Master",                   path: "/system/users" },
      { label: "Organisation Master",            path: "/system/organisations" },
      { label: "Business Unit Master",          path: "/system/business-units" },
      { label: "Warehouse Master",              path: "/system/warehouses" },
      { label: "State Master",                  path: "/system/states" },
      { label: "Country Master",                path: "/system/countries" },
      { label: "UoM",                           path: "/system/uom" },
      { label: "Document Series",               path: "/system/document-series" },
      { label: "Financial Year",                path: "/system/financial-year" },
      { label: "Email Configuration",           path: "/system/email-config" },
      { label: "Department",                    path: "/system/department" },
      { label: "User Access Rights Management", path: "/system/access-rights" },
    ],
  },
  {
    label: "Purchase",
    icon: <ShoppingCart size={15} className="shrink-0" />,
    children: {
      Master: [
        { label: "Vendor Master",         path: "/vendors" },
      ],
      Transaction: [
        { label: "Purchase Requisition",   path: "/purchase/requisition" },
        { label: "Purchase Inquiry",       path: "/purchase/inquiry" },
        { label: "Purchase Quotation",     path: "/purchase/quotation" },
        { label: "Quotation Comparison",   path: "/purchase/quotation-comparison" },
        { label: "Purchase Order",         path: "/purchase/order" },
      ],
      Reports: [
        { label: "PR Report",             path: "/purchase/reports/pr" },
        { label: "PO Report",             path: "/purchase/reports/po" },
      ],
      Configuration: [
        { label: "PO Settings",           path: "/purchase/settings" },
        { label: "Approval Workflow",     path: "/purchase/approval-workflow" },
      ],
    },
  },
  {
    label: "Sales",
    icon: <BarChart2 size={15} className="shrink-0" />,
    children: {
      Master: [
        { label: "Customer Master",       path: "/sales/customers" },
        { label: "Product Master",        path: "/products" },
      ],
      Transaction: [
        { label: "Sales Quotation",       path: "/sales/quotation" },
        { label: "Sales Order",           path: "/sales/orders" },
        { label: "Delivery Challan",      path: "/sales/delivery-challan" },
        { label: "Sales Invoice",         path: "/sales/invoice" },
      ],
      Reports: [
        { label: "Sales Report",          path: "/sales/reports" },
        { label: "Outstanding Report",    path: "/sales/outstanding" },
      ],
      Configuration: [
        { label: "Sales Settings",        path: "/sales/settings" },
      ],
    },
  },
  {
    label: "Inventory",
    icon: <Package size={15} className="shrink-0" />,
    children: {
      Master: [
        { label: "Item Master",           path: "/inventory/items" },
        { label: "Warehouse Master",      path: "/inventory/warehouses" },
        { label: "Item Category",         path: "/inventory/item-category" },
      ],
      Transaction: [
        { label: "Material Receipt (GRN)",path: "/inventory/grn" },
        { label: "Stock Transfer",        path: "/inventory/transfer" },
        { label: "Stock Adjustment",      path: "/inventory/adjustment" },
      ],
      Reports: [
        { label: "Stock Report",          path: "/inventory/reports" },
        { label: "Stock Ledger",          path: "/inventory/ledger" },
      ],
      Configuration: [
        { label: "Inventory Settings",    path: "/inventory/settings" },
      ],
    },
  },
  {
    label: "Masters",
    icon: <Database size={15} className="shrink-0" />,
    children: {
      Master: [
        { label: "Asset Structure",  path: "/masters/asset-structure" },
        { label: "Asset Type",       path: "/masters/asset-type" },
        { label: "Asset Master",     path: "/masters/asset-master" },
        { label: "Maintenance Type", path: "/masters/maintenance-type" },
      ],
    },
  },
  {
    label: "Finance",
    icon: <DollarSign size={15} className="shrink-0" />,
    children: {
      Master: [
        { label: "Ledger Master",         path: "/finance/ledger" },
        { label: "Cost Centre",           path: "/finance/cost-centre" },
      ],
      Transaction: [
        { label: "Journal Entry",         path: "/finance/journal" },
        { label: "Payment Voucher",       path: "/finance/payment" },
        { label: "Receipt Voucher",       path: "/finance/receipt" },
      ],
      Reports: [
        { label: "Balance Sheet",         path: "/finance/balance-sheet" },
        { label: "P&L Statement",         path: "/finance/pl" },
        { label: "Trial Balance",         path: "/finance/trial-balance" },
      ],
      Configuration: [
        { label: "Finance Settings",      path: "/finance/settings" },
      ],
    },
  },
];

// ─────────────────────────────────────────────────────────────
// LAYOUT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  // Detect which module + section matches the current path so the
  // sidebar stays open even after navigation to a new page.
  const getActiveState = () => {
    const path = location.pathname;
    for (const mod of menu) {
      if (mod.flat) {
        if (mod.links.some((l) => path.startsWith(l.path))) {
          return { module: mod.label, section: null };
        }
      } else {
        for (const [section, links] of Object.entries(mod.children)) {
          if (links.some((l) => path.startsWith(l.path))) {
            return { module: mod.label, section };
          }
        }
      }
    }
    return { module: null, section: null };
  };

  const active = getActiveState();
  const [openModule,  setOpenModule]  = useState(active.module);
  const [openSection, setOpenSection] = useState(active.section);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogoff = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/");
  };

  const toggleModule = (label) => {
    setOpenModule((prev) => (prev === label ? null : label));
    setOpenSection(null);
  };

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 text-gray-800" style={{ fontFamily: "Inter, Arial, sans-serif" }}>

      {/* ── TOP BAR ── */}
      <header className="bg-white border-b border-gray-200 flex items-center justify-between px-3 lg:px-4 py-2 shadow-sm shrink-0">
        {/* Left — hamburger (mobile/tablet) + logo */}
        <div className="flex items-center gap-2 lg:gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <svg viewBox="0 0 48 48" className="w-8 h-8 shrink-0 rounded-lg shadow-sm">
            <defs>
              <linearGradient id="si-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#050d1a"/>
                <stop offset="100%" stopColor="#0f2045"/>
              </linearGradient>
              <linearGradient id="si-s" x1="34" y1="11" x2="12" y2="42" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e2d4ff"/>
                <stop offset="100%" stopColor="#60a5fa"/>
              </linearGradient>
            </defs>
            <rect width="48" height="48" rx="11" fill="url(#si-bg)"/>
            <path d="M 34 11 C 34 11 12 11 12 20 C 12 28 34 26 34 35 C 34 41 12 42 12 42"
              fill="none" stroke="url(#si-s)" strokeWidth="5.5" strokeLinecap="round"/>
            <circle cx="34" cy="11" r="3.5" fill="white"/>
            <circle cx="12" cy="42" r="2.5" fill="#93c5fd" fillOpacity="0.8"/>
          </svg>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none tracking-tight">Speed ERP</p>
            <p className="text-[10px] text-gray-500 leading-none mt-0.5 tracking-widest uppercase">Speed Innovations</p>
          </div>
        </div>

        {/* Right — user info + actions */}
        <div className="flex items-center gap-2">
          <div className="text-right mr-1 hidden sm:block">
            <p className="text-xs font-medium text-gray-700">{user.name || user.fullName || "Guest"}</p>
            <p className="text-xs text-gray-400">Speed IT Innovations</p>
          </div>
          <Link
            to="/profile"
            className="text-xs border border-gray-300 px-2 sm:px-3 py-1.5 rounded text-gray-600 hover:bg-gray-50 flex items-center gap-1"
          >
            <User size={13} /> <span className="hidden sm:inline">My Profile</span>
          </Link>
          <button
            onClick={handleLogoff}
            className="text-xs border border-gray-300 px-2 sm:px-3 py-1.5 rounded text-gray-600 hover:bg-gray-50 flex items-center gap-1"
          >
            <LogOut size={13} /> <span className="hidden sm:inline">Log Off</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">

        {/* ── SIDEBAR OVERLAY (mobile/tablet) ── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:inset-auto lg:z-auto lg:w-56 lg:translate-x-0 lg:transition-none lg:shrink-0
        `}>

          {/* Close button (mobile/tablet only) */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-700">Menu</span>
            <button onClick={closeSidebar} className="p-1 rounded hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>

          {/* Dashboard button */}
          <Link
            to="/dashboard"
            onClick={closeSidebar}
            className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b border-gray-100 transition-colors
              ${location.pathname === "/dashboard"
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-50"
              }`}
          >
            <LayoutDashboard size={16} className="shrink-0" />
            Dashboard
          </Link>

          {/* Menu items */}
          {menu.map((mod, i) => (
            <div key={mod.label}>

              {/* Module toggle button */}
              <button
                onClick={() => toggleModule(mod.label)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors
                  ${openModule === mod.label
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
              >
                <span className="flex items-center gap-2">
                  {mod.icon}
                  {mod.label}
                </span>
                <span className="text-gray-400">
                  {openModule === mod.label ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </span>
              </button>

              {/* Open module content */}
              {openModule === mod.label && (
                <div className="bg-gray-50 border-t border-gray-100">

                  {/* ── FLAT module (System Setup) ── */}
                  {mod.flat && (
                    <div className="py-1">
                      {mod.links.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={closeSidebar}
                          className={`block pl-8 pr-4 py-1.5 text-xs transition-colors
                            ${location.pathname === link.path
                              ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-500"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                            }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* ── SECTIONED module (Purchase, Sales, etc.) ── */}
                  {!mod.flat && Object.entries(mod.children).map(([section, links]) => (
                    <div key={section}>
                      <button
                        onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between px-5 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
                      >
                        {section}
                        {openSection === section ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      </button>

                      {openSection === section && (
                        <div className="pb-1">
                          {links.map((link) => (
                            <Link
                              key={link.path}
                              to={link.path}
                              onClick={closeSidebar}
                              className={`block pl-8 pr-4 py-1.5 text-xs transition-colors
                                ${location.pathname === link.path
                                  ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-500"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                }`}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                </div>
              )}

              {/* Divider between modules */}
              {i < menu.length - 1 && (
                <div className="border-t border-dashed border-gray-200 mx-4 my-0.5" />
              )}
            </div>
          ))}

          {/* Bottom spacer */}
          <div className="flex-1" />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-5">{children}</main>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 px-4 py-1.5 flex items-center justify-center flex-wrap gap-2 sm:gap-8 text-xs text-gray-400 shrink-0">
        <span>Version 1.0.0</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Login: {new Date().toLocaleString()}</span>
        <span className="hidden sm:inline">|</span>
        <span className="hidden sm:inline">Duration: 0h 0m</span>
      </footer>
    </div>
  );
}
