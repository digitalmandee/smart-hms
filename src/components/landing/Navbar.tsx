import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, FileDown, Sparkles } from "lucide-react";
import { HealthOS24Logo, HealthOS24Badge } from "@/components/brand/HealthOS24Logo";

const navLinks = [
  { label: "Tabeebi", href: "/tabeebi", isSpecial: true, isRoute: true },
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#flow" },
  { label: "Roles", href: "#roles" },
  { label: "Compare", href: "#compare" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <HealthOS24Logo variant="full" size="sm" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/presentation" target="_blank">
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Presentation
              </Button>
            </Link>
            <Link to="/pharmacy-warehouse-presentation" target="_blank">
              <Button variant="outline" size="sm">
                <FileDown className="h-4 w-4 mr-2" />
                Pharmacy & Warehouse
              </Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-border animate-fade-in">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={(e) => {
                    scrollToSection(e, link.href);
                    setIsOpen(false);
                  }}
                >
                  {link.label}
                </a>
              )
            )}
            <div className="flex flex-col gap-2 pt-4">
              <Link to="/presentation" target="_blank" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  <FileDown className="h-4 w-4 mr-2" />
                  Presentation
                </Button>
              </Link>
              <Link to="/pharmacy-warehouse-presentation" target="_blank" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  <FileDown className="h-4 w-4 mr-2" />
                  Pharmacy & Warehouse
                </Button>
              </Link>
              <Link to="/auth/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/signup" onClick={() => setIsOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
