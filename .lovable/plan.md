

## Problem

The **Lab Queue page** explicitly filters out completed orders (line 40: `if (order.status === "completed") return false`). There is **no separate page** to view submitted/completed orders, review them, or publish reports. Once an order is submitted for approval, it vanishes from the queue with nowhere to find it.

## Plan

### 1. Add a "Completed" tab to the Lab Queue page (`src/pages/app/lab/LabQueuePage.tsx`)
- Add a **"Completed"** tab to the status filter tabs alongside "All Status", "Ordered", "Collected", "Processing"
- Update the `StatusFilter` type to include `"completed"`
- When "Completed" is selected, show only completed orders (reverse the filter logic)
- For non-"completed" tabs, keep the existing behavior of excluding completed/cancelled orders

### 2. Update the filter logic (same file)
- Line 40: Instead of always excluding completed, conditionally include them based on `statusFilter`:
  ```
  if statusFilter === "completed" → only show completed
  if statusFilter === "all" → exclude completed (queue view)
  if statusFilter is specific status → show that status only
  ```

### 3. Ensure LabOrderCard allows navigation for completed orders (`src/components/lab/LabOrderCard.tsx`)
- Already fixed in previous iteration — "View Results" button is enabled for completed orders
- Verify the button label shows "View Results" for completed, "Enter Results" for in-progress

This gives lab staff a single page with tabs: active queue (default) and completed orders (for review/publish).

