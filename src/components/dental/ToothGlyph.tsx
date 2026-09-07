import { getToothClass, isUpperTooth, ToothClass } from "@/lib/dental/constants";
import { cn } from "@/lib/utils";

interface Props {
  toothNumber: number;
  /** crown fill colour (hex) */
  fill?: string;
  outline?: string;
  absent?: boolean;
  selected?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

const W = 40;
const H = 68;

/** Root outlines, drawn from the cervical line downwards (crown at top of the local space). */
function rootPaths(cls: ToothClass): string[] {
  switch (cls) {
    case "incisor":
      return ["M14,34 C13,48 17,58 20,64 C23,58 27,48 26,34 Z"];
    case "canine":
      return ["M13,34 C12,50 17,62 20,68 C23,62 28,50 27,34 Z"];
    case "premolar":
      return ["M14,34 C12,48 16,58 18,63 C19,58 20,48 20,34 Z", "M20,34 C20,48 21,58 22,63 C24,58 28,48 26,34 Z"];
    case "molar":
    default:
      return [
        "M11,34 C8,48 11,58 14,62 C16,56 16,46 16,34 Z",
        "M17,34 C17,46 18,56 20,62 C22,56 23,46 23,34 Z",
        "M24,34 C24,46 24,56 26,62 C29,58 32,48 29,34 Z",
      ];
  }
}

/** Crown outline with class-specific cusps (crown at top of local space, cervix at y=34). */
function crownPath(cls: ToothClass): string {
  switch (cls) {
    case "incisor":
      return "M11,34 L11,12 C11,6 14,3 20,3 C26,3 29,6 29,12 L29,34 Z";
    case "canine":
      return "M11,34 L11,14 C11,9 14,2 20,2 C26,2 29,9 29,14 L29,34 Z";
    case "premolar":
      return "M10,34 L10,14 C10,10 12,8 14,10 L16,13 L20,7 L24,13 L26,10 C28,8 30,10 30,14 L30,34 Z";
    case "molar":
    default:
      return "M8,34 L8,15 C8,11 10,9 12,11 L14,14 L17,8 L20,13 L23,8 L26,14 L28,11 C30,9 32,11 32,15 L32,34 Z";
  }
}

export default function ToothGlyph({
  toothNumber,
  fill = "#f3ead9",
  outline = "hsl(var(--muted-foreground))",
  absent,
  selected,
  className,
  onClick,
  title,
}: Props) {
  const cls = getToothClass(toothNumber);
  const upper = isUpperTooth(toothNumber);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className={cn("overflow-visible cursor-pointer", className)}
      onClick={onClick}
      role="img"
      aria-label={title || `Tooth ${toothNumber}`}
    >
      <title>{title || `Tooth ${toothNumber}`}</title>
      {/* upper teeth: roots point up → flip vertically */}
      <g transform={upper ? `translate(0,${H}) scale(1,-1)` : undefined} opacity={absent ? 0.3 : 1}>
        {rootPaths(cls).map((d, i) => (
          <path key={i} d={d} fill={fill} stroke={outline} strokeWidth={0.9} strokeLinejoin="round" />
        ))}
        <path
          d={crownPath(cls)}
          fill={fill}
          stroke={selected ? "hsl(var(--primary))" : outline}
          strokeWidth={selected ? 1.8 : 1}
          strokeLinejoin="round"
        />
      </g>
      {absent && (
        <g stroke="hsl(var(--destructive))" strokeWidth={2}>
          <line x1={8} y1={12} x2={32} y2={56} />
          <line x1={32} y1={12} x2={8} y2={56} />
        </g>
      )}
    </svg>
  );
}
