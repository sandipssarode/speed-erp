import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { Plus, Search, Edit2, Trash2, ChevronRight } from "lucide-react";

// ─── Seed Data ───────────────────────────────────────────────
const SEED_VENDORS = [
  {
    id: "1001",
    code: "A001", name: "Aditya Steel & Alloys Pvt Ltd", group: "Manufacturer",
    currency: "INR", isManufacturer: true, isAgentDealer: false, isServiceJobwork: false,
    ledgerBalance: 245000, creditLimit: "500000", creditDays: "45",
    isDeactivated: false, reference: "ASA-2021",
    corporateAddress: "Plot No. 14, MIDC Industrial Area, Phase II", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Pune", corporatePinCode: "411019",
    phone: "9823456780", email: "accounts@adityasteel.com", website: "https://adityasteel.com",
    shipFromSameAsVendor: true,
    shipFromAddress: "Plot No. 14, MIDC Industrial Area, Phase II", shipFromCountry: "India",
    shipFromState: "Maharashtra", shipFromCity: "Pune", shipFromPinCode: "411019",
    billToSameAsShipFrom: false,
    billToAddress: "Office No. 301, Bund Garden Road", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Pune", billToPinCode: "411001",
    industry: "Manufacturing", segment: "Large Enterprise", buyer: "Ramesh Patil",
    gstRegistrationStatus: "Registered",
    gstRegistrationNo: "27AABCA1234A1Z5", panNo: "AABCA1234A",
    gstRegistrationDate: "2017-08-15", markAsRCM: false,
    arnNo: "", msmeCategory: "", msmeNo: "",
    contactPersons: [
      { id: "c1", name: "Suresh Aditya", designation: "Managing Director", email: "suresh@adityasteel.com", mobile: "9823456781", landline: "020-27456780", department: "Management" },
      { id: "c2", name: "Priya Kulkarni", designation: "Accounts Manager", email: "priya@adityasteel.com", mobile: "9823456782", landline: "", department: "Accounts" },
    ],
    terms: [
      { id: "t1", line: 1, term: "Payment Terms", description: "Payment within 45 days from invoice date via NEFT/RTGS." },
      { id: "t2", line: 2, term: "Delivery Terms", description: "Delivery within 21 working days from PO date. FOR destination." },
    ],
    deductionOnPurchaseBill: false, lcApplicable: false, bgApplicable: false,
    coaCode: "L001", accountReceivable: "A001", accountPayable: "L001",
    benfName: "Aditya Steel & Alloys Pvt Ltd", benfEmail: "payments@adityasteel.com", benfMobile: "9823456780",
    banks: [
      { id: "b1", bankName: "State Bank of India", branch: "MIDC Pune", city: "Pune", accountNo: "32145678901", ifscCode: "SBIN0012345", swiftCode: "", accountType: "Current" },
    ],
    remark: "Preferred vendor for structural steel. Quality certified ISO 9001:2015.",
    createdAt: "2024-01-10T09:30:00.000Z", updatedAt: "2025-03-15T11:20:00.000Z",
    createdBy: "Admin", updatedBy: "Ramesh Patil",
    changelog: [
      { timestamp: "2024-01-10T09:30:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-03-15T11:20:00.000Z", user: "Ramesh Patil", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "1002",
    code: "T001", name: "Technocraft Trading Co.", group: "Trader",
    currency: "INR", isManufacturer: false, isAgentDealer: true, isServiceJobwork: false,
    ledgerBalance: 87500, creditLimit: "200000", creditDays: "30",
    isDeactivated: false, reference: "TTC-022",
    corporateAddress: "Shop No. 7, Gala Complex, LBS Road", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400086",
    phone: "9867543210", email: "info@technocraft.in", website: "https://technocraft.in",
    shipFromSameAsVendor: false,
    shipFromAddress: "Warehouse No. 3, Turbhe MIDC", shipFromCountry: "India",
    shipFromState: "Maharashtra", shipFromCity: "Navi Mumbai", shipFromPinCode: "400705",
    billToSameAsShipFrom: false,
    billToAddress: "Shop No. 7, Gala Complex, LBS Road", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400086",
    industry: "Trading", segment: "SME", buyer: "Anita Sharma",
    gstRegistrationStatus: "Registered",
    gstRegistrationNo: "27AACCT5678B1Z3", panNo: "AACCT5678B",
    gstRegistrationDate: "2018-03-22", markAsRCM: false,
    arnNo: "", msmeCategory: "Small", msmeNo: "UDYAM-MH-27-0012345",
    contactPersons: [
      { id: "c3", name: "Nikhil Teli", designation: "Proprietor", email: "nikhil@technocraft.in", mobile: "9867543211", landline: "022-25634521", department: "Management" },
    ],
    terms: [
      { id: "t3", line: 1, term: "Payment", description: "Payment 30 days net from date of invoice." },
    ],
    deductionOnPurchaseBill: true, lcApplicable: false, bgApplicable: false,
    coaCode: "L002", accountReceivable: "A002", accountPayable: "L002",
    benfName: "Technocraft Trading Co.", benfEmail: "nikhil@technocraft.in", benfMobile: "9867543211",
    banks: [
      { id: "b2", bankName: "HDFC Bank", branch: "Mulund West", city: "Mumbai", accountNo: "50100234567890", ifscCode: "HDFC0001234", swiftCode: "", accountType: "Current" },
    ],
    remark: "Reliable trader for electronic components and hardware items.",
    createdAt: "2024-02-05T10:00:00.000Z", updatedAt: "2024-12-10T14:00:00.000Z",
    createdBy: "Admin", updatedBy: "Anita Sharma",
    changelog: [
      { timestamp: "2024-02-05T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2024-12-10T14:00:00.000Z", user: "Anita Sharma", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "1003",
    code: "S001", name: "SwiftLogix Services LLP", group: "Service Provider",
    currency: "INR", isManufacturer: false, isAgentDealer: false, isServiceJobwork: true,
    ledgerBalance: 32000, creditLimit: "100000", creditDays: "15",
    isDeactivated: false, reference: "",
    corporateAddress: "B-204, Solitaire Corporate Park, Chakala", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400093",
    phone: "9112345678", email: "billing@swiftlogix.in", website: "",
    shipFromSameAsVendor: true,
    shipFromAddress: "B-204, Solitaire Corporate Park, Chakala", shipFromCountry: "India",
    shipFromState: "Maharashtra", shipFromCity: "Mumbai", shipFromPinCode: "400093",
    billToSameAsShipFrom: true,
    billToAddress: "B-204, Solitaire Corporate Park, Chakala", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400093",
    industry: "Logistics", segment: "SME", buyer: "Ramesh Patil",
    gstRegistrationStatus: "Registered",
    gstRegistrationNo: "27AALLS1234C1Z7", panNo: "AALLS1234C",
    gstRegistrationDate: "2019-06-01", markAsRCM: true,
    arnNo: "", msmeCategory: "Micro", msmeNo: "UDYAM-MH-27-0023456",
    contactPersons: [
      { id: "c4", name: "Kavita Nair", designation: "Operations Head", email: "kavita@swiftlogix.in", mobile: "9112345679", landline: "022-66123456", department: "Operations" },
      { id: "c5", name: "Rajan Mehta", designation: "Accounts Executive", email: "rajan@swiftlogix.in", mobile: "9112345680", landline: "", department: "Accounts" },
    ],
    terms: [
      { id: "t4", line: 1, term: "Payment Terms", description: "Payment within 15 days from receipt of invoice." },
      { id: "t5", line: 2, term: "Service Terms", description: "Services as per agreed SLA. Any deviation to be reported within 48 hours." },
      { id: "t6", line: 3, term: "Cancellation", description: "48-hour notice required for service cancellation to avoid charges." },
    ],
    deductionOnPurchaseBill: false, lcApplicable: false, bgApplicable: false,
    coaCode: "L003", accountReceivable: "", accountPayable: "L003",
    benfName: "SwiftLogix Services LLP", benfEmail: "billing@swiftlogix.in", benfMobile: "9112345678",
    banks: [
      { id: "b3", bankName: "Axis Bank", branch: "Andheri East", city: "Mumbai", accountNo: "920010012345678", ifscCode: "UTIB0000123", swiftCode: "AXISINBB", accountType: "Current" },
    ],
    remark: "Handles all courier and freight forwarding. Contact Kavita for urgent shipments.",
    createdAt: "2024-03-20T08:45:00.000Z", updatedAt: "2025-01-08T16:30:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [
      { timestamp: "2024-03-20T08:45:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-01-08T16:30:00.000Z", user: "Admin", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "1004",
    code: "I001", name: "Indo Gulf Impex", group: "Importer",
    currency: "USD", isManufacturer: false, isAgentDealer: true, isServiceJobwork: false,
    ledgerBalance: 610000, creditLimit: "1500000", creditDays: "60",
    isDeactivated: false, reference: "IGI-INT-09",
    corporateAddress: "Office 12, Trade Centre, BKC", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400051",
    phone: "9920123456", email: "trade@indogulf.com", website: "https://indogulf.com",
    shipFromSameAsVendor: false,
    shipFromAddress: "JNPT CFS, Uran Road", shipFromCountry: "India",
    shipFromState: "Maharashtra", shipFromCity: "Navi Mumbai", shipFromPinCode: "400707",
    billToSameAsShipFrom: false,
    billToAddress: "Office 12, Trade Centre, BKC", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400051",
    industry: "Trading", segment: "Large Enterprise", buyer: "Anita Sharma",
    gstRegistrationStatus: "SEZ",
    gstRegistrationNo: "27AACIG7890D1Z1", panNo: "AACIG7890D",
    gstRegistrationDate: "2017-12-01", markAsRCM: false,
    arnNo: "", msmeCategory: "", msmeNo: "",
    contactPersons: [
      { id: "c6", name: "Farhan Sheikh", designation: "Director", email: "farhan@indogulf.com", mobile: "9920123457", landline: "022-61234567", department: "Management" },
    ],
    terms: [
      { id: "t7", line: 1, term: "Payment", description: "LC at sight or TT within 60 days of BL date." },
      { id: "t8", line: 2, term: "Insurance", description: "Cargo insurance to be arranged by buyer." },
    ],
    deductionOnPurchaseBill: false, lcApplicable: true, bgApplicable: false,
    coaCode: "L002", accountReceivable: "A002", accountPayable: "L002",
    benfName: "Indo Gulf Impex", benfEmail: "accounts@indogulf.com", benfMobile: "9920123456",
    banks: [
      { id: "b4", bankName: "Citibank", branch: "BKC Mumbai", city: "Mumbai", accountNo: "0123456789", ifscCode: "CITI0000001", swiftCode: "CITIINBX", accountType: "Current" },
      { id: "b5", bankName: "ICICI Bank", branch: "Nariman Point", city: "Mumbai", accountNo: "123456789012", ifscCode: "ICIC0000001", swiftCode: "ICICINBB", accountType: "Current" },
    ],
    remark: "Import vendor — USD billing. LC required for orders above $50,000.",
    createdAt: "2023-11-01T12:00:00.000Z", updatedAt: "2025-04-22T09:15:00.000Z",
    createdBy: "Admin", updatedBy: "Anita Sharma",
    changelog: [
      { timestamp: "2023-11-01T12:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-04-22T09:15:00.000Z", user: "Anita Sharma", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "1005",
    code: "C001", name: "CiviBuild Contractors Pvt Ltd", group: "Contractor",
    currency: "INR", isManufacturer: false, isAgentDealer: false, isServiceJobwork: true,
    ledgerBalance: 0, creditLimit: "300000", creditDays: "30",
    isDeactivated: true, reference: "CBC-OLD",
    corporateAddress: "Survey No. 45/2, Hadapsar Industrial Estate", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Pune", corporatePinCode: "411028",
    phone: "9765432100", email: "contact@civibuild.com", website: "",
    shipFromSameAsVendor: true,
    shipFromAddress: "Survey No. 45/2, Hadapsar Industrial Estate", shipFromCountry: "India",
    shipFromState: "Maharashtra", shipFromCity: "Pune", shipFromPinCode: "411028",
    billToSameAsShipFrom: true,
    billToAddress: "Survey No. 45/2, Hadapsar Industrial Estate", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Pune", billToPinCode: "411028",
    industry: "Construction", segment: "SME", buyer: "Ramesh Patil",
    gstRegistrationStatus: "Registered",
    gstRegistrationNo: "27AABCC2345E1Z9", panNo: "AABCC2345E",
    gstRegistrationDate: "2018-07-10", markAsRCM: false,
    arnNo: "", msmeCategory: "Small", msmeNo: "",
    contactPersons: [
      { id: "c7", name: "Deepak Chavan", designation: "Project Manager", email: "deepak@civibuild.com", mobile: "9765432101", landline: "020-24532100", department: "Projects" },
    ],
    terms: [
      { id: "t9", line: 1, term: "Payment", description: "Progress billing — 30% advance, 40% on midterm, 30% on completion." },
    ],
    deductionOnPurchaseBill: true, lcApplicable: false, bgApplicable: true,
    coaCode: "L003", accountReceivable: "", accountPayable: "L003",
    benfName: "CiviBuild Contractors Pvt Ltd", benfEmail: "deepak@civibuild.com", benfMobile: "9765432101",
    banks: [
      { id: "b6", bankName: "Bank of Maharashtra", branch: "Hadapsar", city: "Pune", accountNo: "60123456789", ifscCode: "MAHB0001234", swiftCode: "", accountType: "Current" },
    ],
    remark: "Deactivated — contract expired March 2025. Do not create new POs.",
    createdAt: "2023-06-15T11:00:00.000Z", updatedAt: "2025-03-31T17:00:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [
      { timestamp: "2023-06-15T11:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-03-31T17:00:00.000Z", user: "Admin", action: "Updated", changes: "Record updated" },
    ],
  },
];

export default function VendorList() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("vendors") || "[]");
    if (stored.length === 0) {
      // Seed with sample data on first load
      localStorage.setItem("vendors", JSON.stringify(SEED_VENDORS));
      setVendors(SEED_VENDORS);
    } else {
      setVendors(stored);
    }
  }, []);

  const groups = [...new Set(vendors.map((v) => v.group).filter(Boolean))];

  const filtered = vendors.filter((v) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.code?.toLowerCase().includes(q) ||
      v.name?.toLowerCase().includes(q) ||
      v.group?.toLowerCase().includes(q) ||
      v.gstRegistrationNo?.toLowerCase().includes(q) ||
      v.corporateCity?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && !v.isDeactivated) ||
      (filterStatus === "inactive" && v.isDeactivated);
    const matchGroup = filterGroup === "all" || v.group === filterGroup;
    return matchSearch && matchStatus && matchGroup;
  });

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    const updated = vendors.filter((v) => v.id !== id);
    localStorage.setItem("vendors", JSON.stringify(updated));
    setVendors(updated);
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
              <span>Purchase</span>
              <ChevronRight size={12} />
              <span>Master</span>
              <ChevronRight size={12} />
              <span className="text-gray-600 font-medium">Vendor Master</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Vendor Master</h1>
          </div>
          <button
            onClick={() => navigate("/vendors/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            <Plus size={15} /> Add New Vendor
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-gray-200 rounded p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search Code, Name, Group, GST No, City..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            <option value="all">All Groups</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <span className="ml-auto text-xs text-gray-400">
            {filtered.length} of {vendors.length} record(s)
          </span>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Vendor Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Group</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">City</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">GST No</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Currency</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-gray-400 text-sm">
                    {vendors.length === 0
                      ? 'No vendors yet. Click "Add New Vendor" to get started.'
                      : "No vendors match your search."}
                  </td>
                </tr>
              ) : (
                filtered.map((v, i) => (
                  <tr
                    key={v.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}
                    onClick={() => navigate(`/vendors/${v.id}`)}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-600">{v.code}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">
                      {v.name}
                      {v.isManufacturer && <span className="ml-1.5 text-xs bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">Mfg</span>}
                      {v.isServiceJobwork && <span className="ml-1.5 text-xs bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded">SVC</span>}
                      {v.isAgentDealer && <span className="ml-1.5 text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded">Agent</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{v.group || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{v.corporateCity || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{v.gstRegistrationNo || "—"}</td>
                    <td className="px-4 py-2.5 text-gray-600">{v.currency || "INR"}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        v.isDeactivated
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}>
                        {v.isDeactivated ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/vendors/${v.id}`)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.name)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-gray-400 text-right px-1">
            Showing {filtered.length} vendor(s)
          </p>
        )}
      </div>
    </Layout>
  );
}
