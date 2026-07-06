import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import BusinessUnitList from "./pages/business-units/BusinessUnitList";
import BusinessUnitForm from "./pages/business-units/BusinessUnitForm";
import OrganisationList from "./pages/organisations/OrganisationList";
import OrganisationForm from "./pages/organisations/OrganisationForm";
import WorkInProgress from "./pages/WorkInProgress";
import AssetStructureList from "./pages/masters/asset-structure/AssetStructureList";
import AssetStructureForm from "./pages/masters/asset-structure/AssetStructureForm";
import AssetTypeList from "./pages/masters/asset-type/AssetTypeList";
import AssetTypeForm from "./pages/masters/asset-type/AssetTypeForm";
import AssetMasterList from "./pages/masters/asset-master/AssetMasterList";
import AssetMasterForm from "./pages/masters/asset-master/AssetMasterForm";
import MaintenanceTypeList from "./pages/masters/maintenance-type/MaintenanceTypeList";
import MaintenanceTypeForm from "./pages/masters/maintenance-type/MaintenanceTypeForm";
import DistrictList from "./pages/masters/district/DistrictList";
import DistrictForm from "./pages/masters/district/DistrictForm";
import VillageTalukaList from "./pages/masters/village-taluka/VillageTalukaList";
import VillageTalukaForm from "./pages/masters/village-taluka/VillageTalukaForm";
import CountryList from "./pages/masters/country/CountryList";
import CountryForm from "./pages/masters/country/CountryForm";
import StateList from "./pages/masters/state/StateList";
import StateForm from "./pages/masters/state/StateForm";
import ProductTypeList from "./pages/masters/product-type/ProductTypeList";
import ProductTypeForm from "./pages/masters/product-type/ProductTypeForm";
import ProductSubtypeList from "./pages/masters/product-subtype/ProductSubtypeList";
import ProductSubtypeForm from "./pages/masters/product-subtype/ProductSubtypeForm";
import ProductMasterList from "./pages/masters/product-master/ProductMasterList";
import ProductMasterForm from "./pages/masters/product-master/ProductMasterForm";
import DepartmentList from "./pages/masters/department/DepartmentList";
import DepartmentForm from "./pages/masters/department/DepartmentForm";
import DesignationList from "./pages/masters/designation/DesignationList";
import DesignationForm from "./pages/masters/designation/DesignationForm";
import EmployeeList from "./pages/masters/employee/EmployeeList";
import EmployeeForm from "./pages/masters/employee/EmployeeForm";
import WorkOrderList from "./pages/asset-management/WorkOrderList";
import WorkOrderForm from "./pages/asset-management/WorkOrderForm";
import WorkOrderTypeList from "./pages/asset-management/work-order-type/WorkOrderTypeList";
import WorkOrderTypeForm from "./pages/asset-management/work-order-type/WorkOrderTypeForm";
import UnitTypeList from "./pages/masters/unit-type/UnitTypeList";
import UnitTypeForm from "./pages/masters/unit-type/UnitTypeForm";
import UomList from "./pages/system-setup/uom/UomList";
import UomForm from "./pages/system-setup/uom/UomForm";
import JobList from "./pages/asset-management/job-list/JobList";
import JobForm from "./pages/asset-management/job-list/JobForm";
import ResourceList from "./pages/asset-management/resources/ResourceList";
import ResourceForm from "./pages/asset-management/resources/ResourceForm";

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

        {/* Masters — Unit Type */}
        <Route path="/masters/unit-type"      element={<UnitTypeList />} />
        <Route path="/masters/unit-type/new"  element={<UnitTypeForm />} />
        <Route path="/masters/unit-type/:id"  element={<UnitTypeForm />} />

        {/* Masters — Work Order Type */}
        <Route path="/masters/work-order-type"      element={<WorkOrderTypeList />} />
        <Route path="/masters/work-order-type/new"  element={<WorkOrderTypeForm />} />
        <Route path="/masters/work-order-type/:id"  element={<WorkOrderTypeForm />} />
        <Route path="/asset-management/work-order"     element={<WorkOrderList />} />
        <Route path="/asset-management/work-order/new" element={<WorkOrderForm />} />
        <Route path="/asset-management/work-order/:id" element={<WorkOrderForm />} />

        {/* Asset Management — Job List */}
        <Route path="/asset-management/job-list"     element={<JobList />} />
        <Route path="/asset-management/job-list/new" element={<JobForm />} />
        <Route path="/asset-management/job-list/:id" element={<JobForm />} />

        {/* Asset Management — Resources */}
        <Route path="/asset-management/resources"     element={<ResourceList />} />
        <Route path="/asset-management/resources/new" element={<ResourceForm />} />
        <Route path="/asset-management/resources/:id" element={<ResourceForm />} />

        {/* Module roots — redirect to dashboard (no landing pages) */}
        <Route path="/masters"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/asset-management" element={<Navigate to="/dashboard" replace />} />
        <Route path="/purchase"         element={<Navigate to="/dashboard" replace />} />
        <Route path="/sales"            element={<Navigate to="/dashboard" replace />} />
        <Route path="/inventory"        element={<Navigate to="/dashboard" replace />} />
        <Route path="/finance"          element={<Navigate to="/dashboard" replace />} />
        <Route path="/system"           element={<Navigate to="/dashboard" replace />} />

        {/* System Setup */}
        <Route path="/system/organisations" element={<OrganisationList />} />
        <Route path="/system/organisations/new" element={<OrganisationForm />} />
        <Route path="/system/organisations/:id" element={<OrganisationForm />} />
        <Route path="/system/users" element={<UserList />} />
        <Route path="/system/users/new" element={<UserForm />} />
        <Route path="/system/users/:id" element={<UserForm />} />
        <Route path="/system/warehouses" element={<WarehouseList />} />
        <Route path="/system/warehouses/new" element={<WarehouseForm />} />
        <Route path="/system/warehouses/:id" element={<WarehouseForm />} />
        <Route path="/system/business-units" element={<BusinessUnitList />} />
        <Route path="/system/business-units/new" element={<BusinessUnitForm />} />
        <Route path="/system/business-units/:id" element={<BusinessUnitForm />} />
        <Route path="/system/states"         element={<StateList />} />
        <Route path="/system/states/new"     element={<StateForm />} />
        <Route path="/system/states/:id"     element={<StateForm />} />
        <Route path="/system/countries"      element={<CountryList />} />
        <Route path="/system/countries/new"  element={<CountryForm />} />
        <Route path="/system/countries/:id"  element={<CountryForm />} />
        <Route path="/masters/uom"      element={<UomList />} />
        <Route path="/masters/uom/new"  element={<UomForm />} />
        <Route path="/masters/uom/:id"  element={<UomForm />} />
        <Route path="/system/uom"       element={<Navigate to="/masters/uom" replace />} />
        <Route path="/system/document-series" element={<WorkInProgress />} />
        <Route path="/system/financial-year" element={<WorkInProgress />} />
        <Route path="/system/email-config" element={<WorkInProgress />} />
        <Route path="/system/department" element={<Navigate to="/masters/department" replace />} />
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

        {/* Masters — Asset Management */}
        <Route path="/masters/asset-structure"      element={<AssetStructureList />} />
        <Route path="/masters/asset-structure/new"  element={<AssetStructureForm />} />
        <Route path="/masters/asset-structure/:id"  element={<AssetStructureForm />} />
        <Route path="/masters/asset-type"           element={<AssetTypeList />} />
        <Route path="/masters/asset-type/new"       element={<AssetTypeForm />} />
        <Route path="/masters/asset-type/:id"       element={<AssetTypeForm />} />
        <Route path="/masters/asset-master"         element={<AssetMasterList />} />
        <Route path="/masters/asset-master/new"     element={<AssetMasterForm />} />
        <Route path="/masters/asset-master/:id"     element={<AssetMasterForm />} />
        <Route path="/masters/maintenance-type"     element={<MaintenanceTypeList />} />
        <Route path="/masters/maintenance-type/new" element={<MaintenanceTypeForm />} />
        <Route path="/masters/maintenance-type/:id" element={<MaintenanceTypeForm />} />
        <Route path="/masters/district"             element={<DistrictList />} />
        <Route path="/masters/district/new"         element={<DistrictForm />} />
        <Route path="/masters/district/:id"         element={<DistrictForm />} />
        <Route path="/masters/village-taluka"       element={<VillageTalukaList />} />
        <Route path="/masters/village-taluka/new"   element={<VillageTalukaForm />} />
        <Route path="/masters/village-taluka/:id"   element={<VillageTalukaForm />} />
        <Route path="/masters/product-type"         element={<ProductTypeList />} />
        <Route path="/masters/product-type/new"     element={<ProductTypeForm />} />
        <Route path="/masters/product-type/:id"     element={<ProductTypeForm />} />
        <Route path="/masters/product-subtype"      element={<ProductSubtypeList />} />
        <Route path="/masters/product-subtype/new"  element={<ProductSubtypeForm />} />
        <Route path="/masters/product-subtype/:id"  element={<ProductSubtypeForm />} />
        <Route path="/masters/product-master"       element={<ProductMasterList />} />
        <Route path="/masters/product-master/new"   element={<ProductMasterForm />} />
        <Route path="/masters/product-master/:id"   element={<ProductMasterForm />} />
        <Route path="/masters/department"           element={<DepartmentList />} />
        <Route path="/masters/department/new"       element={<DepartmentForm />} />
        <Route path="/masters/department/:id"       element={<DepartmentForm />} />
        <Route path="/masters/designation"          element={<DesignationList />} />
        <Route path="/masters/designation/new"      element={<DesignationForm />} />
        <Route path="/masters/designation/:id"      element={<DesignationForm />} />
        <Route path="/masters/employee"             element={<EmployeeList />} />
        <Route path="/masters/employee/new"         element={<EmployeeForm />} />
        <Route path="/masters/employee/:id"         element={<EmployeeForm />} />

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
