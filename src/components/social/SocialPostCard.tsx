import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SocialPost } from "./socialPostsData";
import { renderScreenMockup } from "./SocialPostMockups";

interface SocialPostCardProps {
  post: SocialPost;
}

export const SocialPostCard = ({ post }: SocialPostCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(0.25);
  const isDark = post.id % 2 !== 0; // odd = dark, even = light

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
                position: "relative", overflow: "hidden",
                background: isDark
                  ? "linear-gradient(160deg, #062e2a 0%, #0a3d38 30%, #0d9488 100%)"
                  : "linear-gradient(180deg, #ffffff 0%, #f0fdfa 100%)",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {/* Top accent bar - only for light style */}
              {!isDark && (
                <div style={{ height: "10px", backgroundColor: "#0d9488", flexShrink: 0 }} />
              )}

              {/* Decorative circles */}
              <div style={{
                position: "absolute", top: "-120px", right: "-120px",
                width: "450px", height: "450px", borderRadius: "50%",
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(13,148,136,0.06)",
              }} />
              <div style={{
                position: "absolute", top: "200px", right: "80px",
                width: "200px", height: "200px", borderRadius: "50%",
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(13,148,136,0.04)",
              }} />
              <div style={{
                position: "absolute", bottom: "120px", left: "-100px",
                width: "350px", height: "350px", borderRadius: "50%",
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(13,148,136,0.05)",
              }} />
              {/* Dot pattern - top right */}
              <div style={{
                position: "absolute", top: "60px", right: "40px",
                display: "grid", gridTemplateColumns: "repeat(4, 12px)", gap: "10px",
                opacity: isDark ? 0.12 : 0.08,
              }}>
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    backgroundColor: isDark ? "#fff" : "#0d9488",
                  }} />
                ))}
              </div>

              {/* Main content */}
              <div style={{ flex: 1, padding: "40px 56px 0", display: "flex", flexDirection: "column", position: "relative", zIndex: 10 }}>

                {/* Header: Logo + Module */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "48px", height: "48px",
                      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#0d9488",
                      borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "#fff", fontWeight: 800, fontSize: "20px", letterSpacing: "-1.5px" }}>24</span>
                    </div>
                    <span style={{
                      color: isDark ? "#ffffff" : "#1e293b",
                      fontSize: "24px", fontWeight: 700, letterSpacing: "-0.02em",
                    }}>HealthOS</span>
                  </div>
                  {post.module && (
                    <span style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "#ccfbf1",
                      color: isDark ? "#ffffff" : "#0f766e",
                      fontSize: "18px", fontWeight: 600, padding: "6px 18px", borderRadius: "9999px",
                    }}>
                      {post.module}
                    </span>
                  )}
                </div>

                {/* Hook text */}
                <h2 style={{
                  color: isDark ? "#ffffff" : "#0f172a",
                  fontSize: "46px", fontWeight: 800, lineHeight: 1.1,
                  letterSpacing: "-0.03em", margin: "0 0 10px",
                }}>
                  {post.hook}
                </h2>

                {/* Subtext */}
                <p style={{
                  color: isDark ? "#99f6e4" : "#0d9488",
                  fontSize: "22px", lineHeight: 1.4, fontWeight: 500, margin: "0 0 24px",
                }}>
                  {post.subtext}
                </p>

                {/* Module UI Mockup in frame */}
                <div style={{
                  flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
                  minHeight: 0, paddingBottom: "12px",
                }}>
                  <div style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    padding: "16px",
                    boxShadow: isDark
                      ? "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)"
                      : "0 20px 60px rgba(13,148,136,0.15), 0 0 0 2px rgba(13,148,136,0.12)",
                    overflow: "hidden",
                  }}>
                    <div style={{ transform: "scale(1.05)", transformOrigin: "top center" }}>
                      {renderScreenMockup(post.screenType)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom strip */}
              <div style={{
                height: "72px",
                backgroundColor: isDark ? "rgba(0,0,0,0.25)" : "#0d9488",
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0 56px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "32px", height: "32px",
                    backgroundColor: "rgba(255,255,255,0.25)",
                    borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
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
