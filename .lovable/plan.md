

# Redesign Token Kiosk Display: Bigger "Up Next", Compact "Now Serving"

## Current Layout (col-span-2 / col-span-1)
- **Now Serving** takes 2/3 of the screen with large patient cards (name, MR#, doctor, specialization, department badge)
- **Up Next** takes 1/3 as a sidebar, showing up to 10 patients with name, wait time, department badge, priority
- When queue exceeds 10, extra patients are simply hidden with no indication

## Proposed Redesign

### Flip the Layout: Up Next Gets 2/3, Now Serving Gets 1/3

**Now Serving (left column, col-span-1):**
- Show only the token number in a large colored box (e.g., `MED-005`)
- Remove patient name, MR#, doctor name, specialization -- just the token
- Stack multiple "now serving" tokens vertically as compact cards
- Each card: colored token badge + department code badge (if applicable)
- This is what patients in the waiting room actually need -- just "what number is being called"

**Up Next (right panel, col-span-2):**
- Grid layout instead of a list: 4 columns x multiple rows
- Each cell shows: token number (large), priority dot (if urgent/emergency)
- No patient names, no doctor info, no wait time -- just token numbers
- Fits ~20-24 tokens visible at once

### Overflow Handling
When more patients are waiting than fit on screen:
- Show a footer bar at the bottom of the "Up Next" panel: **"+12 more in queue"**
- Auto-scroll/paginate: cycle through pages every 8 seconds so all tokens get displayed
- The counter updates in real-time as patients check in or get called

## Files to Edit

| File | Changes |
|------|---------|
| `src/pages/app/appointments/TokenKioskPage.tsx` | Flip grid to `col-span-1` (Now Serving) + `col-span-2` (Up Next). Strip Now Serving to token-only cards. Convert Up Next to a 4-column grid of token badges. Add overflow counter + auto-pagination. |
| `src/lib/i18n/translations/en.ts` | Add `opd.moreInQueue`: "+{count} more in queue" |
| `src/lib/i18n/translations/ar.ts` | Add `opd.moreInQueue`: "+{count} المزيد في الطابور" |
| `src/lib/i18n/translations/ur.ts` | Add `opd.moreInQueue`: "+{count} مزید قطار میں" |

## Technical Details

**Now Serving section** (compact):
```
┌─────────────────┐
│  NOW SERVING     │
│                  │
│  ┌────────────┐  │
│  │  MED-005   │  │  ← Large token, colored by dept
│  │  Dr. Khan  │  │  ← Doctor name only (small)
│  └────────────┘  │
│  ┌────────────┐  │
│  │  SURG-012  │  │  ← Multiple doctors serving
│  │  Dr. Ali   │  │
│  └────────────┘  │
│                  │
└─────────────────┘
```

**Up Next section** (grid, token-only):
```
┌──────────────────────────────────────────┐
│  UP NEXT                                  │
│                                           │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ 006  │  │ 007  │  │ 008  │  │ 009  │ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ 010  │  │ 011  │  │ 012  │  │ 013  │ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ 014  │  │ 015  │  │ 016  │  │ 017  │ │
│  └──────┘  └──────┘  └──────┘  └──────┘ │
│                                           │
│              +8 more in queue             │
└──────────────────────────────────────────┘
```

**Auto-pagination logic:**
- `TOKENS_PER_PAGE = 12` (4 cols x 3 rows)
- `useState` for `currentPage`, cycles via `setInterval` every 8 seconds
- Total pages = `Math.ceil(upNext.length / TOKENS_PER_PAGE)`
- Reset to page 0 when queue changes
- Show page dots if > 1 page

**Token cell styling:**
- Each cell: `rounded-xl` with department color background (or muted default)
- Token number in `text-2xl font-bold font-mono` centered
- Priority indicator: small colored dot in top-right corner for urgent/emergency
- First token (index 0) gets a subtle highlight/border to indicate "you're next"

