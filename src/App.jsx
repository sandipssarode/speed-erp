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
import CustomerList from "./pages/customers/CustomerList";
import CustomerForm from "./pages/customers/CustomerForm";
import ProductList from "./pages/products/ProductList";
import ProductForm from "./pages/products/ProductForm";

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

        {/* System Setup — User Master moved here */}
        <Route path="/system/users" element={<UserList />} />
        <Route path="/system/users/new" element={<UserForm />} />
        <Route path="/system/users/:id" element={<UserForm />} />

        {/* Vendor Master */}
        <Route path="/vendors" element={<VendorList />} />
        <Route path="/vendors/new" element={<VendorForm />} />
        <Route path="/vendors/:id" element={<VendorForm />} />

        {/* Customer Master */}
        <Route path="/sales/customers" element={<CustomerList />} />
        <Route path="/sales/customers/new" element={<CustomerForm />} />
        <Route path="/sales/customers/:id" element={<CustomerForm />} />

        {/* Product Master */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id" element={<ProductForm />} />

        {/* Purchase Transactions */}
        <Route path="/purchase/order" element={<PurchaseOrderList />} />
        <Route path="/purchase/quotation-comparison" element={<QuotationComparison />} />
        <Route path="/purchase/inquiry" element={<PurchaseInquiry />} />
        <Route path="/purchase/requisition" element={<PurchaseRequisition />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
