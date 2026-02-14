import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

interface DocPageWrapperProps {
  children: React.ReactNode;
  pageNumber: number;
  totalPages: number;
}

export const DocPageWrapper = ({ children, pageNumber, totalPages }: DocPageWrapperProps) => (
  <div className="proposal-page flex flex-col p-10">
    {/* Header */}
    <div className="flex items-center justify-between mb-6 pb-4 border-b border-emerald-200">
      <HealthOS24Logo variant="full" size="sm" />
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
        Pharmacy Module Guide
      </span>
    </div>

    {/* Content */}
    <div className="flex-1">{children}</div>

    {/* Footer */}
    <div className="mt-auto pt-4 border-t border-emerald-100 flex items-center justify-between text-xs text-muted-foreground">
      <span>HealthOS 24 — Pharmacy Module Documentation</span>
      <span>Page {pageNumber} of {totalPages}</span>
    </div>
  </div>
);

export const SectionTitle = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
      {icon}
    </div>
    <div>
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export const FeatureList = ({ items }: { items: string[] }) => (
  <ul className="space-y-1.5 text-sm text-foreground">
    {items.map((item, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
        {item}
      </li>
    ))}
  </ul>
);

export const TipBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
    <p className="text-xs font-semibold text-emerald-800 mb-1">💡 {title}</p>
    <p className="text-xs text-emerald-700">{children}</p>
  </div>
);

export const StepList = ({ steps }: { steps: string[] }) => (
  <ol className="space-y-2 text-sm text-foreground">
    {steps.map((step, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-medium">
          {i + 1}
        </span>
        {step}
      </li>
    ))}
  </ol>
);

export const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
      <span className="w-1 h-4 bg-emerald-500 rounded-full" />
      {title}
    </h3>
    {children}
  </div>
);
