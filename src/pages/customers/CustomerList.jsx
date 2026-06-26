import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  ChevronsUpDown,
} from "lucide-react";
import { api } from "../../lib/api.js";

const PAGE_SIZE = 12;

const _REMOVED = [
  {
    id: "2001",
    code: "C001", name: "Infosys BPO Solutions Ltd", group: "Corporate",
    currency: "INR", ledgerBalance: 325000, creditLimit: "1000000", creditDays: "60",
    isDeactivated: false, reference: "IBS-2022",
    corporateAddress: "Plot No. 44, Electronics City Phase I", corporateCountry: "India",
    corporateState: "Karnataka", corporateCity: "Bengaluru", corporatePinCode: "560100",
    phone: "9845012345", email: "accounts@infosysbpo.com", website: "https://infosys.com",
    shipToSameAsCorporate: true,
    shipToAddress: "Plot No. 44, Electronics City Phase I", shipToCountry: "India",
    shipToState: "Karnataka", shipToCity: "Bengaluru", shipToPinCode: "560100",
    shipToPhone: "", shipToEmail: "",
    billToSameAsShipTo: false,
    billToAddress: "EDC House, 3rd Floor, Rajiv Gandhi Nagar", billToCountry: "India",
    billToState: "Karnataka", billToCity: "Bengaluru", billToPinCode: "560029",
    billToGstNo: "29AACCI1234B1Z3", billToPanNo: "AACCI1234B",
    industry: "IT & Technology", segment: "Large Enterprise", salesperson: "Arjun Mehta",
    gstRegistrationNo: "29AACCI1234B1Z3", panNo: "AACCI1234B",
    gstRegistrationDate: "2017-07-01", markAsRCM: false,
    gstRegistrationStatus: "Registered", arnNo: "",
    contactPersons: [
      { id: "cp1", name: "Sneha Krishnan", designation: "Finance Manager", email: "sneha.k@infosysbpo.com", mobile: "9845012346", landline: "080-28523100", department: "Finance" },
      { id: "cp2", name: "Ravi Shankar", designation: "Procurement Head", email: "ravi.s@infosysbpo.com", mobile: "9845012347", landline: "", department: "Purchase" },
    ],
    terms: [
      { id: "t1", line: 1, term: "Payment Terms", description: "Payment within 60 days from invoice date via NEFT/RTGS." },
      { id: "t2", line: 2, term: "Delivery Terms", description: "Delivery at buyer's premises. All taxes extra as applicable." },
    ],
    deductionApplicable: true, deductionCode: "L001", lcApplicable: false, bgApplicable: false,
    accountReceivable: "A001", accountPayable: "",
    benfName: "Infosys BPO Solutions Ltd", benfEmail: "payments@infosysbpo.com", benfMobile: "9845012345",
    banks: [
      { id: "b1", bankName: "HDFC Bank", branch: "Electronic City", accountNo: "50100123456789", ifscCode: "HDFC0001001", swiftCode: "", accountType: "Current" },
    ],
    remark: "Preferred IT services customer. Annual contract renewal in March.",
    createdAt: "2024-01-15T09:00:00.000Z", updatedAt: "2025-04-10T11:30:00.000Z",
    createdBy: "Admin", updatedBy: "Arjun Mehta",
    changelog: [
      { timestamp: "2024-01-15T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-04-10T11:30:00.000Z", user: "Arjun Mehta", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "2002",
    code: "T001", name: "Tata Motors Ltd", group: "OEM",
    currency: "INR", ledgerBalance: 780000, creditLimit: "5000000", creditDays: "45",
    isDeactivated: false, reference: "TML-PNQ",
    corporateAddress: "Bombay House, 24 Homi Mody Street, Fort", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400001",
    phone: "9820011111", email: "procurement@tatamotors.com", website: "https://tatamotors.com",
    shipToSameAsCorporate: false,
    shipToAddress: "Pimpri Works, MIDC Pimpri", shipToCountry: "India",
    shipToState: "Maharashtra", shipToCity: "Pune", shipToPinCode: "411018",
    shipToPhone: "9820011112", shipToEmail: "dispatch@tatamotors.com",
    billToSameAsShipTo: false,
    billToAddress: "Bombay House, 24 Homi Mody Street, Fort", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400001",
    billToGstNo: "27AAACT2727Q1ZV", billToPanNo: "AAACT2727Q",
    industry: "Manufacturing", segment: "Large Enterprise", salesperson: "Priya Sharma",
    gstRegistrationNo: "27AAACT2727Q1ZV", panNo: "AAACT2727Q",
    gstRegistrationDate: "2017-08-10", markAsRCM: false,
    gstRegistrationStatus: "Registered", arnNo: "",
    contactPersons: [
      { id: "cp3", name: "Sunil Bhide", designation: "Purchase Manager", email: "sunil.bhide@tatamotors.com", mobile: "9820011113", landline: "020-66607101", department: "Purchase" },
    ],
    terms: [
      { id: "t3", line: 1, term: "Payment", description: "Net 45 days from date of invoice. TDS applicable as per IT Act." },
      { id: "t4", line: 2, term: "Inspection", description: "Goods subject to incoming quality inspection. Rejection within 7 days." },
    ],
    deductionApplicable: true, deductionCode: "L001", lcApplicable: false, bgApplicable: true,
    accountReceivable: "A001", accountPayable: "",
    benfName: "Tata Motors Ltd", benfEmail: "sunil.bhide@tatamotors.com", benfMobile: "9820011113",
    banks: [
      { id: "b2", bankName: "State Bank of India", branch: "Fort Mumbai", accountNo: "10012345678", ifscCode: "SBIN0000300", swiftCode: "SBININBB", accountType: "Current" },
    ],
    remark: "Strategic OEM customer. BG required for new orders above ₹25 lakhs.",
    createdAt: "2023-11-20T10:00:00.000Z", updatedAt: "2025-05-01T09:00:00.000Z",
    createdBy: "Admin", updatedBy: "Priya Sharma",
    changelog: [
      { timestamp: "2023-11-20T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-05-01T09:00:00.000Z", user: "Priya Sharma", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "2003",
    code: "F001", name: "Flipkart India Pvt Ltd", group: "E-Commerce",
    currency: "INR", ledgerBalance: 54000, creditLimit: "500000", creditDays: "30",
    isDeactivated: false, reference: "FK-VND-0019",
    corporateAddress: "Embassy Tech Village, Outer Ring Road", corporateCountry: "India",
    corporateState: "Karnataka", corporateCity: "Bengaluru", corporatePinCode: "560103",
    phone: "9886001100", email: "vendor.relations@flipkart.com", website: "https://flipkart.com",
    shipToSameAsCorporate: false,
    shipToAddress: "Flipkart Warehouse, Plot 14, Bilaspur Road", shipToCountry: "India",
    shipToState: "Haryana", shipToCity: "Gurugram", shipToPinCode: "122001",
    shipToPhone: "9886001101", shipToEmail: "wh.gurugram@flipkart.com",
    billToSameAsShipTo: false,
    billToAddress: "Embassy Tech Village, Outer Ring Road", billToCountry: "India",
    billToState: "Karnataka", billToCity: "Bengaluru", billToPinCode: "560103",
    billToGstNo: "29AABCF8837A1ZF", billToPanNo: "AABCF8837A",
    industry: "Trading", segment: "Large Enterprise", salesperson: "Arjun Mehta",
    gstRegistrationNo: "29AABCF8837A1ZF", panNo: "AABCF8837A",
    gstRegistrationDate: "2017-08-15", markAsRCM: false,
    gstRegistrationStatus: "Registered", arnNo: "",
    contactPersons: [
      { id: "cp4", name: "Ananya Rao", designation: "Category Manager", email: "ananya.rao@flipkart.com", mobile: "9886001102", landline: "080-61561100", department: "Category" },
      { id: "cp5", name: "Deepak Nair", designation: "Accounts Payable", email: "deepak.nair@flipkart.com", mobile: "9886001103", landline: "", department: "Finance" },
    ],
    terms: [
      { id: "t5", line: 1, term: "Payment", description: "Payment 30 days from acceptance of goods on portal." },
    ],
    deductionApplicable: false, deductionCode: "", lcApplicable: false, bgApplicable: false,
    accountReceivable: "A002", accountPayable: "",
    benfName: "Flipkart India Pvt Ltd", benfEmail: "deepak.nair@flipkart.com", benfMobile: "9886001103",
    banks: [
      { id: "b3", bankName: "ICICI Bank", branch: "Indiranagar", accountNo: "123456789012", ifscCode: "ICIC0000123", swiftCode: "", accountType: "Current" },
    ],
    remark: "E-commerce marketplace customer. Orders raised via seller portal only.",
    createdAt: "2024-03-01T10:00:00.000Z", updatedAt: "2024-12-15T14:00:00.000Z",
    createdBy: "Admin", updatedBy: "Arjun Mehta",
    changelog: [
      { timestamp: "2024-03-01T10:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2024-12-15T14:00:00.000Z", user: "Arjun Mehta", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "2004",
    code: "G001", name: "Maharashtra PWD", group: "Government",
    currency: "INR", ledgerBalance: 0, creditLimit: "2000000", creditDays: "90",
    isDeactivated: false, reference: "MPWD-2024",
    corporateAddress: "PWD Bhavan, Mazgaon", corporateCountry: "India",
    corporateState: "Maharashtra", corporateCity: "Mumbai", corporatePinCode: "400010",
    phone: "9920100200", email: "procurement@mpwd.gov.in", website: "",
    shipToSameAsCorporate: true,
    shipToAddress: "PWD Bhavan, Mazgaon", shipToCountry: "India",
    shipToState: "Maharashtra", shipToCity: "Mumbai", shipToPinCode: "400010",
    shipToPhone: "", shipToEmail: "",
    billToSameAsShipTo: true,
    billToAddress: "PWD Bhavan, Mazgaon", billToCountry: "India",
    billToState: "Maharashtra", billToCity: "Mumbai", billToPinCode: "400010",
    billToGstNo: "27AAAAG1234A1ZP", billToPanNo: "AAAAG1234A",
    industry: "Construction", segment: "Government", salesperson: "Priya Sharma",
    gstRegistrationNo: "27AAAAG1234A1ZP", panNo: "AAAAG1234A",
    gstRegistrationDate: "2017-09-01", markAsRCM: false,
    gstRegistrationStatus: "Exempt", arnNo: "",
    contactPersons: [
      { id: "cp6", name: "Rajesh Kamble", designation: "Asst. Engineer", email: "rajesh.kamble@mpwd.gov.in", mobile: "9920100201", landline: "022-23004000", department: "Engineering" },
    ],
    terms: [
      { id: "t6", line: 1, term: "Payment", description: "Payment via government treasury within 90 days of certified bill submission." },
      { id: "t7", line: 2, term: "Security Deposit", description: "2.5% security deposit applicable on all contracts above ₹10 lakhs." },
    ],
    deductionApplicable: true, deductionCode: "L001", lcApplicable: false, bgApplicable: true,
    accountReceivable: "A001", accountPayable: "",
    benfName: "", benfEmail: "", benfMobile: "",
    banks: [],
    remark: "Government customer — exempt from GST. All invoices need countersignature by AE.",
    createdAt: "2024-04-05T09:00:00.000Z", updatedAt: "2025-01-20T10:00:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [
      { timestamp: "2024-04-05T09:00:00.000Z", user: "Admin", action: "Created", changes: "Record created" },
      { timestamp: "2025-01-20T10:00:00.000Z", user: "Admin", action: "Updated", changes: "Record updated" },
    ],
  },
  {
    id: "2005",
    code: "E001", name: "Global Tech Exports LLC", group: "Export",
    currency: "USD", ledgerBalance: 0, creditLimit: "3000000", creditDays: "60",
    isDeactivated: true, reference: "GTE-2023",
    corporateAddress: "Office 901, Al Sila Tower, ADGM Square", corporateCountry: "UAE",
    corporateState: "Abu Dhabi", corporateCity: "Abu Dhabi", corporatePinCode: "",
    phone: "+971501234567", email: "orders@globaltechexports.ae", website: "https://globaltechexports.ae",
    shipToSameAsCorporate: false,
    shipToAddress: "Warehouse 12, Jebel Ali Free Zone", shipToCountry: "UAE",
    shipToState: "Dubai", shipToCity: "Dubai", shipToPinCode: "",
    shipToPhone: "+971504567890", shipToEmail: "dispatch@globaltechexports.ae",
    billToSameAsShipTo: false,
    billToAddress: "Office 901, Al Sila Tower, ADGM Square", billToCountry: "UAE",
    billToState: "Abu Dhabi", billToCity: "Abu Dhabi", billToPinCode: "",
    billToGstNo: "", billToPanNo: "",
    industry: "Trading", segment: "MNC", salesperson: "Arjun Mehta",
    gstRegistrationNo: "", panNo: "",
    gstRegistrationDate: "", markAsRCM: false,
    gstRegistrationStatus: "Unregistered", arnNo: "",
    contactPersons: [
      { id: "cp7", name: "James Walker", designation: "CEO", email: "james@globaltechexports.ae", mobile: "+971501234568", landline: "+97124123456", department: "Management" },
    ],
    terms: [
      { id: "t8", line: 1, term: "Payment", description: "LC at sight or advance TT before shipment for orders above USD 50,000." },
      { id: "t9", line: 2, term: "Shipment", description: "FOB Mumbai port. Insurance by buyer." },
    ],
    deductionApplicable: false, deductionCode: "", lcApplicable: true, bgApplicable: false,
    accountReceivable: "A002", accountPayable: "",
    benfName: "Global Tech Exports LLC", benfEmail: "james@globaltechexports.ae", benfMobile: "+971501234567",
    banks: [
      { id: "b4", bankName: "HSBC Bank", branch: "ADGM Branch", accountNo: "AE070331234567890123456", ifscCode: "", swiftCode: "HSBCAEAD", accountType: "Current" },
    ],
    remark: "Deactivated — contract lapsed Dec 2024. Reactivate only after new agreement.",
    createdAt: "2023-08-01T08:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z",
    createdBy: "Admin", updatedBy: "Admin",
    changelog: [],
  },
];
void _REMOVED; // suppress unused warning — seed data lives in api/init.js

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterGroup, setFilterGroup] = useState("all");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/api/customers")
      .then(setCustomers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setPage(1); }, [search, filterStatus, filterGroup]);

  const groups = [...new Set(customers.map((c) => c.group).filter(Boolean))];

  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        c.code?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.group?.toLowerCase().includes(q) ||
        c.gstRegistrationNo?.toLowerCase().includes(q) ||
        c.corporateCity?.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !c.isDeactivated) ||
        (filterStatus === "inactive" && c.isDeactivated);
      const matchGroup = filterGroup === "all" || c.group === filterGroup;
      return matchSearch && matchStatus && matchGroup;
    })
    .sort((a, b) => {
      const r = (a.name || "").localeCompare(b.name || "");
      return sortDir === "asc" ? r : -r;
    });

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete customer "${name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/api/customers/${id}`);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const th =
    "text-left px-5 py-3.5 text-[11px] font-bold text-white/90 uppercase tracking-wider";
  const actionBtn =
    "w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 transition-colors";

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Customer Master
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage customers, groups &amp; GST details
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="relative min-w-[130px]">
            <SlidersHorizontal
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-10 pr-9 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronRight
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
            />
          </div>

          <div className="relative min-w-[130px]">
            <select
              value={filterGroup}
              onChange={(e) => setFilterGroup(e.target.value)}
              className="appearance-none pl-4 pr-9 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer"
            >
              <option value="all">All Groups</option>
              {groups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronRight
              size={15}
              className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none"
            />
          </div>

          <button
            onClick={() => navigate("/sales/customers/new")}
            className="ml-auto flex items-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-brand-200 transition-all"
          >
            <Plus size={16} /> New Customer
          </button>
        </div>

        {/* Table card */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead>
                <tr className="bg-gradient-to-r from-brand-800 to-brand-600">
                  <th className={th}>
                    <button
                      onClick={() =>
                        setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                      }
                      className="inline-flex items-center gap-1.5 hover:text-white"
                    >
                      Customer Name <ChevronsUpDown size={13} className="opacity-70" />
                    </button>
                  </th>
                  <th className={th}>Code</th>
                  <th className={th}>Group</th>
                  <th className={th}>City</th>
                  <th className={th}>GST No</th>
                  <th className={th}>Currency</th>
                  <th className={th}>Status</th>
                  <th className={`${th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-16 text-gray-400 text-sm"
                    >
                      {customers.length === 0
                        ? 'No customers yet. Click "New Customer" to add one.'
                        : "No customers match your search."}
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
                    <tr
                      key={c.id}
                      className="group border-b border-gray-100 last:border-0 hover:bg-brand-100 cursor-pointer transition-colors"
                      onClick={() => navigate(`/sales/customers/${c.id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-lg bg-brand-50 ring-1 ring-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {(c.code || c.name || "?").slice(0, 2).toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-800 group-hover:text-brand-600 transition-colors">
                            {c.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-400">
                        {c.code}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {c.group || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {c.corporateCity || "—"}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">
                        {c.gstRegistrationNo || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {c.currency || "INR"}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.isDeactivated ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${c.isDeactivated ? "bg-red-500" : "bg-green-500"}`}
                          />
                          {c.isDeactivated ? "Inactive" : "Active"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/sales/customers/${c.id}`)}
                            className={`${actionBtn} hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200`}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id, c.name)}
                            className={`${actionBtn} hover:bg-red-50 hover:text-red-600 hover:border-red-200`}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 text-sm flex-wrap gap-3">
              <span className="text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-700">
                  {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700">
                  {filtered.length}
                </span>{" "}
                customers
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  <ChevronLeft size={15} /> Prev
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${p === page ? "bg-brand-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pageCount}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

