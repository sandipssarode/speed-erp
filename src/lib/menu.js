import {
  Database, Settings, ShoppingCart, BarChart2, Package, DollarSign, Wrench,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MENU CONFIG  (icon = component ref, not JSX)
// ─────────────────────────────────────────────────────────────
export const menu = [
  {
    label: "Masters", icon: Database, flat: true,
    links: [
      // Geographic — base reference, feeds into address fields everywhere
      { label: "Country",               path: "/system/countries" },
      { label: "State",                 path: "/system/states" },
      { label: "District",              path: "/masters/district" },
      { label: "Village",                path: "/masters/village-taluka" },
      // HR — Department feeds Designation, Designation feeds Employee
      { label: "Department",            path: "/masters/department" },
      { label: "Designation",           path: "/masters/designation" },
      { label: "Employee Registration", path: "/masters/employee" },
      // Parties
      { label: "Vendor",                path: "/vendors" },
      { label: "Customer",              path: "/sales/customers" },
      // Products — Type → Sub-type → Product; Unit Type → UOM feeds Product
      { label: "Unit Type",             path: "/masters/unit-type" },
      { label: "Unit",                   path: "/masters/uom" },
      { label: "Product Type",          path: "/masters/product-type" },
      { label: "Product Sub-Type",      path: "/masters/product-subtype" },
      { label: "Product",               path: "/masters/product-master" },
      // Assets — Structure → Type → Asset → Maintenance Type → Work Order Type
      { label: "Asset Structure",       path: "/masters/asset-structure" },
      { label: "Asset Type",            path: "/masters/asset-type" },
      { label: "Asset",                 path: "/masters/asset-master" },
      { label: "Maintenance Type",      path: "/masters/maintenance-type" },
      { label: "Work Order Type",       path: "/masters/work-order-type" },
    ],
  },
  {
    label: "Asset Management", icon: Wrench,
    children: {
      Transaction: [
        { label: "Work Order", path: "/asset-management/work-order" },
        { label: "Job List",   path: "/asset-management/job-list" },
        { label: "Resources",  path: "/asset-management/resources" },
      ],
    },
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
  {
    label: "System Setup", icon: Settings, flat: true,
    links: [
      { label: "Users",              path: "/system/users" },
      { label: "Access Rights",      path: "/system/access-rights" },
      { label: "Organisation",       path: "/system/organisations" },
      { label: "Business Unit",      path: "/system/business-units" },
      { label: "Warehouse",          path: "/system/warehouses" },
      { label: "Document Series",    path: "/system/document-series" },
      { label: "Financial Year",     path: "/system/financial-year" },
      { label: "Email Configuration", path: "/system/email-config" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
export function isModuleActive(mod, pathname) {
  if (mod.flat) return mod.links.some(l => pathname.startsWith(l.path));
  return Object.values(mod.children).flat().some(l => pathname.startsWith(l.path));
}

export function getActiveState(pathname) {
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
