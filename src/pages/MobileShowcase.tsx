import { useParams } from "react-router-dom";
import {
  MobileShowcaseScreen,
  SHOWCASE_ROLES,
  ShowcaseRole,
  showcaseRoleLabel,
} from "@/components/mobile/showcase/MobileShowcaseScreens";

/**
 * Public, auth-free rendering of the role-based mobile app screens using the
 * real mobile UI components. Used for screenshots in the pitch deck.
 * /mobile-showcase          → all four side by side
 * /mobile-showcase/:role    → one screen, exactly 390x844
 */
export default function MobileShowcase() {
  const { role } = useParams<{ role?: string }>();
  const single = SHOWCASE_ROLES.find((r) => r === role) as ShowcaseRole | undefined;

  if (single) {
    return (
      <div id="shot" className="w-[390px] h-[844px]">
        <MobileShowcaseScreen role={single} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <h1 className="text-2xl font-bold mb-6">Role-based mobile app screens</h1>
      <div className="flex gap-6 overflow-x-auto pb-6">
        {SHOWCASE_ROLES.map((r) => (
          <div key={r} className="shrink-0">
            <p className="text-sm font-semibold mb-2">{showcaseRoleLabel(r)}</p>
            <div className="rounded-[36px] border-8 border-foreground/90 overflow-hidden shadow-2xl">
              <MobileShowcaseScreen role={r} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
