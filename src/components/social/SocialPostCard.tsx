import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SocialPost } from "./socialPostsData";
import { renderScreenMockup } from "./SocialPostMockups";

const colorMap: Record<string, {
  bar: string; logoBg: string; pillBg: string; pillText: string;
  bottomBar: string; decorBg: string;
}> = {
  teal:    { bar: "#0d9488", logoBg: "#0d9488", pillBg: "#ccfbf1", pillText: "#0f766e", bottomBar: "#0d9488", decorBg: "#0d9488" },
  sky:     { bar: "#0284c7", logoBg: "#0284c7", pillBg: "#e0f2fe", pillText: "#0369a1", bottomBar: "#0284c7", decorBg: "#0284c7" },
  violet:  { bar: "#7c3aed", logoBg: "#7c3aed", pillBg: "#ede9fe", pillText: "#6d28d9", bottomBar: "#7c3aed", decorBg: "#7c3aed" },
  red:     { bar: "#dc2626", logoBg: "#dc2626", pillBg: "#fee2e2", pillText: "#b91c1c", bottomBar: "#dc2626", decorBg: "#dc2626" },
  emerald: { bar: "#059669", logoBg: "#059669", pillBg: "#d1fae5", pillText: "#047857", bottomBar: "#059669", decorBg: "#059669" },
  cyan:    { bar: "#0891b2", logoBg: "#0891b2", pillBg: "#cffafe", pillText: "#0e7490", bottomBar: "#0891b2", decorBg: "#0891b2" },
  orange:  { bar: "#ea580c", logoBg: "#ea580c", pillBg: "#ffedd5", pillText: "#c2410c", bottomBar: "#ea580c", decorBg: "#ea580c" },
  indigo:  { bar: "#4f46e5", logoBg: "#4f46e5", pillBg: "#e0e7ff", pillText: "#4338ca", bottomBar: "#4f46e5", decorBg: "#4f46e5" },
  slate:   { bar: "#475569", logoBg: "#475569", pillBg: "#f1f5f9", pillText: "#334155", bottomBar: "#475569", decorBg: "#475569" },
  lime:    { bar: "#65a30d", logoBg: "#65a30d", pillBg: "#ecfccb", pillText: "#4d7c0f", bottomBar: "#65a30d", decorBg: "#65a30d" },
  pink:    { bar: "#ec4899", logoBg: "#ec4899", pillBg: "#fce7f3", pillText: "#be185d", bottomBar: "#ec4899", decorBg: "#ec4899" },
  rose:    { bar: "#e11d48", logoBg: "#e11d48", pillBg: "#ffe4e6", pillText: "#be123c", bottomBar: "#e11d48", decorBg: "#e11d48" },
  fuchsia: { bar: "#c026d3", logoBg: "#c026d3", pillBg: "#fae8ff", pillText: "#a21caf", bottomBar: "#c026d3", decorBg: "#c026d3" },
  purple:  { bar: "#9333ea", logoBg: "#9333ea", pillBg: "#f3e8ff", pillText: "#7e22ce", bottomBar: "#9333ea", decorBg: "#9333ea" },
  blue:    { bar: "#2563eb", logoBg: "#2563eb", pillBg: "#dbeafe", pillText: "#1d4ed8", bottomBar: "#2563eb", decorBg: "#2563eb" },
  amber:   { bar: "#d97706", logoBg: "#d97706", pillBg: "#fef3c7", pillText: "#b45309", bottomBar: "#d97706", decorBg: "#d97706" },
};

interface SocialPostCardProps {
  post: SocialPost;
}

export const SocialPostCard = ({ post }: SocialPostCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(0.25);
  const colors = colorMap[post.brandColor] || colorMap.teal;

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 270;
      setScale(w / 1080);
    });
    obs.observe(wrapper);
    return () => obs.disconnect();
  }, []);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080, height: 1080, pixelRatio: 1, cacheBust: true,
        style: { transform: "scale(1)", transformOrigin: "top left", width: "1080px", height: "1080px" },
      });
      const link = document.createElement("a");
      link.download = `healthos-post-${post.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="group relative">
      <div
        ref={wrapperRef}
        className="relative overflow-hidden rounded-xl shadow-soft-lg border border-border/40 hover:shadow-glow transition-shadow"
      >
        <div style={{ width: "100%", paddingBottom: "100%", position: "relative" }}>
          <div
            style={{
              position: "absolute", top: 0, left: 0, width: "1080px", height: "1080px",
              transformOrigin: "top left", transform: `scale(${scale})`,
            }}
          >
            {/* 1080x1080 card */}
            <div
              ref={cardRef}
              data-social-card
              data-post-id={post.id}
              style={{
                width: "1080px", height: "1080px", display: "flex", flexDirection: "column",
                position: "relative", overflow: "hidden", backgroundColor: "#ffffff",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {/* Top accent bar */}
              <div style={{ height: "10px", backgroundColor: colors.bar, flexShrink: 0 }} />

              {/* Decorative circles */}
              <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", backgroundColor: colors.decorBg, opacity: 0.06 }} />
              <div style={{ position: "absolute", bottom: "80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", backgroundColor: colors.decorBg, opacity: 0.04 }} />

              {/* Main content */}
              <div style={{ flex: 1, padding: "36px 56px 0", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>

                {/* Header: Logo + Module */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "48px", height: "48px", backgroundColor: colors.logoBg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: "20px", letterSpacing: "-1.5px" }}>24</span>
                    </div>
                    <span style={{ color: "#1e293b", fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em" }}>HealthOS</span>
                  </div>
                  {post.module && (
                    <span style={{ backgroundColor: colors.pillBg, color: colors.pillText, fontSize: "18px", fontWeight: 600, padding: "6px 18px", borderRadius: "9999px" }}>
                      {post.module}
                    </span>
                  )}
                </div>

                {/* Hook text — above mockup */}
                <h2 style={{ color: "#0f172a", fontSize: "46px", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", margin: "0 0 8px" }}>
                  {post.hook}
                </h2>

                {/* Subtext */}
                <p style={{ color: "#64748b", fontSize: "22px", lineHeight: 1.4, fontWeight: 500, margin: "0 0 20px" }}>
                  {post.subtext}
                </p>

                {/* Module UI Mockup */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: 0 }}>
                  <div style={{ transform: "scale(1.15)", transformOrigin: "top center" }}>
                    {renderScreenMockup(post.screenType)}
                  </div>
                </div>
              </div>

              {/* Bottom strip */}
              <div style={{
                height: "72px", backgroundColor: colors.bottomBar, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 56px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "32px", height: "32px", backgroundColor: "rgba(255,255,255,0.25)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: "14px", letterSpacing: "-1px" }}>24</span>
                  </div>
                  <span style={{ color: "#ffffff", fontSize: "20px", fontWeight: 700, letterSpacing: "0.02em" }}>HealthOS</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "20px", fontWeight: 500, letterSpacing: "0.05em" }}>healthos24.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
          <Button onClick={handleDownload} disabled={downloading} size="lg" className="bg-white text-foreground hover:bg-white/90 shadow-lg font-semibold gap-2">
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? "Downloading..." : "Download PNG"}
          </Button>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground text-center truncate px-1">
        #{post.id} — {post.hook}
      </p>
    </div>
  );
};

export default SocialPostCard;
