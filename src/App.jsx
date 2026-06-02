import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/Dashboard";
import VendorList from "./pages/vendors/VendorList";
import VendorForm from "./pages/vendors/VendorForm";
import UserList from "./pages/users/UserList";
import UserForm from "./pages/users/UserForm";
import PurchaseOrderList from "./pages/purchase/PurchaseOrderList";
import QuotationComparison from "./pages/purchase/QuotationComparison";
import PurchaseInquiry from "./pages/purchase/PurchaseInquiry";
import PurchaseRequisition from "./pages/purchase/PurchaseRequisition";
import PurchaseQuotation from "./pages/purchase/PurchaseQuotation";
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";
import WarehouseList from "./pages/warehouses/WarehouseList";
import WarehouseForm from "./pages/warehouses/WarehouseForm";
import WorkInProgress from "./pages/WorkInProgress";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<Signup />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* System Setup */}
        <Route path="/system/users" element={<UserList />} />
        <Route path="/system/users/new" element={<UserForm />} />
        <Route path="/system/users/:id" element={<UserForm />} />
        <Route path="/system/warehouses" element={<WarehouseList />} />
        <Route path="/system/warehouses/new" element={<WarehouseForm />} />
        <Route path="/system/warehouses/:id" element={<WarehouseForm />} />
        <Route path="/system/states" element={<WorkInProgress />} />
        <Route path="/system/countries" element={<WorkInProgress />} />
        <Route path="/system/uom" element={<WorkInProgress />} />
        <Route path="/system/document-series" element={<WorkInProgress />} />
        <Route path="/system/financial-year" element={<WorkInProgress />} />
        <Route path="/system/email-config" element={<WorkInProgress />} />
        <Route path="/system/department" element={<WorkInProgress />} />
        <Route path="/system/access-rights" element={<WorkInProgress />} />

        {/* Vendor Master */}
        <Route path="/vendors" element={<VendorList />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/:id" element={<VendorForm />} />

        {/* Purchase */}
        <Route path="/purchase/requisition" element={<PurchaseRequisition />} />
        <Route path="/purchase/inquiry" element={<PurchaseInquiry />} />
        <Route path="/purchase/quotation" element={<PurchaseQuotation />} />
        <Route path="/purchase/quotation-comparison" element={<QuotationComparison />} />
        <Route path="/purchase/order" element={<PurchaseOrderList />} />
        <Route path="/purchase/reports/pr" element={<WorkInProgress />} />
        <Route path="/purchase/reports/po" element={<WorkInProgress />} />
        <Route path="/purchase/settings" element={<WorkInProgress />} />
        <Route path="/purchase/approval-workflow" element={<WorkInProgress />} />

        {/* Sales */}
        <Route path="/sales/customers" element={<CustomerList />} />
        <Route path="/sales/customers/new" element={<CustomerForm />} />
        <Route path="/sales/customers/:id" element={<CustomerForm />} />
        <Route path="/sales/quotation" element={<WorkInProgress />} />
        <Route path="/sales/orders" element={<WorkInProgress />} />
        <Route path="/sales/delivery-challan" element={<WorkInProgress />} />
        <Route path="/sales/invoice" element={<WorkInProgress />} />
        <Route path="/sales/reports" element={<WorkInProgress />} />
        <Route path="/sales/outstanding" element={<WorkInProgress />} />
        <Route path="/sales/settings" element={<WorkInProgress />} />

        {/* Product Master */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductForm />} />

        {/* Inventory */}
        <Route path="/inventory/items" element={<WorkInProgress />} />
        <Route path="/inventory/warehouses" element={<WarehouseList />} />
        <Route path="/inventory/item-category" element={<WorkInProgress />} />
        <Route path="/inventory/grn" element={<WorkInProgress />} />
        <Route path="/inventory/transfer" element={<WorkInProgress />} />
        <Route path="/inventory/adjustment" element={<WorkInProgress />} />
        <Route path="/inventory/reports" element={<WorkInProgress />} />
        <Route path="/inventory/ledger" element={<WorkInProgress />} />
        <Route path="/inventory/settings" element={<WorkInProgress />} />

        {/* Finance */}
        <Route path="/finance/ledger" element={<WorkInProgress />} />
        <Route path="/finance/cost-centre" element={<WorkInProgress />} />
        <Route path="/finance/journal" element={<WorkInProgress />} />
        <Route path="/finance/payment" element={<WorkInProgress />} />
        <Route path="/finance/receipt" element={<WorkInProgress />} />
        <Route path="/finance/balance-sheet" element={<WorkInProgress />} />
        <Route path="/finance/pl" element={<WorkInProgress />} />
        <Route path="/finance/trial-balance" element={<WorkInProgress />} />
        <Route path="/finance/settings" element={<WorkInProgress />} />

        {/* Profile */}
        <Route path="/profile" element={<WorkInProgress />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
