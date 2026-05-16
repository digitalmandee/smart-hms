import { Link, useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPostBySlug, getRelatedPosts } from "@/content/blog/posts";
import { Clock, Calendar, ArrowLeft, ArrowRight } from "lucide-react";

const SITE = "https://healthos24.com";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) return <Navigate to="/blog" replace />;

  const related = getRelatedPosts(post.slug);
  const url = `${SITE}/blog/${post.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@type": "Organization", name: "HealthOS 24" },
    publisher: {
      "@type": "Organization",
      name: "HealthOS 24",
      url: SITE,
    },
    mainEntityOfPage: url,
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  const faqJsonLd = post.faq && post.faq.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={post.title} description={post.description} path={`/blog/${post.slug}`} type="article" />
      <Helmet>
        <meta property="article:published_time" content={post.publishedAt} />
        <meta property="article:section" content={post.category} />
        {post.keywords.map((k) => (
          <meta key={k} property="article:tag" content={k} />
        ))}
        <script type="application/ld+json">{JSON.stringify(articleJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>

      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{post.category}</span>
          </nav>
          <Badge variant="secondary" className="mb-3">{post.category}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground">{post.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingMinutes} min read
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">{post.intro}</p>

          {post.sections.map((section) => (
            <section key={section.heading} className="mt-8">
              <h2 className="text-2xl font-semibold mt-8 mb-3">{section.heading}</h2>
              {section.paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed mb-4">{p}</p>
              ))}
              {section.bullets && (
                <ul className="list-disc pl-6 space-y-1">
                  {section.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <section className="mt-10">
            <h2 className="text-2xl font-semibold mt-8 mb-3">Conclusion</h2>
            <p className="leading-relaxed">{post.conclusion}</p>
          </section>

          {post.faq && post.faq.length > 0 && (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold mt-8 mb-3">Frequently asked questions</h2>
              <div className="space-y-4">
                {post.faq.map((f) => (
                  <div key={f.q}>
                    <h3 className="font-semibold mb-1">{f.q}</h3>
                    <p className="text-muted-foreground">{f.a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        {post.relatedLinks.length > 0 && (
          <aside className="mt-12 p-6 rounded-lg border bg-card">
            <h2 className="font-semibold mb-3">Continue exploring HealthOS 24</h2>
            <ul className="space-y-2">
              {post.relatedLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-primary hover:underline inline-flex items-center gap-1">
                    {l.label} <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold mb-4">Related articles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Card key={r.slug}>
                  <CardHeader>
                    <CardTitle className="text-base leading-tight">
                      <Link to={`/blog/${r.slug}`} className="hover:underline">
                        {r.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">{r.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex justify-between">
          <Button variant="outline" asChild>
            <Link to="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" /> All articles
            </Link>
          </Button>
          <Button asChild>
            <Link to="/pricing-proposal">See HealthOS 24 pricing</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
