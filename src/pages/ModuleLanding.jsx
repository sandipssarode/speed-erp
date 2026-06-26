import { Link, useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Layout from "../components/Layout.jsx";
import { menu } from "../lib/menu.js";

// Generic module landing page â€” lists every link of a module as cards.
export default function ModuleLanding() {
  const { pathname } = useLocation();
  const mod = menu.find(m => m.landing === pathname);

  if (!mod) {
    return (
      <Layout>
        <div className="text-sm text-gray-500">Module not found.</div>
      </Layout>
    );
  }

  const ModIcon = mod.icon;
  const groups = mod.flat ? [["", mod.links]] : Object.entries(mod.children);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-md shadow-brand-200">
            <ModIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 leading-tight">{mod.label}</h1>
            <p className="text-xs text-gray-500 mt-0.5">Select a record to manage</p>
          </div>
        </div>

        {/* Link groups */}
        {groups.map(([section, links]) => (
          <div key={section || "all"} className="space-y-2">
            {section && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{section}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="group flex items-center gap-3 bg-white border border-brand-100 rounded-xl px-4 py-3.5 shadow-sm hover:shadow-md hover:border-brand-300 hover:-translate-y-0.5 transition-all"
                >
                  <span className="text-sm font-medium text-gray-700 group-hover:text-brand-600">
                    {link.label}
                  </span>
                  <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-brand-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}


