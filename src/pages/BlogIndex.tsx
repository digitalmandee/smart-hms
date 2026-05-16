import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { posts, categories } from "@/content/blog/posts";
import { Search, Clock, ArrowRight } from "lucide-react";

export default function BlogIndex() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="HealthOS 24 Blog — Hospital Management, KSA Compliance & Clinical Workflows"
        description="Practical guides on hospital management systems, NPHIES, ZATCA, Wasfaty, pharmacy inventory, OPD/IPD workflows and healthcare finance."
        path="/blog"
      />

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Blog</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            HealthOS 24 Blog
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Field-tested guides on hospital management, KSA regulatory compliance,
            pharmacy operations, clinical workflows and healthcare finance.
          </p>

          <div className="mt-8 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles by topic, keyword or category..."
              className="pl-10"
              aria-label="Search blog articles"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeCategory === null ? "default" : "outline"}
              onClick={() => setActiveCategory(null)}
            >
              All ({posts.length})
            </Button>
            {categories.map((cat) => {
              const count = posts.filter((p) => p.category === cat).length;
              return (
                <Button
                  key={cat}
                  size="sm"
                  variant={activeCategory === cat ? "default" : "outline"}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No articles match "{query}". Try a different keyword.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filtered.map((post) => (
              <Card key={post.slug} className="flex flex-col hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readingMinutes} min
                    </span>
                  </div>
                  <CardTitle className="text-xl leading-tight">
                    <Link to={`/blog/${post.slug}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-sm font-medium text-primary inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    Read article <ArrowRight className="h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
