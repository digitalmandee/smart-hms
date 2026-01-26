import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail, MessageCircle } from "lucide-react";

export const CTASection = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  (props, ref) => {
    return (
      <section ref={ref} id="contact" className="py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10 relative overflow-hidden" {...props}>
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            Ready to modernize your
            <span className="text-primary"> healthcare facility?</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join 500+ clinics across Pakistan and the Middle East. Start your free trial today - no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="group text-lg px-8" asChild>
              <Link to="/auth/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8" asChild>
              <Link to="/auth/login">
                Login to Demo
              </Link>
            </Button>
          </div>
          
          {/* Contact options */}
          <div className="flex flex-wrap justify-center gap-6 pt-8 border-t border-border">
            <a href="tel:+971506802430" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-5 w-5" />
              <span>+971 506802430 (UAE)</span>
            </a>
            <a href="tel:+923154441518" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="h-5 w-5" />
              <span>+92 315 4441518 (PK)</span>
            </a>
            <a href="mailto:hello@healthos.ae" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Mail className="h-5 w-5" />
              <span>hello@healthos.ae</span>
            </a>
            <a href="https://wa.me/971506802430" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <MessageCircle className="h-5 w-5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
      </section>
    );
  }
);

CTASection.displayName = "CTASection";
