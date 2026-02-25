

# Add Expand All / Collapse All to Chart of Accounts Tree

## Problem
Each `AccountNode` manages its own `isExpanded` state independently via `useState`. There is no way to expand or collapse all nodes at once -- users must click each chevron individually to navigate the full 4-level hierarchy.

## Approach
Lift expand/collapse state to the `AccountTree` parent component using a single `expandedIds: Set<string>` state. Pass it down to `AccountNode` instead of each node managing its own state. Add two buttons ("Expand All" / "Collapse All") that set all node IDs or clear them.

## Changes

### 1. `src/components/accounts/AccountTree.tsx`

- Add `expandedIds` state (`Set<string>`) at the `AccountTree` level, initialized with all accounts at level <= 2 (matching current default behavior)
- Add a helper `collectAllIds(accounts)` that recursively gathers IDs of all accounts that have children
- Add "Expand All" button: sets `expandedIds` to all parent IDs
- Add "Collapse All" button: clears `expandedIds` to empty set
- Render buttons in a flex row above the tree
- Update `AccountNode` to receive `expandedIds` and `onToggleExpand` as props instead of using local `useState`
- `AccountNode.isExpanded` becomes `expandedIds.has(account.id)`
- `handleToggle` calls `onToggleExpand(account.id)` which adds/removes from the set

### 2. `src/pages/app/accounts/ChartOfAccountsPage.tsx`

- No changes needed -- buttons live inside `AccountTree` component

### 3. Translation keys (`en.ts`, `ur.ts`, `ar.ts`)

- `"accounts.expandAll"`: "Expand All" / "سب کھولیں" / "توسيع الكل"
- `"accounts.collapseAll"`: "Collapse All" / "سب بند کریں" / "طي الكل"

## Technical Details

- `collectAllIds` recursively walks the tree and returns IDs of nodes where `children?.length > 0`
- Initial state: `new Set(collectAllIds(accounts, 2))` -- expands levels 1-2 by default (same as current behavior)
- The `Set` approach is performant -- O(1) lookup per node, no re-render cascade since state is in a single parent
- Icons used: `ChevronsDownUp` for collapse, `ChevronsUpDown` for expand (from lucide-react)

