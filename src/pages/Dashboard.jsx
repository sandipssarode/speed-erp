import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import {
  ShoppingCart, BarChart2, Package, Users, TrendingUp, TrendingDown,
  Plus, ArrowRight, Clock, ChevronRight, Ticket, X, Bell,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend,
} from "recharts";

// ── Mock data ───────────────────────────────────────────────────
const kpis = [
  { label: "Open Purchase Orders", value: 20, trend: "+3", up: true,  gradient: "from-[#4b49ac] to-[#6d6bd6]", Icon: ShoppingCart },
  { label: "Open Sales Orders",    value: 15, trend: "+1", up: true,  gradient: "from-[#7da0fa] to-[#5b86f5]", Icon: BarChart2    },
  { label: "Pending GRNs",         value: 45, trend: "-5", up: false, gradient: "from-[#7978e9] to-[#9b9af0]", Icon: Package      },
  { label: "Total Employees",      value: 128, trend: "+2", up: true, gradient: "from-[#f3797e] to-[#f59ca0]", Icon: Users        },
];

const purchaseData = [
  { month: "Jan", amount: 420000 },
  { month: "Feb", amount: 380000 },
  { month: "Mar", amount: 510000 },
  { month: "Apr", amount: 470000 },
  { month: "May", amount: 620000 },
  { month: "Jun", amount: 580000 },
];

const salesData = [
  { month: "Jan", amount: 310000 },
  { month: "Feb", amount: 420000 },
  { month: "Mar", amount: 390000 },
  { month: "Apr", amount: 530000 },
  { month: "May", amount: 490000 },
  { month: "Jun", amount: 670000 },
];

const donutData = [
  { name: "Open POs",  value: 20, color: "#4b49ac" },
  { name: "Open SOs",  value: 15, color: "#7da0fa" },
  { name: "Completed", value: 65, color: "#e3e3f7" },
];

const recentTransactions = [
  { type: "PO",  name: "ABC Suppliers Ltd",       date: "Jun 22", amount: "₹1,24,500", status: "Open"        },
  { type: "SO",  name: "Reliance Industries",      date: "Jun 21", amount: "₹2,80,000", status: "In Progress" },
  { type: "PO",  name: "XYZ Raw Materials",        date: "Jun 20", amount: "₹56,200",   status: "Open"        },
  { type: "SO",  name: "Tata Steel Ltd",           date: "Jun 19", amount: "₹3,12,000", status: "Resolved"    },
  { type: "GRN", name: "Material Receipt #1042",   date: "Jun 18", amount: "₹98,400",   status: "Resolved"    },
];

const upcomingTasks = [
  { text: "Approve Purchase Order #PO-0245", due: "Today",   priority: "high"   },
  { text: "Review Sales Quotation #SQ-0089", due: "Tomorrow",priority: "medium" },
  { text: "GRN pending for PO #PO-0231",     due: "Jun 25", priority: "high"   },
  { text: "Employee onboarding — Rahul S.",  due: "Jun 26", priority: "low"    },
  { text: "Stock adjustment — Warehouse B",  due: "Jun 27", priority: "medium" },
];

const tickets = [
  { id: "TKT-001", subject: "PO approval stuck", module: "Purchase", priority: "High",   status: "Open"        },
  { id: "TKT-002", subject: "Invoice mismatch",  module: "Finance",  priority: "Medium", status: "In Progress" },
  { id: "TKT-003", subject: "Employee ID error", module: "HR",       priority: "Low",    status: "Resolved"    },
];

// ── Helpers ─────────────────────────────────────────────────────
const card = "bg-white/80 backdrop-blur-sm border border-white/70 shadow-lg rounded-2xl";

const statusStyle = (s) => {
  if (s === "Open")        return "bg-red-50 text-red-600 border border-red-200";
  if (s === "In Progress") return "bg-amber-50 text-amber-600 border border-amber-200";
  if (s === "Resolved")    return "bg-green-50 text-green-700 border border-green-200";
  return "bg-gray-100 text-gray-500";
};

const priorityDot = (p) => {
  if (p === "high")   return "bg-red-500";
  if (p === "medium") return "bg-amber-400";
  return "bg-green-400";
};

