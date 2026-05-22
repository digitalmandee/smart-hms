# Bypassing the 1000-row Supabase Limit

PostgREST caps responses at 1000 rows by default. This breaks reporting and bulk operations silently — no error, just truncated data.

## fetchAllRows helper

```ts
// src/lib/fetchAllRows.ts
export async function fetchAllRows<T>(
  queryFn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>,
  pageSize = 1000
): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await queryFn(from, to);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}
```

## Usage

```ts
const allSales = await fetchAllRows<PosItem>((from, to) =>
  supabase
    .from("pharmacy_pos_items")
    .select("*")
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at")
    .range(from, to)
);
```

## When to use

- Any month-end, year-end, or audit report
- Bulk export to CSV/Excel
- Anything iterating over historical data

## When NOT to use

- Paginated UI tables — let the user paginate.
- Real-time dashboards — aggregate in SQL via an RPC/view instead.
