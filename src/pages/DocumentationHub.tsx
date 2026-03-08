import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, FileText, ArrowRight, BookOpen, Layers, Shield, Stethoscope } from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const categories = [
  { id: "all", label: "All Modules", icon: Layers },
  { id: "clinical", label: "Clinical", icon: Stethoscope },
  { id: "operations", label: "Operations", icon: BookOpen },
  { id: "specialty", label: "Specialty", icon: FileText },
  { id: "compliance", label: "Compliance", icon: Shield },
];

const modules = [
  { title: "OPD — Outpatient", desc: "Appointments, consultation, prescriptions, checkout", path: "/opd-documentation", icon: "🩺", pages: 9, category: "clinical", accent: "from-emerald-500 to-teal-600" },
  { title: "IPD — Inpatient", desc: "Admission, bed management, rounds, nursing, discharge", path: "/ipd-documentation", icon: "🏥", pages: 9, category: "clinical", accent: "from-blue-500 to-cyan-600" },
  { title: "Surgery / OT", desc: "Scheduling, pre-op, anesthesia, live surgery, PACU", path: "/ot-documentation", icon: "🔬", pages: 8, category: "clinical", accent: "from-violet-500 to-purple-600" },
  { title: "Laboratory", desc: "Orders, sample collection, results, validation", path: "/lab-documentation", icon: "🧪", pages: 6, category: "clinical", accent: "from-amber-500 to-orange-600" },
  { title: "Radiology", desc: "Imaging orders, reporting, PACS integration", path: "/radiology-documentation", icon: "📡", pages: 6, category: "clinical", accent: "from-rose-500 to-pink-600" },
  { title: "Pharmacy", desc: "POS, inventory, dispensing, procurement, reports", path: "/pharmacy-documentation", icon: "💊", pages: 19, category: "operations", accent: "from-green-500 to-emerald-600" },
  { title: "Warehouse / WMS", desc: "GRN, picking, packing, shipping, cycle count", path: "/warehouse-documentation", icon: "🏭", pages: 7, category: "operations", accent: "from-slate-500 to-gray-600" },
  { title: "Finance / Accounts", desc: "Chart of accounts, journals, billing, P&L", path: "/finance-documentation", icon: "💰", pages: 7, category: "operations", accent: "from-yellow-500 to-amber-600" },
  { title: "HR & Payroll", desc: "Employees, attendance, payroll, recruitment", path: "/hr-documentation", icon: "👥", pages: 7, category: "operations", accent: "from-indigo-500 to-blue-600" },
  { title: "Dialysis", desc: "Sessions, vitals monitoring, machines, scheduling", path: "/dialysis-documentation", icon: "🫘", pages: 7, category: "specialty", accent: "from-red-500 to-rose-600" },
  { title: "Dental", desc: "3D tooth chart, treatments, procedures, imaging", path: "/dental-documentation", icon: "🦷", pages: 7, category: "specialty", accent: "from-sky-500 to-blue-600" },
  { title: "KSA Compliance", desc: "NPHIES, ZATCA, Wasfaty, Nafath, HESN, Tatmeen", path: "/ksa-documentation", icon: "🇸🇦", pages: 12, category: "compliance", accent: "from-emerald-600 to-green-700" },
];

const DocumentationHub = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = modules.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "all" || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  const totalPages = modules.reduce((s, m) => s + m.pages, 0);

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0c1220 0%, #111827 40%, #1a2332 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-50 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(12,18,32,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-2 text-gray-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />Back to Home
          </Button>
          <HealthOS24Logo variant="full" size="sm" />
        </div>
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Gradient orbs */}
        <div className="absolute top-[-120px] left-1/4 w-[400px] h-[400px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }} />
        <div className="absolute top-[-80px] right-1/4 w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #14b8a6 0%, transparent 70%)' }} />

        <div className="relative container mx-auto px-4 pt-16 pb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: 'rgba(5,150,105,0.15)', color: '#34d399', border: '1px solid rgba(5,150,105,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Enterprise Documentation Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ color: '#f1f5f9' }}>
            Documentation <span style={{ background: 'linear-gradient(135deg, #34d399, #14b8a6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Center</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#94a3b8' }}>
            Complete operational guides with process flows for every HealthOS 24 module
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mb-10">
            {[
              { value: `${modules.length}`, label: "Modules" },
              { value: `${totalPages}+`, label: "Pages" },
              { value: "PDF", label: "Download" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>{s.value}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#64748b' }} />
            <input
              type="text"
              placeholder="Search modules..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0',
              }}
            />
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: isActive ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#34d399' : '#94a3b8',
                  border: `1px solid ${isActive ? 'rgba(5,150,105,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Module grid */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {filtered.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              className="group text-left rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 0 0 0 rgba(5,150,105,0)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(5,150,105,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px -8px rgba(5,150,105,0.15)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 rgba(5,150,105,0)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-2xl shadow-lg`} style={{ boxShadow: '0 4px 16px -4px rgba(0,0,0,0.3)' }}>
                  {m.icon}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                  <FileText className="h-3 w-3" />
                  {m.pages} pages
                </div>
              </div>
              <h3 className="font-semibold text-[15px] mb-1.5 transition-colors" style={{ color: '#e2e8f0' }}>
                {m.title}
              </h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>
                {m.desc}
              </p>
              <div className="flex items-center gap-1.5 text-xs font-medium transition-all" style={{ color: '#34d399' }}>
                View Documentation
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: '#64748b' }}>No modules match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationHub;
