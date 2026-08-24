import { Users, KeyRound, ScrollText, ShieldCheck } from "lucide-react";

const cards = [
  {
    icon: Users,
    title: "Roles & Personas",
    color: "bg-blue-500",
    items: [
      "28 built-in roles across clinical, pharmacy, lab, HR, finance, warehouse",
      "Organization, branch and super-admin levels",
      "Multiple roles per user (doctor + department head)",
      "Mobile app resolves a persona from assigned roles",
    ],
  },
  {
    icon: KeyRound,
    title: "Permissions",
    color: "bg-teal-500",
    items: [
      "Roles stored in a separate table, never on the user profile",
      "Row-level policies enforced in the database, not the browser",
      "Financial figures hidden from clinical roles",
      "Module visibility follows facility type and enabled modules",
    ],
  },
  {
    icon: ScrollText,
    title: "Audit Trail",
    color: "bg-amber-500",
    items: [
      "Every record change logs user, action, old and new values",
      "Patient record views logged as PHI access events",
      "CSV and PDF exports logged with record counts",
      "Searchable audit log with user, date and entity filters",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Session Security",
    color: "bg-purple-500",
    items: [
      "Two-factor authentication with recovery codes",
      "Admin-enforced MFA per organization",
      "Idle timeout and automatic sign-out",
      "Sensitive fields masked for roles without clearance",
    ],
  },
];

export function ExecAccessControlSlide() {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-blue-500/5 via-background to-purple-500/5 relative overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 rounded-t-lg -mx-8 -mt-8 mb-6" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm text-blue-600 font-semibold mb-1">Product</p>
          <h2 className="text-3xl font-extrabold text-foreground">Roles, Permissions & Audit Trail</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Who can see what, enforced in the database, with a record of every access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border bg-card p-5 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <c.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
            </div>
            <ul className="space-y-1.5">
              {c.items.map((i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-blue-600">•</span>
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
