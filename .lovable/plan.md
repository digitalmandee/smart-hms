

## Findings

### 1. Duty Roster: Route exists, menu item missing
- `DutyRosterPage.tsx` exists at `/app/hr/attendance/roster`
- The Attendance parent (`53078cd3`) has 6 children but NO "Duty Roster" entry
- Also missing: On-Call Schedule, Overtime, OT Duty Roster, Publish Roster, Roster Reports

### 2. Leave Flow: Already working
- Leave Management parent exists with children: Leave Requests, Leave Balances, Leave Calendar, Pending Approvals
- `LeavesPage.tsx` has Apply Leave dialog (select employee, type, dates, reason) and Approve/Reject buttons
- `MyLeavesPage.tsx` exists for employee self-service portal
- Flow is complete: Apply → Pending → Approve/Reject

### 3. Exit Management: No menu items at all
- Routes exist in `App.tsx`: resignations, clearance, settlements, exit interviews
- Pages exist: `ResignationsPage.tsx`, `ClearancePage.tsx`, `SettlementsPage.tsx`, `ExitInterviewsPage.tsx`
- Zero `menu_items` rows — no parent group, no children
- Icons `DoorOpen`, `FileText`, `Briefcase`, `ScrollText` already in `iconMap`

### 4. Other missing attendance sub-items
- Roster Reports (`/app/hr/attendance/roster-reports`)
- Publish Roster (`/app/hr/attendance/publish-roster`)

## Plan

**Migration**: Insert menu_items for:

| Item | Icon | Path | Parent |
|------|------|------|--------|
| **Exit Management** (parent) | `DoorOpen` | null | HR & Staff (`720b3ed9`) |
| Resignations | `FileText` | `/app/hr/exit/resignations` | Exit Management |
| Clearance | `ClipboardCheck` | `/app/hr/exit/clearance` | Exit Management |
| Final Settlements | `DollarSign` | `/app/hr/exit/settlements` | Exit Management |
| Exit Interviews | `MessageSquare` | `/app/hr/exit/interviews` | Exit Management |
| **Duty Roster** | `CalendarDays` | `/app/hr/attendance/roster` | Attendance (`53078cd3`) |
| On-Call Schedule | `Headphones` | `/app/hr/attendance/on-call` | Attendance |
| OT Duty Roster | `Scissors` | `/app/hr/attendance/ot-roster` | Attendance |
| Publish Roster | `PlayCircle` | `/app/hr/attendance/publish-roster` | Attendance |
| Roster Reports | `BarChart` | `/app/hr/attendance/roster-reports` | Attendance |
| Overtime | `Clock` | `/app/hr/attendance/overtime` | Attendance |

One SQL migration file. No code changes needed — all icons already exist in `iconMap`.

