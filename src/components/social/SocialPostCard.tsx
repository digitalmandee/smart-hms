import { useRef, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SocialPost } from "./socialPostsData";

interface SocialPostCardProps {
  post: SocialPost;
}

export const SocialPostCard = ({ post }: SocialPostCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [scale, setScale] = useState(0.25);
  const Icon = post.icon;

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
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        cacheBust: true,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "1080px",
          height: "1080px",
        },
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
              position: "absolute",
              top: 0,
              left: 0,
              width: "1080px",
              height: "1080px",
              transformOrigin: "top left",
              transform: `scale(${scale})`,
            }}
          >
            {/* Actual 1080x1080 card */}
            <div
              ref={cardRef}
              data-social-card
              data-post-id={post.id}
              className={cn(
                "w-[1080px] h-[1080px] flex flex-col justify-between p-[80px] relative overflow-hidden bg-gradient-to-br",
                post.gradientFrom,
                post.gradientTo
              )}
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              {/* Decorative circles */}
              <div
                className={cn("absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full opacity-10", post.accentColor)}
              />
              <div
                className={cn("absolute -bottom-[150px] -left-[150px] w-[400px] h-[400px] rounded-full opacity-[0.07]", post.accentColor)}
              />

              {/* Top: Logo + Module badge */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-[16px]">
                  <div className="w-[64px] h-[64px] bg-white/15 backdrop-blur-sm rounded-[16px] flex items-center justify-center border border-white/20">
                    <span className="text-white font-bold text-[28px]" style={{ letterSpacing: "-2px" }}>24</span>
                  </div>
                  <span className="text-white/80 text-[28px] font-bold tracking-tight">HealthOS</span>
                </div>
                {post.module && (
                  <span className="bg-white/15 backdrop-blur-sm text-white text-[22px] font-semibold px-[24px] py-[10px] rounded-full border border-white/20">
                    {post.module}
                  </span>
                )}
              </div>

              {/* Center: Hook + Subtext */}
              <div className="flex-1 flex flex-col justify-center gap-[40px] relative z-10">
                <h2 className="text-white text-[72px] font-extrabold leading-[1.1] tracking-tight drop-shadow-lg">
                  {post.hook}
                </h2>
                <p className="text-white/75 text-[32px] leading-[1.4] font-medium max-w-[850px]">
                  {post.subtext}
                </p>
              </div>

              {/* Bottom: Icon + watermark */}
              <div className="flex items-end justify-between relative z-10">
                <div className="w-[80px] h-[80px] rounded-[20px] flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20">
                  <Icon className="w-[44px] h-[44px] text-white" strokeWidth={1.5} />
                </div>
                <span className="text-white/40 text-[24px] font-medium tracking-wide">healthos.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Download overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-xl">
          <Button
            onClick={handleDownload}
            disabled={downloading}
            size="lg"
            className="bg-white text-foreground hover:bg-white/90 shadow-lg font-semibold gap-2"
          >
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