const fmt = (n) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-lg rounded-xl px-3 py-2 text-xs border border-gray-100">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-brand-600 font-bold">{fmt(payload[0].value)}</p>
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [ticketOpen, setTicketOpen] = useState(false);
  const [raiseOpen,  setRaiseOpen]  = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", module: "Purchase", priority: "Medium", description: "" });

  const totalOrders = donutData[0].value + donutData[1].value;
  const openTickets = tickets.filter(t => t.status !== "Resolved").length;

  return (
    <Layout>
      <div className="space-y-5 pb-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Overview of your operations at a glance</p>
          </div>
          <button
            onClick={() => setTicketOpen(v => !v)}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-brand-200 text-brand-600 hover:bg-brand-50 transition-colors"
          >
            <Ticket size={13} />
            Support Tickets
            {openTickets > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{openTickets}</span>
            )}
          </button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, trend, up, gradient, Icon }) => (
            <div key={label} className={`bg-gradient-to-br ${gradient} text-white rounded-2xl shadow-lg p-5 flex items-center gap-4`}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white/20">
                <Icon size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-white leading-none">{value}</p>
                <p className="text-xs text-white/80 mt-1 leading-tight">{label}</p>
              </div>
              <div className="ml-auto flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full shrink-0 bg-white/20 text-white">
                {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {trend}
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 2: Quick Actions | Business Overview | Upcoming Tasks ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Quick Actions */}
          <div className={`${card} p-5 flex flex-col gap-4`}>
            <div>
              <p className="text-sm font-semibold text-gray-800">Quick Actions</p>
              <p className="text-xs text-gray-400 mt-0.5">Common tasks at a glance</p>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Raise Purchase Order", path: "/purchase/requisition", color: "#4b49ac", Icon: ShoppingCart },
                { label: "Create Sales Order",   path: "/sales/orders",         color: "#7da0fa", Icon: BarChart2    },
                { label: "Add Employee",          path: "/masters/employee/new", color: "#7978e9", Icon: Users        },
              ].map(({ label, path, color, Icon }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 bg-white/60 hover:bg-white hover:shadow-sm transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "15" }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <ArrowRight size={13} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Business Overview — Donut */}
          <div className={`${card} p-5 flex flex-col`}>
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-800">Business Overview</p>
              <p className="text-xs text-gray-400 mt-0.5">Active order distribution</p>
            </div>
            <div className="flex-1 flex items-center justify-center relative min-h-[190px]">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="45%"
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 20, fontWeight: 700, fill: "#1F2937" }}>{totalOrders}</text>
                  <text x="50%" y="53%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: "#9CA3AF" }}>Total Orders</text>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ paddingTop: 8 }}
                    formatter={(value) => <span style={{ fontSize: 11, color: "#6B7280" }}>{value}</span>}
                  />
                  <Tooltip formatter={(v, name) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className={`${card} p-5 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Upcoming Tasks</p>
              <Bell size={14} className="text-gray-400" />
            </div>
            <div className="space-y-2.5 flex-1">
              {upcomingTasks.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${priorityDot(t.priority)}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-tight">{t.text}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={9} />{t.due}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 mt-1">
              View all <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* ── Row 3: Recent Transactions | Purchase Stats | Sales Trend ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Recent Transactions */}
          <div className={`${card} p-5 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">Recent Transactions</p>
              <button className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
                View All <ChevronRight size={12} />
              </button>
            </div>
            <div className="space-y-1">
              {recentTransactions.map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    t.type === "PO"  ? "bg-brand-100 text-brand-600" :
                    t.type === "SO"  ? "bg-brand-200 text-brand-500"  :
                                       "bg-amber-100 text-amber-700"
                  }`}>{t.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{t.name}</p>
                    <p className="text-[10px] text-gray-400">{t.date}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-gray-800">{t.amount}</p>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${statusStyle(t.status)}`}>{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Statistics */}
          <div className={`${card} p-5 flex flex-col gap-3`}>
            <div>
              <p className="text-sm font-semibold text-gray-800">Purchase Statistics</p>
              <p className="text-xs text-gray-400 mt-0.5">Monthly — last 6 months</p>
            </div>
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={purchaseData} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#4b49ac08" }} />
                  <Bar dataKey="amount" fill="#4b49ac" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sales Trend */}
          <div className={`${card} p-5 flex flex-col gap-3`}>
            <div>
              <p className="text-sm font-semibold text-gray-800">Sales Trend</p>
              <p className="text-xs text-gray-400 mt-0.5">Monthly — last 6 months</p>
            </div>
            <div className="flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7978e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7978e9" stopOpacity={0}   />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#7978e9" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ r: 3, fill: "#7978e9", strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Support Tickets (collapsible) ── */}
        {ticketOpen && (
          <div className={`${card} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Ticket size={16} className="text-brand-600" />
                <p className="text-sm font-semibold text-gray-800">Support Tickets</p>
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {openTickets} Open
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRaiseOpen(v => !v)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg"
                >
                  <Plus size={12} /> Raise Ticket
                </button>
                <button onClick={() => setTicketOpen(false)} className="p-1 rounded hover:bg-gray-100 text-gray-400">
                  <X size={16} />
                </button>
              </div>
            </div>

            {raiseOpen && (
              <div className="mb-4 bg-brand-50/50 border border-brand-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
                  <input
                    value={ticketForm.subject}
                    onChange={e => setTicketForm(f => ({...f, subject: e.target.value}))}
                    placeholder="Brief description of issue"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Module</label>
                  <select
                    value={ticketForm.module}
                    onChange={e => setTicketForm(f => ({...f, module: e.target.value}))}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    {["Purchase","Sales","Inventory","Finance","HR","System"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={e => setTicketForm(f => ({...f, priority: e.target.value}))}
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600"
                  >
                    {["High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={e => setTicketForm(f => ({...f, description: e.target.value}))}
                    rows={2}
                    placeholder="Describe the issue in detail..."
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-brand-600 resize-none"
                  />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button className="text-xs px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg">Submit Ticket</button>
                  <button onClick={() => setRaiseOpen(false)} className="text-xs px-4 py-1.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-lg">Cancel</button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[500px]">
                <thead>
                  <tr className="bg-brand-600">
                    {["Ticket ID","Subject","Module","Priority","Status","Date"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-white uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t, i) => (
                    <tr key={t.id} className={`border-b border-gray-100 hover:bg-brand-100 transition-colors ${i % 2 !== 0 ? "bg-gray-50/40" : ""}`}>
                      <td className="px-4 py-2.5 font-mono text-xs font-semibold text-brand-600">{t.id}</td>
                      <td className="px-4 py-2.5 text-gray-700">{t.subject}</td>
                      <td className="px-4 py-2.5 text-gray-600">{t.module}</td>
                      <td className="px-4 py-2.5">
                        <span className={`text-xs font-medium ${t.priority === "High" ? "text-red-500" : t.priority === "Medium" ? "text-amber-500" : "text-gray-400"}`}>{t.priority}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle(t.status)}`}>{t.status}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400">Jun 22</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}



