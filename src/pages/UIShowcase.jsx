import { useState } from "react";
import VariantA from "../components/design/VariantA";
import VariantB from "../components/design/VariantB";
import VariantC from "../components/design/VariantC";
import VariantD from "../components/design/VariantD";

const variants = [
  {
    id: "A",
    label: "Variant A",
    sublabel: "Dark Pro",
    desc: "Dark navy sidebar · White content · Blue accent KPI cards",
    ref: "Inspired by Ref 1",
    color: "bg-[#0a1628] text-white",
    tab: "border-[#0a1628] text-[#0a1628]",
    Component: VariantA,
  },
  {
    id: "B",
    label: "Variant B",
    sublabel: "Light SaaS",
    desc: "White sidebar · Colored module icons · Indigo/purple accents",
    ref: "Inspired by Ref 2 (Flowza)",
    color: "bg-indigo-600 text-white",
    tab: "border-indigo-600 text-indigo-600",
    Component: VariantB,
  },
  {
    id: "C",
    label: "Variant C",
    sublabel: "Corporate Blue",
    desc: "Slate sidebar · Blue header bar · Light-blue table headers",
    ref: "SCRUM-15 spec (exact match)",
    color: "bg-blue-700 text-white",
    tab: "border-blue-700 text-blue-700",
    Component: VariantC,
  },
  {
    id: "D",
    label: "Variant D",
    sublabel: "Soft Neutral",
    desc: "Gray-50 sidebar · White pill nav · Amber mandatory fields",
    ref: "Clean modern minimal",
    color: "bg-gray-800 text-white",
    tab: "border-gray-800 text-gray-800",
    Component: VariantD,
  },
];

export default function UIShowcase() {
  const [active, setActive] = useState("A");
  const current = variants.find(v => v.id === active);
  const Component = current.Component;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ fontFamily: "Inter, Arial, sans-serif" }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-base font-bold text-gray-900">UI Design Showcase — SCRUM-15</h1>
          <p className="text-xs text-gray-400 mt-0.5">Select a design variant to preview. Share with team before finalising.</p>
        </div>
        <span className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-full font-medium">
          Design Preview Only — No data is saved
        </span>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-6 flex items-end gap-1">
        {variants.map(v => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={`flex flex-col items-start px-5 py-3 text-xs border-b-2 transition-colors ${
              active === v.id
                ? `${v.tab} font-semibold`
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="font-bold">{v.label}</span>
            <span className="font-normal opacity-80">{v.sublabel}</span>
          </button>
        ))}
      </div>

      {/* Description strip */}
      <div className={`px-6 py-2.5 flex items-center justify-between ${current.color}`}>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">{current.label}: {current.sublabel}</span>
          <span className="text-xs opacity-70">{current.desc}</span>
        </div>
        <span className="text-xs opacity-60 italic">{current.ref}</span>
      </div>

      {/* Variant preview */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="w-full" style={{ height: "calc(100vh - 220px)", minHeight: 640 }}>
          <Component />
        </div>
      </div>
    </div>
  );
}
