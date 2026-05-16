import { Helmet } from "react-helmet-async";

const SITE = "https://healthos24.com";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
  type?: "website" | "article";
}

/**
 * Per-route head tags. Sets unique <title>, meta description, canonical,
 * and Open Graph tags. Overrides the sitewide defaults from index.html.
 */
export function SEO({ title, description, path = "/", noindex, type = "website" }: SEOProps) {
  const url = `${SITE}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
