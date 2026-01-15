import { Star, Quote, Play } from "lucide-react";
import { AnimatedSection, StaggerChildren } from "./AnimatedSection";

const testimonials = [
  {
    name: "Dr. Ahmed Al-Rashid",
    role: "Medical Director",
    facility: "Emirates Care Hospital, Sharjah",
    content: "HealthOS transformed our 200-bed facility. Patient wait times dropped by 60% and our billing reconciliation is now seamless.",
    rating: 5,
    hasVideo: true,
  },
  {
    name: "Dr. Fatima Hassan",
    role: "Chief Operating Officer",
    facility: "Al Noor Medical Center, Dubai",
    content: "The integrated lab and pharmacy modules saved us 4 hours daily. Our staff loves the intuitive interface.",
    rating: 5,
    hasVideo: false,
  },
  {
    name: "Dr. Usman Malik",
    role: "General Physician",
    facility: "Garden Town Clinic, Lahore",
    content: "Complete patient history at my fingertips before consultation. Prescriptions go directly to pharmacy - no more lost slips.",
    rating: 5,
    hasVideo: true,
  },
];

const caseStudies = [
  { metric: "60%", label: "Reduced Wait Times", facility: "Emirates Care Hospital" },
  { metric: "4hrs", label: "Daily Time Saved", facility: "Al Noor Medical Center" },
  { metric: "95%", label: "Fewer Billing Errors", facility: "Garden Town Clinic" },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Case Studies Bar */}
        <AnimatedSection animation="fade-up">
          <div className="max-w-4xl mx-auto mb-16">
            <StaggerChildren 
              staggerDelay={150}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {caseStudies.map((study) => (
                <div key={study.label} className="text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all">
                  <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{study.metric}</p>
                  <p className="text-sm font-medium text-foreground mb-1">{study.label}</p>
                  <p className="text-xs text-muted-foreground">{study.facility}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" delay={200} className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Real Results
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Don&apos;t take our word for it
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from healthcare professionals who&apos;ve transformed their practice
          </p>
        </AnimatedSection>

        <StaggerChildren 
          staggerDelay={150}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Video badge */}
              {testimonial.hasVideo && (
                <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <Play className="h-4 w-4" />
                </div>
              )}
              
              {/* Quote icon */}
              <Quote className="absolute top-6 right-6 h-8 w-8 text-primary/20" />
              
              {/* Rating */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-foreground leading-relaxed mb-6 italic">
                &quot;{testimonial.content}&quot;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {testimonial.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-primary">{testimonial.facility}</p>
                </div>
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};
