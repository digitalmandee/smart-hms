import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Shahid Mahmood",
    role: "Medical Director",
    facility: "City General Hospital, Lahore",
    content: "We reduced patient wait times by 60% after implementing SmartHMS. The token system alone has transformed our OPD.",
    rating: 5,
  },
  {
    name: "Amina Rashid",
    role: "Clinic Manager",
    facility: "Family Care Clinic, Karachi",
    content: "Finally, no more Excel sheets! Billing reconciliation that used to take 2 hours now takes 10 minutes.",
    rating: 5,
  },
  {
    name: "Dr. Hassan Ali",
    role: "General Physician",
    facility: "Al-Shifa Medical Center, Islamabad",
    content: "I can see a patient's entire history before they even sit down. Prescriptions are sent directly to pharmacy - no more lost slips.",
    rating: 5,
  },
];

const stats = [
  { value: "500+", label: "Clinics" },
  { value: "50,000+", label: "Patients Served" },
  { value: "60%", label: "Faster Check-ins" },
  { value: "2M+", label: "Prescriptions Generated" },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Stats bar */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center p-6 rounded-2xl bg-card border border-border">
                <p className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Don&apos;t take our word for it
          </h2>
          <p className="text-lg text-muted-foreground">
            Hear from healthcare professionals who&apos;ve transformed their practice
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-card border border-border rounded-2xl p-8 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
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
        </div>
      </div>
    </section>
  );
};
