import {
  Pill, Warehouse, Package, Truck, FileText, ClipboardList, Boxes, QrCode,
  Receipt, ShoppingCart, RotateCcw, AlertTriangle, BarChart3, Building2,
  ArrowRight, ArrowDown, MapPin, Layers, ScanLine, ClipboardCheck, Calculator,
  Stethoscope, BedDouble, Store, Globe2, Database, ShieldCheck, Workflow,
  TrendingUp, Tag, Banknote, FlaskConical, Activity, Target, CheckCircle2,
  Clock, Users, GitBranch, Snowflake, Thermometer
} from "lucide-react";
import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

const TOTAL = 22;

/* ---------- Shared frame ---------- */
const SlideHeader = ({ chip, chipColor = "primary", title, n }: { chip: string; chipColor?: string; title: string; n: number }) => (
  <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
    <div>
      <span className={`inline-block px-3 py-1 bg-${chipColor}/10 text-${chipColor} rounded-full text-xs font-medium mb-2`}
            style={chipColor === "primary" ? {} : undefined}>
        {chip}
      </span>
      <h2 className="text-3xl font-bold">{title}</h2>
    </div>
    <span className="text-sm text-muted-foreground font-medium">{n} / {TOTAL}</span>
  </div>
);

const SlideFooter = () => (
  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
    <span>HealthOS 24 — Pharmacy & Warehouse Suite</span>
    <span>healthos24.com</span>
  </div>
);

/* ---------- 1. Title ---------- */
export const PW01Title = () => (
  <div className="slide flex flex-col bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-20 left-20 w-40 h-40 rounded-full bg-primary blur-3xl" />
      <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-primary blur-3xl" />
    </div>
    <div className="flex-1 flex flex-col items-center justify-center relative z-10">
      <div className="mb-6"><HealthOS24Logo variant="full" size="xl" showTagline /></div>
      <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 leading-tight">
        Pharmacy & Warehouse<br />
        <span className="text-primary">Operations Suite</span>
      </h1>
      <p className="text-2xl text-muted-foreground text-center mb-6 max-w-3xl">
        End-to-end medicine and inventory management — from supplier onboarding to patient dispensing
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl">
        {['Procurement','GRN & Stock','FEFO/FIFO','POS Dispensing','Wasfaty','Multi-Store WMS','Bin Tracking','ZATCA','Auto-GL'].map(t => (
          <span key={t} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">{t}</span>
        ))}
      </div>
      <div className="flex items-center gap-8 bg-card border border-border rounded-2xl px-8 py-4 shadow-lg">
        {[
          { v: '4', l: 'Dispensing Channels' },
          { v: '12+', l: 'Module Integrations' },
          { v: 'Zero', l: 'Manual GL Entries' },
        ].map((s, i, arr) => (
          <div key={s.l} className="flex items-center gap-3">
            <div>
              <div className="text-2xl font-bold text-primary">{s.v}</div>
              <div className="text-xs text-muted-foreground">{s.l}</div>
            </div>
            {i < arr.length - 1 && <div className="w-px h-10 bg-border ml-6" />}
          </div>
        ))}
      </div>
    </div>
    <div className="relative z-10 pb-2 text-center text-sm text-muted-foreground">
      {new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})} · Version 2.0 · healthos24.com
    </div>
  </div>
);

