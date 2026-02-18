import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsRTL } from "@/lib/i18n";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  hideBreadcrumbsOnMobile?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  hideBreadcrumbsOnMobile = true,
}: PageHeaderProps) {
  const isMobile = useIsMobile();
  const isRTL = useIsRTL();
  const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 0 && !(hideBreadcrumbsOnMobile && isMobile);

  return (
    <div className="mb-6 space-y-2">
      {showBreadcrumbs && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              {index > 0 && (isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              {item.href ? (
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{item.label}</span>
              )}
            </div>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
