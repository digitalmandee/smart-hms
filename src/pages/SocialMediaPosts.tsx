import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SocialPostCard } from "@/components/social/SocialPostCard";
import {
  socialPosts,
  categoryLabels,
  categoryColors,
  type PostCategory,
} from "@/components/social/socialPostsData";

type FilterTab = "all" | PostCategory;

const SocialMediaPosts = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [downloadingAll, setDownloadingAll] = useState(false);

  const filtered =
    activeTab === "all"
      ? socialPosts
      : socialPosts.filter((p) => p.category === activeTab);

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      // Find all card refs on the page
      const cards = document.querySelectorAll<HTMLDivElement>("[data-social-card]");
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const postId = card.getAttribute("data-post-id");
        try {
          const dataUrl = await toPng(card, {
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
          link.download = `healthos-post-${postId || i + 1}.png`;
          link.href = dataUrl;
          link.click();
          // Small delay between downloads
          await new Promise((r) => setTimeout(r, 300));
        } catch (err) {
          console.error(`Failed to download post ${postId}:`, err);
        }
      }
    } finally {
      setDownloadingAll(false);
    }
  };

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: `All (${socialPosts.length})` },
    { value: "modules", label: "Modules (10)" },
    { value: "ai", label: "AI / Tabeebi (5)" },
    { value: "workflows", label: "Workflows (5)" },
    { value: "stats", label: "Stats (5)" },
    { value: "brand", label: "Brand (5)" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Social Media Posts
            </h1>
            <p className="text-sm text-muted-foreground">
              30 ready-to-download posts for Instagram, LinkedIn & Facebook
            </p>
          </div>
          <Button
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            className="gap-2"
          >
            {downloadingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloadingAll ? "Downloading..." : `Download All (${filtered.length})`}
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as FilterTab)}
        >
          <TabsList className="flex-wrap h-auto gap-1">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((post) => (
            <SocialPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialMediaPosts;
