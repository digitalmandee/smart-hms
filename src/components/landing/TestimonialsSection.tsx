import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Fatima Malik",
    role: "Medical Director",
    facility: "Al-Shifa Hospital, Karachi",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    content: "SmartHMS transformed our hospital operations. Patient wait times reduced by 60% and our billing accuracy improved significantly.",
    rating: 5,
  },
  {
    name: "Imran Ahmed",
    role: "Administrator",
    facility: "City Medical Center, Lahore",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "The multi-branch feature is a game changer. We manage 3 clinics from a single dashboard with complete visibility.",
    rating: 5,
  },
  {
    name: "Dr. Sarah Khan",
    role: "General Physician",
    facility: "Family Care Clinic, Islamabad",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=100&h=100&fit=crop&crop=face",
    content: "The consultation workflow is intuitive. I can focus on patients instead of paperwork. Prescription generation is incredibly fast.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Healthcare
            <span className="text-primary"> Professionals</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what doctors, administrators, and healthcare facilities say about SmartHMS.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                ))}
              </div>
              
              <p className="text-muted-foreground mb-6 italic">"{testimonial.content}"</p>
              
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary">{testimonial.facility}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
