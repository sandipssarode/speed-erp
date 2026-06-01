import { useState } from "react";
import Layout from "../components/Layout";
import { Ticket, Plus, ChevronRight, Clock, CheckCircle, AlertCircle } from "lucide-react";

const AlertCard = ({ title, count }) => (
  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
    <p className="text-sm text-gray-700 font-medium">{title}</p>
    {count !== undefined && (
      <p className="text-2xl font-semibold text-gray-800 mt-1">{count}</p>
    )}
  </div>
);

const PieChart = ({ segments, size = 120 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;
  let cumAngle = -90;

  const paths = segments.map((seg, i) => {
    const angle = (seg.pct / 100) * 360;
    const start = cumAngle;
    const end = cumAngle + angle;
    cumAngle += angle;

    const toRad = (deg) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = angle > 180 ? 1 : 0;

    const midAngle = start + angle / 2;
    const lx = cx + r * 0.65 * Math.cos(toRad(midAngle));
    const ly = cy + r * 0.65 * Math.sin(toRad(midAngle));

    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      lx,
      ly,
      label: seg.label,
      fill: seg.fill,
    };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} fill={p.fill} stroke="#fff" strokeWidth="1.5" />
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7"
            fill="#333"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default function Dashboard() {
  const inventorySegments = [
    { label: "Raw Mat.", pct: 40, fill: "#d1d5db" },
    { label: "Consum.", pct: 35, fill: "#9ca3af" },
    { label: "Boughtout", pct: 25, fill: "#6b7280" },
  ];

  const salesSegments = [
    { label: "APR", pct: 35, fill: "#d1d5db" },
    { label: "MAR", pct: 25, fill: "#9ca3af" },
    { label: "FEB", pct: 20, fill: "#6b7280" },
    { label: "JAN", pct: 20, fill: "#4b5563" },
  ];

  const [showTicketForm, setShowTicketForm] = useState(false);

  const sampleTickets = [
    { id: "TKT-001", subject: "GST validation not working", module: "Vendor Master", priority: "High",   status: "Open",     date: "27-May-2026" },
    { id: "TKT-002", subject: "PO print format issue",      module: "Purchase Order",  priority: "Medium", status: "In Progress", date: "26-May-2026" },
    { id: "TKT-003", subject: "User login error",           module: "System",          priority: "High",   status: "Resolved", date: "24-May-2026" },
  ];

  const statusStyle = (s) => {
    if (s === "Open")        return "bg-red-50 text-red-600 border-red-200";
    if (s === "In Progress") return "bg-amber-50 text-amber-600 border-amber-200";
    if (s === "Resolved")    return "bg-green-50 text-green-600 border-green-200";
    return "bg-gray-50 text-gray-500 border-gray-200";
  };

  const priorityStyle = (p) => {
    if (p === "High")   return "text-red-500";
    if (p === "Medium") return "text-amber-500";
    return "text-gray-400";
  };

  return (
    <Layout>
      <div className="space-y-4">

      {/* ── ERP Support Tickets ── */}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 rounded-t">
          <div className="flex items-center gap-2">
            <Ticket size={15} className="text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">ERP Support Tickets</span>
            <span className="ml-1 text-xs bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-medium">2 Open</span>
          </div>
          <button
            onClick={() => setShowTicketForm(!showTicketForm)}
            className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded font-medium"
          >
            <Plus size={12} /> Raise Ticket
          </button>
        </div>

        {/* Raise Ticket Form */}
        {showTicketForm && (
          <div className="border-b border-gray-200 p-4 bg-blue-50/40">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">New Support Ticket</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Briefly describe the issue..." className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Module</label>
                <select className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option value="">Select Module</option>
                  <option>Vendor Master</option><option>Purchase Order</option>
                  <option>Sales</option><option>Inventory</option>
                  <option>Finance</option><option>System</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400">
                  <option>Medium</option><option>High</option><option>Low</option>
                </select>
              </div>
              <div className="col-span-4">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea rows={2} placeholder="Detailed description of the issue..." className="w-full px-2.5 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded font-medium">Submit Ticket</button>
              <button onClick={() => setShowTicketForm(false)} className="text-xs border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded">Cancel</button>
            </div>
          </div>
        )}

        {/* Tickets Table */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2">Ticket ID</th>
              <th className="text-left px-4 py-2">Subject</th>
              <th className="text-left px-4 py-2">Module</th>
              <th className="text-left px-4 py-2">Priority</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {sampleTickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-2 font-mono text-xs text-blue-600 font-semibold">{t.id}</td>
                <td className="px-4 py-2 text-gray-700">{t.subject}</td>
                <td className="px-4 py-2 text-gray-500">{t.module}</td>
                <td className={`px-4 py-2 text-xs font-semibold ${priorityStyle(t.priority)}`}>{t.priority}</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyle(t.status)}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-gray-400">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 3-column section ── */}
      <div className="grid grid-cols-3 gap-0 border border-gray-200 rounded bg-white min-h-[500px]">
        {/* Column 1 - My Charts */}
        <div className="border-r border-gray-200">
          <div className="border-b border-gray-200 px-4 py-2 bg-gray-100">
            <span className="text-sm font-semibold text-gray-700">
              My Charts
            </span>
          </div>
          <div className="p-5 space-y-6">
            {/* Inventory Chart */}
            <div>
              <p className="text-sm text-gray-600 mb-3 text-center">
                Inventory Charts
              </p>
              <div className="flex flex-col items-center gap-3">
                <PieChart segments={inventorySegments} size={140} />
                <div className="flex flex-wrap gap-2 justify-center">
                  {inventorySegments.map((s) => (
                    <div key={s.label} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: s.fill }}
                      />
                      <span className="text-xs text-gray-500">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* Sales Chart */}
            <div>
              <p className="text-sm text-gray-600 mb-3 text-center">
                Sales Charts
              </p>
              <div className="flex flex-col items-center gap-3">
                <PieChart segments={salesSegments} size={140} />
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { label: "APR - 56,45,984", fill: "#d1d5db" },
                    { label: "MAR - 30,36,789", fill: "#9ca3af" },
                    { label: "FEB - 23,46,789", fill: "#6b7280" },
                    { label: "JAN - 42,45,678", fill: "#4b5563" },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-sm"
                        style={{ background: s.fill }}
                      />
                      <span className="text-xs text-gray-500">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2 - My Follow Ups */}
        <div className="border-r border-gray-200">
          <div className="border-b border-gray-200 px-4 py-2 bg-gray-100">
            <span className="text-sm font-semibold text-gray-700">
              My Follow Ups
            </span>
          </div>
          <div className="p-5">
            {/* Sticky Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 shadow-sm relative">
              <div
                className="absolute top-0 right-0 w-6 h-6 bg-yellow-200 rounded-bl"
                style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
              />
              <table className="w-full text-xs text-gray-700">
                <tbody>
                  <tr className="border-b border-yellow-100">
                    <td className="py-1.5 font-medium pr-4 text-gray-500">
                      Customer/Vendor/User
                    </td>
                    <td className="py-1.5"></td>
                  </tr>
                  <tr className="border-b border-yellow-100">
                    <td className="py-1.5 font-medium text-gray-500">
                      Meeting
                    </td>
                    <td className="py-1.5">Email</td>
                  </tr>
                  <tr className="border-b border-yellow-100">
                    <td className="py-1.5 font-medium text-gray-500">
                      Contact Person
                    </td>
                    <td className="py-1.5">Date</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 font-medium text-gray-500">Note</td>
                    <td className="py-1.5">Completed / Pending / Overdue</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              No follow ups scheduled
            </p>
          </div>
        </div>

        {/* Column 3 - Alerts */}
        <div>
          <div className="border-b border-gray-200 px-4 py-2 bg-gray-100">
            <span className="text-sm font-semibold text-gray-700">Alerts</span>
          </div>
          <div className="p-5 space-y-3">
            <AlertCard title="Open Purchase Requisition" count={10} />
            <AlertCard title="Open Purchase Orders" count={20} />
            <AlertCard title="Open Sales Orders" />
            <AlertCard title="Pending PO for GRN" count={45} />
          </div>
        </div>
      </div>

      </div>{/* end space-y-4 */}
    </Layout>
  );
}