/* ---------- 2. Why it matters ---------- */
export const PW02Why = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Context" title="Why Pharmacy & Warehouse Matter" n={2} />
    <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
      Medicine and consumables are the largest controllable cost in healthcare. Get this right and revenue, compliance, and patient safety all improve at once.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      {[
        { icon: AlertTriangle, color: 'rose', title: 'Stock-outs cost lives & revenue', body: 'Missed prescriptions push patients to outside pharmacies. We track every SKU in real time across stores with auto reorder thresholds.' },
        { icon: Clock, color: 'orange', title: 'Expiry waste eats margin', body: 'Strict FEFO dispensing, near-expiry dashboards and automated write-off journals keep wastage measurable and minimal.' },
        { icon: GitBranch, color: 'violet', title: 'Disconnected procurement = leakage', body: 'PR → PO → GRN → Invoice → Payment is one chain in HealthOS, with 3-way match enforced before posting.' },
        { icon: ShieldCheck, color: 'emerald', title: 'Regulatory pressure is rising', body: 'Wasfaty, Tatmeen serialization, ZATCA Phase-2 e-invoicing — all built in, not bolted on.' },
      ].map(c => (
        <div key={c.title} className={`border border-${c.color}-500/30 bg-${c.color}-500/5 rounded-2xl p-6`}>
          <div className={`w-12 h-12 rounded-xl bg-${c.color}-500 flex items-center justify-center mb-4`}>
            <c.icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{c.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 3. Module map ---------- */
export const PW03Map = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Overview" title="The Two Modules at a Glance" n={3} />
    <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
      Pharmacy and Warehouse share one procurement spine, one inventory ledger and one finance posting layer.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div className="border-2 border-primary/30 bg-primary/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <Pill className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold">Pharmacy</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Retail + clinical dispensing engine</p>
        <ul className="space-y-2 text-sm">
          {['Medicine catalog with generics & schedules','Batch / expiry / barcode tracking','OPD, IPD, Walk-in & Wasfaty channels','POS sessions with split tender','ZATCA-compliant invoices','Returns, wastage & reconciliation'].map(x => (
            <li key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" /><span>{x}</span></li>
          ))}
        </ul>
      </div>
      <div className="border-2 border-indigo-500/30 bg-indigo-500/5 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center">
            <Warehouse className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold">Warehouse / WMS</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Multi-store, bin-level inventory control</p>
        <ul className="space-y-2 text-sm">
          {['Zone → Aisle → Rack → Bin hierarchy','Inbound, putaway & gate-in','Bin-to-bin & store-to-store transfers','In-transit ledger accounting','Cycle counts & variance approvals','Picking, packing & gate-out'].map(x => (
            <li key={x} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" /><span>{x}</span></li>
          ))}
        </ul>
      </div>
    </div>
    <div className="mt-6 bg-muted/40 rounded-xl p-4 flex items-center justify-around">
      <span className="text-xs font-semibold text-muted-foreground">Shared Spine →</span>
      {[
        { icon: ClipboardList, l: 'Requisition' },
        { icon: FileText, l: 'Purchase Order' },
        { icon: Truck, l: 'GRN' },
        { icon: Database, l: 'Inventory Ledger' },
        { icon: Calculator, l: 'Auto Journal' },
      ].map((s, i, arr) => (
        <div key={s.l} className="flex items-center gap-2">
          <div className="flex flex-col items-center">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[10px] mt-1 font-medium">{s.l}</span>
          </div>
          {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground/50" />}
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 4. Master data ---------- */
export const PW04MasterData = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 1" title="Master Data: Medicine Catalog" n={4} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Every dispensing decision starts with a clean catalog. HealthOS gives you a controlled vocabulary for medicines, generics and tax behaviour.
    </p>
    <div className="flex-1 grid grid-cols-3 gap-5">
      {[
        { icon: Tag, title: 'Identity', items: ['Brand & generic name','Strength & dosage form','Manufacturer','Barcode / GTIN'] },
        { icon: Layers, title: 'Classification', items: ['Therapeutic group','Schedule (controlled drugs)','Cold-chain flag','Prescription-only flag'] },
        { icon: Banknote, title: 'Commercials', items: ['Default cost / MRP','Tax slab (KSA VAT 15%)','Markup rules per channel','Loyalty eligibility'] },
        { icon: Snowflake, title: 'Storage rules', items: ['Default store','Min / max temperature','Shelf-life policy','Reorder level & ROQ'] },
        { icon: ScanLine, title: 'Identifiers', items: ['Internal SKU code','Wasfaty mapping','SFDA registration','Tatmeen GTIN'] },
        { icon: Stethoscope, title: 'Clinical links', items: ['Drug-drug interactions','Allergy cross-refs','Pediatric dose ranges','Pregnancy category'] },
      ].map(c => (
        <div key={c.title} className="border border-border rounded-xl p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <c.icon className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold">{c.title}</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {c.items.map(i => <li key={i} className="flex gap-1.5"><span className="text-primary">·</span>{i}</li>)}
          </ul>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 5. Suppliers ---------- */
export const PW05Suppliers = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 2" title="Suppliers, Price Lists & Lead Times" n={5} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Capture vendor commercials once, reuse across every PO. Price agreements and lead times feed the auto-reorder engine.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div className="border border-border rounded-2xl p-6 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Users className="h-5 w-5 text-primary" />Vendor profile</h3>
        <div className="space-y-3 text-sm">
          {[
            ['Legal entity & VAT number','required for ZATCA-compliant AP'],
            ['Default payment terms','Net-30, Net-45, COD'],
            ['Preferred currency','SAR / PKR / USD'],
            ['Bank details','for BPV / cheque / wire'],
            ['Contact roles','sales, accounts, complaints'],
          ].map(([k,v]) => (
            <div key={k} className="flex justify-between border-b border-border pb-2">
              <span className="font-medium">{k}</span>
              <span className="text-muted-foreground text-xs">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-border rounded-2xl p-6 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Tag className="h-5 w-5 text-primary" />Price agreement</h3>
        <table className="w-full text-xs">
          <thead className="text-muted-foreground border-b">
            <tr><th className="text-left py-2">SKU</th><th className="text-left">MoQ</th><th className="text-right">Cost</th><th className="text-right">Lead</th></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              ['Paracetamol 500mg','100 strips','SAR 2.10','3 d'],
              ['Amoxicillin 500mg','50 boxes','SAR 14.80','5 d'],
              ['Insulin Glargine','20 vials','SAR 92.00','7 d'],
              ['Salbutamol Inh.','30 units','SAR 18.50','4 d'],
            ].map(r => (
              <tr key={r[0]} className="py-2">
                <td className="py-2">{r[0]}</td><td>{r[1]}</td><td className="text-right">{r[2]}</td><td className="text-right">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-4">Price agreements drive PO defaults and trigger price-variance alerts on GRN.</p>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 6. Procurement chain ---------- */
const procSteps = [
  { icon: ClipboardList, title: 'Requisition', sub: 'Store / ward raises need', role: 'Pharmacy Manager', color: 'bg-blue-500' },
  { icon: ClipboardCheck, title: 'Approval', sub: 'Multi-level workflow', role: 'Department Head', color: 'bg-violet-500' },
  { icon: FileText, title: 'Purchase Order', sub: 'Auto-filled from PR', role: 'Procurement', color: 'bg-orange-500' },
  { icon: Truck, title: 'GRN', sub: '3-way match enforced', role: 'Store Keeper', color: 'bg-emerald-500' },
  { icon: Receipt, title: 'Vendor Invoice', sub: 'AP-001 credited', role: 'Accounts', color: 'bg-rose-500' },
  { icon: Banknote, title: 'Payment', sub: 'BPV / cheque / wire', role: 'Finance', color: 'bg-teal-500' },
];
export const PW06Procurement = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 3" title="Procurement: PR → PO → GRN → Pay" n={6} />
    <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
      One unbroken chain. Every status change is auditable, every document links back to its source.
    </p>
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {procSteps.map((s, i) => (
          <div key={s.title} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`${s.color} p-4 rounded-2xl shadow-lg mb-3`}><s.icon className="h-7 w-7 text-white" /></div>
              <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
              <p className="text-[11px] text-muted-foreground text-center max-w-[110px] mb-1">{s.sub}</p>
              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-medium">{s.role}</span>
            </div>
            {i < procSteps.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground mx-2 flex-shrink-0" />}
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t border-border">
      {[
        ['3-way match','PO ↔ GRN ↔ Invoice quantity & price'],
        ['Idempotent journals','Re-running posting never duplicates entries'],
        ['Auto AP posting','DR Inventory · CR Accounts Payable on GRN'],
      ].map(([t, d]) => (
        <div key={t} className="text-center">
          <p className="font-semibold text-primary mb-1">{t}</p>
          <p className="text-xs text-muted-foreground">{d}</p>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 7. GRN posting ---------- */
export const PW07GRN = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 4" title="GRN Posting & Stock Intake" n={7} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      The single most important moment in pharmacy — when goods become inventory. HealthOS does it atomically.
    </p>
    <div className="flex-1 grid grid-cols-5 gap-4">
      <div className="col-span-3 border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Database className="h-5 w-5 text-primary" />What happens on “Verify GRN”</h3>
        <div className="space-y-3">
          {[
            ['1','Validate quantities, batches & expiries against PO'],
            ['2','Atomic upsert into medicine_inventory (branch + medicine + store + batch)'],
            ['3','Record landed cost per batch (FEFO/FIFO ready)'],
            ['4','Auto-post journal · DR INV-001 · CR AP-001'],
            ['5','Flip linked requisition to “issued”'],
            ['6','Emit Tatmeen serialization payload (KSA)'],
          ].map(([n, t]) => (
            <div key={n} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</div>
              <p className="text-sm pt-1">{t}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-2 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-5">
        <h3 className="font-semibold mb-3 text-emerald-700 flex items-center gap-2"><Calculator className="h-5 w-5" />Auto Journal</h3>
        <div className="bg-card border border-border rounded-lg p-3 font-mono text-xs space-y-2">
          <div className="text-muted-foreground">GRN-2025-00184</div>
          <div className="flex justify-between"><span>DR  INV-001 Inventory</span><span>12,480.00</span></div>
          <div className="flex justify-between"><span>CR  AP-001 Vendor X</span><span>(12,480.00)</span></div>
          <div className="border-t border-border pt-2 flex justify-between text-primary font-semibold"><span>Posted by trigger</span><span>✓</span></div>
        </div>
        <p className="text-xs text-muted-foreground mt-4">No manual JV. The DB trigger guards against double posting using <code>IF EXISTS</code>.</p>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 8. Storage & transfers ---------- */
export const PW08Storage = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 5" title="Stores, Transfers & Reorder" n={8} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Run multiple pharmacy stores per branch with safe transfers and automatic reorder triggers.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div className="border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Store className="h-5 w-5 text-primary" />Store layout</h3>
        <div className="space-y-2">
          {[
            ['Main Pharmacy','Retail · 24/7','bg-blue-500'],
            ['IPD Sub-store','Ward issue','bg-violet-500'],
            ['OT Consumables','Sterile · cold','bg-orange-500'],
            ['Cold Chain Vault','2–8 °C','bg-emerald-500'],
          ].map(([n, sub, c]) => (
            <div key={n} className="flex items-center gap-3 border border-border rounded-lg p-3">
              <div className={`${c} w-9 h-9 rounded-lg flex items-center justify-center`}><Store className="h-4 w-4 text-white" /></div>
              <div className="flex-1"><p className="text-sm font-medium">{n}</p><p className="text-[10px] text-muted-foreground">{sub}</p></div>
              <span className="text-xs text-muted-foreground">live stock</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <div className="border border-border rounded-2xl p-5 bg-card">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><GitBranch className="h-5 w-5 text-primary" />Inter-store transfer</h3>
          <div className="flex items-center justify-around text-xs">
            <div className="text-center"><div className="w-12 h-12 rounded-lg bg-blue-500/15 flex items-center justify-center mb-1"><Store className="h-5 w-5 text-blue-600" /></div>Main</div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center"><div className="w-12 h-12 rounded-lg bg-amber-500/15 flex items-center justify-center mb-1"><Truck className="h-5 w-5 text-amber-600" /></div>In-transit</div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="text-center"><div className="w-12 h-12 rounded-lg bg-violet-500/15 flex items-center justify-center mb-1"><BedDouble className="h-5 w-5 text-violet-600" /></div>IPD</div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">In-transit holding account keeps both ends balanced until the receiving store accepts.</p>
        </div>
        <div className="border border-rose-500/30 bg-rose-500/5 rounded-2xl p-5">
          <h3 className="font-semibold mb-2 flex items-center gap-2 text-rose-700"><AlertTriangle className="h-5 w-5" />Reorder engine</h3>
          <p className="text-xs text-muted-foreground">When live stock dips below ROL, an auto-PR is drafted using the supplier’s lead time and MoQ from the price agreement.</p>
        </div>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 9. Dispensing channels ---------- */
const channels = [
  { icon: Stethoscope, t: 'OPD Prescription', sub: 'Doctor → e-Rx → Pharmacy queue', steps: ['e-Rx pulled by SKU','Substitution check','Invoice + dispense','Stock deducted FEFO'], c: 'blue' },
  { icon: BedDouble, t: 'IPD Ward Issue', sub: 'Nurse / ward request', steps: ['Indent against admission','Sub-store fulfils','Auto ipd_charges row','Settled at discharge'], c: 'violet' },
  { icon: ShoppingCart, t: 'Walk-in POS', sub: 'Counter sale', steps: ['Barcode scan','Split tender','ZATCA invoice','Receipt + QR'], c: 'orange' },
  { icon: Globe2, t: 'Wasfaty (KSA)', sub: 'MOH e-prescription', steps: ['Pull Rx by national ID','Validate coverage','Dispense + claim','Status pushed back'], c: 'emerald' },
];
export const PW09Channels = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 6" title="Dispensing — Four Channels, One Engine" n={9} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Whether the patient is in OPD, IPD, off the street or coming via Wasfaty, the same inventory and pricing engine applies.
    </p>
    <div className="flex-1 grid grid-cols-4 gap-4">
      {channels.map(ch => (
        <div key={ch.t} className={`border border-${ch.c}-500/30 bg-${ch.c}-500/5 rounded-2xl p-4 flex flex-col`}>
          <div className={`w-11 h-11 rounded-xl bg-${ch.c}-500 flex items-center justify-center mb-3`}>
            <ch.icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-semibold text-sm mb-1">{ch.t}</h3>
          <p className="text-[11px] text-muted-foreground mb-3">{ch.sub}</p>
          <ol className="space-y-1.5 text-xs flex-1">
            {ch.steps.map((s, i) => (
              <li key={s} className="flex gap-1.5">
                <span className={`text-${ch.c}-600 font-bold`}>{i+1}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
    <div className="mt-5 bg-muted/40 rounded-xl p-3 text-center text-xs text-muted-foreground">
      All four channels write to the same <code>medicine_inventory</code> ledger and post identical COGS journals on completion.
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 10. POS lifecycle ---------- */
export const PW10POS = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 7" title="POS Sale Lifecycle" n={10} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Each cashier opens a session, transacts, and closes against expected cash — every step posts to the right ledger account.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div className="space-y-3">
        {[
          ['Open session','Float declared, session locked to user + counter','bg-blue-500'],
          ['Build cart','Barcode scan, FEFO batch picked, interactions checked','bg-violet-500'],
          ['Split tender','Cash + card + wallet + insurance copay','bg-orange-500'],
          ['ZATCA invoice','UBL XML, hash chain, QR generated','bg-emerald-500'],
          ['Stock deducted','Atomic decrement on chosen batch','bg-rose-500'],
          ['Close session','Cash count vs expected; variance journal','bg-teal-500'],
        ].map(([t, d, c], i) => (
          <div key={t} className="flex items-center gap-3 border border-border rounded-xl p-3 bg-card">
            <div className={`${c} w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold`}>{i+1}</div>
            <div><p className="font-semibold text-sm">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
          </div>
        ))}
      </div>
      <div className="border border-border rounded-2xl bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" />Auto journal · POS sale</h3>
        <div className="bg-muted/40 rounded-lg p-4 font-mono text-xs space-y-2">
          <div className="flex justify-between"><span>DR  CASH-001</span><span>235.00</span></div>
          <div className="flex justify-between"><span>CR  REV-PHRM-001</span><span>(204.35)</span></div>
          <div className="flex justify-between"><span>CR  TAX-VAT-OUT</span><span>(30.65)</span></div>
          <div className="border-t border-border my-2"></div>
          <div className="flex justify-between"><span>DR  EXP-COGS-001</span><span>148.20</span></div>
          <div className="flex justify-between"><span>CR  INV-001</span><span>(148.20)</span></div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="border border-border rounded-lg p-3 text-center">
            <QrCode className="h-8 w-8 mx-auto text-primary mb-1" />
            <p className="text-[10px] text-muted-foreground">ZATCA QR<br/>(TLV base64)</p>
          </div>
          <div className="border border-border rounded-lg p-3 text-center">
            <ShieldCheck className="h-8 w-8 mx-auto text-emerald-600 mb-1" />
            <p className="text-[10px] text-muted-foreground">Hash chain<br/>SHA-256</p>
          </div>
        </div>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 11. Returns & expiry ---------- */
export const PW11Returns = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 8" title="Returns, Wastage & Expiry Control" n={11} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Every leakage path is metered. Patients can return, batches can expire, things can break — but nothing is invisible.
    </p>
    <div className="flex-1 grid grid-cols-3 gap-5">
      {[
        { icon: RotateCcw, c: 'blue', t: 'Patient returns', body: 'Lookup original invoice, choose lines, partial allowed. CR Cash · DR Revenue · reverse COGS · stock returned to dispensable batch (if not opened).' },
        { icon: Clock, c: 'orange', t: 'Near-expiry', body: 'Configurable horizons (90/60/30 days). Dashboard ranks batches by days-to-expiry × value. Auto-suggest transfer to high-velocity store.' },
        { icon: AlertTriangle, c: 'rose', t: 'Wastage / breakage', body: 'Reason-coded write-off (broken, expired, recalled). DR Wastage Expense · CR Inventory · approval workflow above threshold.' },
      ].map(c => (
        <div key={c.t} className={`border border-${c.c}-500/30 bg-${c.c}-500/5 rounded-2xl p-5`}>
          <div className={`w-11 h-11 rounded-xl bg-${c.c}-500 flex items-center justify-center mb-3`}>
            <c.icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="font-semibold mb-2">{c.t}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
        </div>
      ))}
    </div>
    <div className="mt-6 grid grid-cols-4 gap-4 pt-4 border-t border-border">
      {[['< 1%','Target wastage'], ['100%','Returns auditable'], ['Daily','Expiry dashboard'], ['Auto','GL impact']].map(([v, l]) => (
        <div key={l} className="text-center"><p className="text-2xl font-bold text-primary">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 12. Pharmacy reporting ---------- */
export const PW12Reports = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Pharmacy · Step 9" title="Pharmacy Reporting & Analytics" n={12} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Operators get one-click reports; the recursive fetch helper bypasses Supabase row caps so totals are always real.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div className="space-y-3">
        {[
          { icon: TrendingUp, t: 'Gross margin by SKU', d: 'Revenue – COGS, ranked weekly. Drives pricing and substitution rules.' },
          { icon: Activity, t: 'Fast & slow movers', d: 'Velocity buckets per store; surfaces dead stock candidates.' },
          { icon: Boxes, t: 'Stock valuation', d: 'Live FIFO valuation per branch, reconciles to INV-001 nightly.' },
          { icon: Stethoscope, t: 'Doctor-wise prescribing', d: 'Top SKUs per doctor, generic substitution rate, controlled-drug usage.' },
        ].map(r => (
          <div key={r.t} className="flex gap-3 border border-border rounded-xl p-3 bg-card">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <r.icon className="h-5 w-5 text-primary" />
            </div>
            <div><p className="font-semibold text-sm">{r.t}</p><p className="text-xs text-muted-foreground">{r.d}</p></div>
          </div>
        ))}
      </div>
      <div className="border border-border rounded-2xl bg-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />This week — sample</h3>
        <div className="space-y-2 text-sm">
          {[
            ['Revenue', 'SAR 184,520', 'text-primary'],
            ['COGS', 'SAR 116,430', ''],
            ['Gross margin', '36.9%', 'text-emerald-600'],
            ['Lines dispensed', '4,812', ''],
            ['Avg basket', 'SAR 38.34', ''],
            ['Wastage', 'SAR 612 (0.33%)', 'text-rose-600'],
          ].map(([k, v, cls]) => (
            <div key={k} className="flex justify-between border-b border-border py-2">
              <span className="text-muted-foreground">{k}</span>
              <span className={`font-semibold ${cls}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 13. Warehouse architecture ---------- */
export const PW13WHArch = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Warehouse · Step 1" chipColor="indigo-600" title="Warehouse Architecture" n={13} />
    <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
      A real WMS hierarchy — every SKU lives at a precise bin coordinate, ready to be picked, counted or moved.
    </p>
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="bg-indigo-500 text-white rounded-xl px-6 py-3 shadow-lg mb-3">
        <p className="font-semibold text-center">Warehouse</p>
        <p className="text-xs text-white/80">e.g. Riyadh Central</p>
      </div>
      <ArrowDown className="h-5 w-5 text-muted-foreground" />
      <div className="grid grid-cols-3 gap-3 my-3">
        {['Zone A · Ambient','Zone B · Cold 2-8°C','Zone C · Controlled'].map(z => (
          <div key={z} className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-4 py-2 text-sm font-medium text-indigo-700 text-center">{z}</div>
        ))}
      </div>
      <ArrowDown className="h-5 w-5 text-muted-foreground" />
      <div className="grid grid-cols-6 gap-2 my-3">
        {['A-01','A-02','A-03','B-01','B-02','C-01'].map(a => (
          <div key={a} className="bg-card border border-border rounded px-3 py-1.5 text-xs text-center">Aisle {a}</div>
        ))}
      </div>
      <ArrowDown className="h-5 w-5 text-muted-foreground" />
      <div className="grid grid-cols-8 gap-1.5 my-3">
        {Array.from({length: 16}).map((_, i) => (
          <div key={i} className="w-12 h-10 bg-muted/50 border border-border rounded flex items-center justify-center text-[10px] font-mono">
            R{Math.floor(i/4)+1}-B{(i%4)+1}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">Bin codes are the routing primitive for putaway, picking and cycle counts.</p>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 14. Inbound ---------- */
export const PW14Inbound = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Warehouse · Step 2" chipColor="indigo-600" title="Inbound: Gate-in → Putaway" n={14} />
    <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
      From the moment a truck rolls in to the second the SKU sits on a bin, every event is logged and posted.
    </p>
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {[
          { icon: Truck, t: 'Gate-in', sub: 'Vehicle, driver, seal #', c: 'bg-blue-500' },
          { icon: ScanLine, t: 'Unload & verify', sub: 'Carton scan vs PO', c: 'bg-violet-500' },
          { icon: ClipboardCheck, t: 'GRN', sub: 'Qty / batch / expiry', c: 'bg-orange-500' },
          { icon: MapPin, t: 'Putaway', sub: 'System suggests bin', c: 'bg-emerald-500' },
          { icon: Database, t: 'Stock live', sub: 'Bin balance updated', c: 'bg-teal-500' },
        ].map((s, i, arr) => (
          <div key={s.t} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`${s.c} p-4 rounded-2xl shadow-lg mb-3`}><s.icon className="h-7 w-7 text-white" /></div>
              <h3 className="font-semibold text-sm mb-1">{s.t}</h3>
              <p className="text-[11px] text-muted-foreground text-center max-w-[110px]">{s.sub}</p>
            </div>
            {i < arr.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground mx-3" />}
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-3 gap-6 mt-6 pt-4 border-t border-border">
      {[
        ['Cold-chain check','Thermometer reading captured at gate-in for cold zone receipts'],
        ['Putaway suggestion','Closest free bin in the SKU’s zone, respecting cube'],
        ['Auto journal','GRN posts DR Inventory · CR AP at landed cost'],
      ].map(([t, d]) => (
        <div key={t} className="text-center">
          <p className="font-semibold text-indigo-600 mb-1">{t}</p>
          <p className="text-xs text-muted-foreground">{d}</p>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 15. Internal moves ---------- */
export const PW15Moves = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Warehouse · Step 3" chipColor="indigo-600" title="Internal Movements" n={15} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Move stock around safely — bin to bin, store to store — with the right ledger treatment for each.
    </p>
    <div className="flex-1 grid grid-cols-2 gap-6">
      <div className="border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="h-5 w-5 text-indigo-600" />Bin-to-bin (same store)</h3>
        <p className="text-xs text-muted-foreground mb-3">Operational only — no GL impact. Used to consolidate, slot fast-movers near pick-face, or free a damaged bin.</p>
        <div className="bg-muted/40 rounded-lg p-4 font-mono text-xs">
          MOV · A-02 / R3-B2  →  A-01 / R1-B4 · Qty 24
        </div>
      </div>
      <div className="border border-border rounded-2xl p-5 bg-card">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><GitBranch className="h-5 w-5 text-indigo-600" />Store-to-store transfer</h3>
        <p className="text-xs text-muted-foreground mb-3">Three-leg accounting using an in-transit holding account.</p>
        <div className="bg-muted/40 rounded-lg p-3 font-mono text-xs space-y-1.5">
          <div>1 · DR Inv-Transit · CR Inv-Source</div>
          <div>2 · receiver scans GRN</div>
          <div>3 · DR Inv-Dest · CR Inv-Transit</div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">Pending receipts surface on a dashboard so nothing gets stuck in transit.</p>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 16. Outbound ---------- */
export const PW16Outbound = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Warehouse · Step 4" chipColor="indigo-600" title="Outbound: Pick → Pack → Gate-out" n={16} />
    <p className="text-lg text-muted-foreground mb-8 max-w-3xl">
      Requisitions from wards, sub-stores or external orders are fulfilled via batch-aware picking lists.
    </p>
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {[
          { icon: ClipboardList, t: 'Requisition', sub: 'From ward / pharmacy', c: 'bg-blue-500' },
          { icon: MapPin, t: 'Pick list', sub: 'Optimised by aisle path', c: 'bg-violet-500' },
          { icon: ScanLine, t: 'Scan & confirm', sub: 'Batch + expiry verified', c: 'bg-orange-500' },
          { icon: Package, t: 'Pack', sub: 'Cartonisation, labels', c: 'bg-emerald-500' },
          { icon: Truck, t: 'Gate-out', sub: 'Gate pass, receiver sign', c: 'bg-teal-500' },
        ].map((s, i, arr) => (
          <div key={s.t} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`${s.c} p-4 rounded-2xl shadow-lg mb-3`}><s.icon className="h-7 w-7 text-white" /></div>
              <h3 className="font-semibold text-sm mb-1">{s.t}</h3>
              <p className="text-[11px] text-muted-foreground text-center max-w-[110px]">{s.sub}</p>
            </div>
            {i < arr.length - 1 && <ArrowRight className="h-5 w-5 text-muted-foreground mx-3" />}
          </div>
        ))}
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 17. Cycle counts ---------- */
export const PW17Cycle = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Warehouse · Step 5" chipColor="indigo-600" title="Cycle Counts & Adjustments" n={17} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      ABC-driven cycle counts replace the once-a-year stocktake nightmare. Variance journals are approval-gated.
    </p>
    <div className="flex-1 grid grid-cols-3 gap-5">
      {[
        { c:'A · High value', desc:'Counted weekly · ±0.5% tolerance', col:'rose' },
        { c:'B · Medium', desc:'Counted monthly · ±1% tolerance', col:'amber' },
        { c:'C · Low value', desc:'Counted quarterly · ±2% tolerance', col:'emerald' },
      ].map(x => (
        <div key={x.c} className={`border border-${x.col}-500/30 bg-${x.col}-500/5 rounded-2xl p-5 text-center`}>
          <Target className={`h-8 w-8 mx-auto mb-3 text-${x.col}-600`} />
          <h3 className="font-semibold mb-2">{x.c}</h3>
          <p className="text-xs text-muted-foreground">{x.desc}</p>
        </div>
      ))}
    </div>
    <div className="mt-6 border border-border rounded-2xl p-5 bg-card">
      <h3 className="font-semibold mb-3 flex items-center gap-2"><Calculator className="h-5 w-5 text-primary" />Variance journal</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-muted/40 rounded-lg p-3 font-mono text-xs">
          <div className="text-muted-foreground mb-1">Shortage</div>
          <div>DR EXP-INV-ADJ · CR INV-001</div>
        </div>
        <div className="bg-muted/40 rounded-lg p-3 font-mono text-xs">
          <div className="text-muted-foreground mb-1">Overage</div>
          <div>DR INV-001 · CR INC-INV-ADJ</div>
        </div>
      </div>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 18. WMS dashboards ---------- */
export const PW18Dash = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Warehouse · Step 6" chipColor="indigo-600" title="WMS Dashboards" n={18} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Operations leadership gets one screen for occupancy, ageing, and dead stock — refreshed live.
    </p>
    <div className="flex-1 grid grid-cols-3 gap-5">
      {[
        { icon: Layers, t: 'Bin occupancy', v: '74%', sub: 'Heatmap by zone', col: 'indigo' },
        { icon: Clock, t: 'Stock ageing', v: '8.4 d', sub: 'Avg days on hand', col: 'amber' },
        { icon: Snowflake, t: 'Cold-chain alerts', v: '0', sub: 'Last 24 hours', col: 'sky' },
        { icon: AlertTriangle, t: 'Dead stock', v: 'SAR 9.4k', sub: '> 180 days no movement', col: 'rose' },
        { icon: TrendingUp, t: 'Throughput', v: '1,284', sub: 'Lines / day', col: 'emerald' },
        { icon: Thermometer, t: 'Temp excursions', v: '2', sub: 'Auto-flagged batches', col: 'orange' },
      ].map(c => (
        <div key={c.t} className={`border border-${c.col}-500/30 bg-${c.col}-500/5 rounded-2xl p-5`}>
          <c.icon className={`h-7 w-7 text-${c.col}-600 mb-3`} />
          <p className="text-xs text-muted-foreground">{c.t}</p>
          <p className={`text-3xl font-bold text-${c.col}-700 my-1`}>{c.v}</p>
          <p className="text-[11px] text-muted-foreground">{c.sub}</p>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 19. KSA Compliance ---------- */
export const PW19KSA = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Compliance" title="KSA Regulatory Coverage" n={19} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Pharmacy and Warehouse ship with the regulatory plumbing already wired — Wasfaty, Tatmeen and ZATCA Phase-2.
    </p>
    <div className="flex-1 grid grid-cols-3 gap-5">
      {[
        { icon: Globe2, t: 'Wasfaty', sub: 'MOH e-prescription', items: ['Pull Rx by national ID','Validate insurance / coverage','Dispense + status push','Claim file generated'], c: 'emerald' },
        { icon: ScanLine, t: 'Tatmeen / RSD', sub: 'GS1 serialization', items: ['GTIN + serial captured','Receipt event reported','Dispense event reported','Decommission on expiry'], c: 'sky' },
        { icon: Receipt, t: 'ZATCA Phase-2', sub: 'E-invoicing', items: ['UBL 2.1 XML','SHA-256 hash chain','Cryptographic stamp','TLV QR on every receipt'], c: 'orange' },
      ].map(c => (
        <div key={c.t} className={`border border-${c.c}-500/30 bg-${c.c}-500/5 rounded-2xl p-5`}>
          <div className={`w-12 h-12 rounded-xl bg-${c.c}-500 flex items-center justify-center mb-3`}>
            <c.icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-semibold text-lg">{c.t}</h3>
          <p className={`text-xs text-${c.c}-700 mb-3`}>{c.sub}</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {c.items.map(i => <li key={i} className="flex gap-1.5"><CheckCircle2 className={`h-3.5 w-3.5 text-${c.c}-600 flex-shrink-0 mt-0.5`} /><span>{i}</span></li>)}
          </ul>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 20. Finance integration ---------- */
export const PW20Finance = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Finance Integration" title="Auto-Posting Trigger Map" n={20} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      No accountant ever writes a JV for routine inventory or POS activity. Idempotent DB triggers do it correctly, every time.
    </p>
    <div className="flex-1 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-muted-foreground">
          <tr>
            <th className="text-left p-3">Event</th>
            <th className="text-left p-3">Trigger</th>
            <th className="text-left p-3">DR</th>
            <th className="text-left p-3">CR</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {[
            ['GRN verified','post_grn_to_journal v3','INV-001 Inventory','AP-001 Accounts Payable'],
            ['Vendor payment','vendor_payment_post','AP-001 Accounts Payable','CASH-001 / BANK-001'],
            ['POS sale','pharmacy_pos_post','CASH-001 + COGS','REV-PHRM-001 + INV-001'],
            ['POS return','pharmacy_pos_return','REV-PHRM-001 + INV-001','CASH-001 + COGS'],
            ['Stock transfer (out)','stock_transfer_out','INV-TRANSIT','INV-001 Source'],
            ['Stock transfer (in)','stock_transfer_in','INV-001 Dest','INV-TRANSIT'],
            ['Wastage write-off','inventory_writeoff','EXP-WASTE-001','INV-001'],
            ['Cycle-count variance','inventory_adjust','EXP/INC-INV-ADJ','INV-001'],
          ].map(r => (
            <tr key={r[0]} className="hover:bg-muted/20">
              <td className="p-3 font-medium">{r[0]}</td>
              <td className="p-3 font-mono text-xs text-primary">{r[1]}</td>
              <td className="p-3 text-xs">{r[2]}</td>
              <td className="p-3 text-xs">{r[3]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 21. Connected modules ---------- */
export const PW21Connected = () => (
  <div className="slide flex flex-col bg-background">
    <SlideHeader chip="Ecosystem" title="Connected Modules" n={21} />
    <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
      Pharmacy and Warehouse don’t live in a silo — they push and pull data across the whole HealthOS suite.
    </p>
    <div className="flex-1 grid grid-cols-3 gap-4">
      {[
        { icon: Stethoscope, t: 'OPD', d: 'e-prescriptions land in pharmacy queue with one click', c: 'blue' },
        { icon: BedDouble, t: 'IPD', d: 'Ward indents, auto ipd_charges on dispense', c: 'violet' },
        { icon: FlaskConical, t: 'Lab', d: 'Reagent and consumable requisitions', c: 'orange' },
        { icon: Activity, t: 'OT / Surgery', d: 'FIFO consumable deduction at case close', c: 'rose' },
        { icon: ShieldCheck, t: 'Insurance', d: 'Coverage check before dispense, copay calc', c: 'emerald' },
        { icon: Calculator, t: 'Finance', d: 'All inventory & sales journals auto-posted', c: 'teal' },
        { icon: Users, t: 'HR', d: 'Pharmacist roster drives POS session ownership', c: 'indigo' },
        { icon: Workflow, t: 'Procurement', d: 'Single PR/PO chain for medical & non-medical', c: 'sky' },
        { icon: BarChart3, t: 'Reporting', d: 'Stock, margin & wastage in unified BI', c: 'amber' },
      ].map(m => (
        <div key={m.t} className={`border border-${m.c}-500/30 bg-${m.c}-500/5 rounded-xl p-4 flex gap-3`}>
          <div className={`w-10 h-10 rounded-lg bg-${m.c}-500 flex items-center justify-center flex-shrink-0`}>
            <m.icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">{m.t}</p>
            <p className="text-xs text-muted-foreground">{m.d}</p>
          </div>
        </div>
      ))}
    </div>
    <SlideFooter />
  </div>
);

/* ---------- 22. CTA ---------- */
export const PW22CTA = () => (
  <div className="slide flex flex-col bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute top-20 right-20 w-60 h-60 rounded-full bg-primary blur-3xl" />
      <div className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-primary blur-3xl" />
    </div>
    <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
      <HealthOS24Logo variant="full" size="lg" />
      <h1 className="text-5xl md:text-6xl font-bold mt-8 mb-4">
        See it in <span className="text-primary">live action</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mb-8">
        Walk through pharmacy POS, GRN posting and warehouse picking with your own data in under 30 minutes.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl">
        {['Multi-store WMS','FEFO POS','Wasfaty ready','ZATCA Phase-2','Auto-GL','Cold-chain'].map(t => (
          <span key={t} className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">{t}</span>
        ))}
      </div>
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg flex items-center gap-8">
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Book a demo</p>
          <p className="text-2xl font-bold text-primary">healthos24.com</p>
        </div>
        <div className="w-px h-12 bg-border" />
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Sign up</p>
          <p className="text-2xl font-bold">smarthms.devmine.co</p>
        </div>
      </div>
    </div>
    <div className="relative z-10 pb-2 text-center text-xs text-muted-foreground">
      HealthOS 24 · Pharmacy & Warehouse Suite · Version 2.0
    </div>
  </div>
);
