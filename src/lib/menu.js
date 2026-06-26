import {
  Database, Settings, ShoppingCart, BarChart2, Package, DollarSign, Wrench,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MENU CONFIG  (icon = component ref, not JSX)
// ─────────────────────────────────────────────────────────────
export const menu = [
  {
    label: "Masters", icon: Database, flat: true, landing: "/masters",
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
      { label: "Asset Structure",          path: "/masters/asset-structure" },
      { label: "Asset Type",               path: "/masters/asset-type" },
      { label: "Asset Master",             path: "/masters/asset-master" },
      { label: "Maintenance Type",         path: "/masters/maintenance-type" },
    ],
  },
  {
    label: "Asset Management", icon: Wrench, landing: "/asset-management",
    children: {
      Masters: [
        { label: "Work Order Type", path: "/asset-management/work-order-type" },
      ],
      Transaction: [
        { label: "Work Order", path: "/asset-management/work-order" },
      ],
    },
  },
  {
    label: "Purchase", icon: ShoppingCart, landing: "/purchase",
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
    label: "Sales", icon: BarChart2, landing: "/sales",
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
    label: "Inventory", icon: Package, landing: "/inventory",
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
    label: "Finance", icon: DollarSign, landing: "/finance",
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
    label: "System Setup", icon: Settings, flat: true, landing: "/system",
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
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
export function isModuleActive(mod, pathname) {
  if (pathname === mod.landing) return true;
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
