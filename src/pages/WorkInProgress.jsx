import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/Layout";

const PAGE_NAMES = {
  states: "State Master",
  countries: "Country Master",
  uom: "Unit of Measure",
  "document-series": "Document Series",
  "financial-year": "Financial Year",
  "email-config": "Email Configuration",
  department: "Department Master",
  "access-rights": "Access Rights Management",
  quotation: "Sales Quotation",
  orders: "Sales Orders",
  "delivery-challan": "Delivery Challan",
  invoice: "Sales Invoice",
  reports: "Reports",
  outstanding: "Outstanding Report",
  settings: "Settings",
  items: "Item Master",
  warehouses: "Warehouse Master",
  "item-category": "Item Category",
  grn: "Material Receipt (GRN)",
  transfer: "Stock Transfer",
  adjustment: "Stock Adjustment",
  ledger: "Ledger Master",
  "cost-centre": "Cost Centre",
  journal: "Journal Entry",
  payment: "Payment Voucher",
  receipt: "Receipt Voucher",
  "balance-sheet": "Balance Sheet",
  pl: "P&L Statement",
  "trial-balance": "Trial Balance",
  "approval-workflow": "Approval Workflow",
  profile: "My Profile",
  pr: "PR Report",
  po: "PO Report",
};

function getPageName(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return (
    PAGE_NAMES[last] ||
    last.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
  );
}

// Slow-spinning gear SVG
function GearIcon({ className }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32 20a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-6 12a6 6 0 1 1 12 0 6 6 0 0 1-12 0z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.2 4a2 2 0 0 0-1.94 1.51L24.1 9.4a20.1 20.1 0 0 0-4.36 1.8l-3.7-2.18a2 2 0 0 0-2.43.32l-3.6 3.6a2 2 0 0 0-.32 2.43l2.18 3.7a20.1 20.1 0 0 0-1.8 4.36l-3.89 1.16A2 2 0 0 0 4.5 26.8v5.1a2 2 0 0 0 1.68 1.97l3.73.56c.44 1.52 1.06 2.97 1.83 4.32l-2.18 3.7a2 2 0 0 0 .32 2.43l3.6 3.6a2 2 0 0 0 2.43.32l3.7-2.18a20.1 20.1 0 0 0 4.36 1.8l1.16 3.9A2 2 0 0 0 27.06 54h5.1a2 2 0 0 0 1.97-1.68l.56-3.73a20.1 20.1 0 0 0 4.32-1.83l3.7 2.18a2 2 0 0 0 2.43-.32l3.6-3.6a2 2 0 0 0 .32-2.43l-2.18-3.7a20.1 20.1 0 0 0 1.8-4.36l3.9-1.16A2 2 0 0 0 54 31.14v-5.1a2 2 0 0 0-1.51-1.94l-3.89-1.04a20.1 20.1 0 0 0-1.8-4.36l2.18-3.7a2 2 0 0 0-.32-2.43l-3.6-3.6a2 2 0 0 0-2.43-.32l-3.7 2.18a20.1 20.1 0 0 0-4.36-1.8L33.3 5.51A2 2 0 0 0 31.36 4h-4.16zm2.3 6h.83l1.04 3.5a2 2 0 0 0 1.38 1.35 14.1 14.1 0 0 1 5.38 2.22 2 2 0 0 0 1.93.13l3.27-1.93 .59.59-1.93 3.27a2 2 0 0 0 .13 1.93 14.1 14.1 0 0 1 2.22 5.38 2 2 0 0 0 1.35 1.38l3.31.89v.83l-3.31.99a2 2 0 0 0-1.35 1.38 14.1 14.1 0 0 1-2.22 5.38 2 2 0 0 0-.13 1.93l1.93 3.27-.59.59-3.27-1.93a2 2 0 0 0-1.93.13 14.1 14.1 0 0 1-5.38 2.22 2 2 0 0 0-1.38 1.35l-.75 4.98h-.83l-.99-3.31a2 2 0 0 0-1.38-1.35 14.1 14.1 0 0 1-5.38-2.22 2 2 0 0 0-1.93-.13l-3.27 1.93-.59-.59 1.93-3.27a2 2 0 0 0-.13-1.93 14.1 14.1 0 0 1-2.22-5.38 2 2 0 0 0-1.35-1.38L10 32.64v-.83l3.5-1.04a2 2 0 0 0 1.35-1.38 14.1 14.1 0 0 1 2.22-5.38 2 2 0 0 0 .13-1.93l-1.93-3.27.59-.59 3.27 1.93a2 2 0 0 0 1.93-.13 14.1 14.1 0 0 1 5.38-2.22 2 2 0 0 0 1.38-1.35L29.5 10z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function WorkInProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const pageName = getPageName(location.pathname);

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 min-h-full p-8">
        <div className="max-w-lg w-full text-center">

          {/* Animated icon stack */}
          <div className="relative inline-flex items-center justify-center mb-8">
            {/* Outer pulse ring */}
            <span className="absolute inline-flex w-36 h-36 rounded-full bg-indigo-200 opacity-20 animate-ping" style={{ animationDuration: "2.5s" }} />
            {/* Middle soft ring */}
            <span className="absolute inline-flex w-28 h-28 rounded-full bg-indigo-100 opacity-40 animate-pulse" />
            {/* Icon circle */}
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)" }}>
              {/* Large bg gear (slow) */}
              <GearIcon className="absolute w-20 h-20 text-white/10"
                style={{ animation: "spin 12s linear infinite" }} />
              {/* Small offset gear */}
              <GearIcon className="absolute w-10 h-10 text-white/20 translate-x-5 -translate-y-5"
                style={{ animation: "spin 6s linear infinite reverse" }} />
              {/* Main gear */}
              <GearIcon className="relative w-12 h-12 text-white"
                style={{ animation: "spin 8s linear infinite" }} />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
            Work in Progress
          </div>

          {/* Page name */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">{pageName}</h1>

          {/* Description */}
          <p className="text-gray-500 text-sm leading-relaxed mb-2 max-w-sm mx-auto">
            Our team is actively building this module. It will be available in an upcoming release.
          </p>

          {/* Progress bar animation */}
          <div className="mx-auto max-w-xs mt-6 mb-8">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1.5">
              <span>Development progress</span>
              <span>In progress</span>
            </div>
            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  background: "linear-gradient(90deg, #4338ca, #7c3aed)",
                  animation: "wip-bar 3s ease-in-out infinite alternate",
                }}
              />
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm hover:opacity-90 active:scale-95 transition-all"
            style={{ background: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)" }}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10z" clipRule="evenodd" />
            </svg>
            Go Back
          </button>

        </div>
      </div>

      <style>{`
        @keyframes wip-bar {
          0%   { width: 35%; }
          100% { width: 72%; }
        }
      `}</style>
    </Layout>
  );
}
