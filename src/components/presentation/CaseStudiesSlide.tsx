import { Building2, MapPin, Users, Clock, TrendingUp, Quote, Star, CheckCircle2 } from "lucide-react";

const caseStudies = [
  {
    city: "Sharjah",
    cityColor: "bg-red-600",
    facility: "Emirates Care Hospital",
    type: "200-Bed Multi-Specialty Hospital",
    logo: "🏥",
    metrics: [
      { label: "Wait Time", value: "-60%", highlight: true },
      { label: "Revenue Up", value: "+35%" },
    ],
    achievements: [
      "Full billing reconciliation",
      "Zero revenue leakage",
      "Paperless operations",
    ],
    quote: "HealthOS transformed our operations completely. Patient flow is now seamless and staff productivity has doubled.",
    quotePerson: "Dr. Ahmed Al Rashid",
    quoteRole: "Medical Director",
    rating: 5,
  },
  {
    city: "Ajman",
    cityColor: "bg-green-600",
    facility: "Gulf Medical Centre",
    type: "Multi-Specialty Polyclinic",
    logo: "🏨",
    metrics: [
      { label: "Time Saved", value: "4hrs", highlight: true },
      { label: "Staff", value: "50+" },
    ],
    achievements: [
      "Integrated lab & pharmacy",
      "Automated billing",
      "Real-time reporting",
    ],
    quote: "Staff loves the intuitive interface. Training took just 2 days. We saw ROI within the first month.",
    quotePerson: "Dr. Fatima Hassan",
    quoteRole: "Operations Head",
    rating: 5,
  },
  {
    city: "Dubai",
    cityColor: "bg-black",
    facility: "Al Noor Medical Center",
    type: "Premier Diagnostic Hub",
    logo: "🔬",
    metrics: [
      { label: "Billing Errors", value: "-95%", highlight: true },
      { label: "Lab Integration", value: "100%" },
    ],
    achievements: [
      "15-min result delivery",
      "Auto abnormal flags",
      "PACS integration",
    ],
    quote: "Complete visibility into operations. Revenue leakage is now zero. Best investment we've made.",
    quotePerson: "Mr. Khalid Bin Saeed",
    quoteRole: "Chief Financial Officer",
    rating: 5,
  },
];

export const CaseStudiesSlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* UAE Flag Gradient Header */}
      <div className="h-2 flex rounded-t-lg overflow-hidden -mx-8 -mt-8 mb-6">
        <div className="w-1/4 bg-green-600" />
        <div className="w-1/2 bg-white" />
        <div className="w-1/4 bg-black" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">UAE Success Stories</h2>
            <p className="text-sm text-muted-foreground">Trusted by Leading Healthcare Facilities</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
          26 / 30
        </span>
      </div>

      {/* Case Study Cards */}
      <div className="grid grid-cols-3 gap-5 flex-1">
        {caseStudies.map((study) => (
          <div
            key={study.city}
            className="bg-card border border-border rounded-xl p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            {/* City Badge & Logo */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${study.cityColor}`}>
                  {study.city.toUpperCase()}
                </div>
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-2xl">{study.logo}</span>
            </div>

            {/* Facility Info */}
            <h3 className="text-lg font-bold mb-0.5">{study.facility}</h3>
            <p className="text-xs text-muted-foreground mb-3">{study.type}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {study.metrics.map((metric) => (
                <div key={metric.label} className={`rounded-lg p-2.5 text-center ${metric.highlight ? 'bg-primary/10' : 'bg-muted/50'}`}>
                  <div className={`text-lg font-bold ${metric.highlight ? 'text-primary' : ''}`}>{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="space-y-1.5 mb-3">
              {study.achievements.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="mt-auto bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
              <Quote className="h-3.5 w-3.5 text-primary mb-1" />
              <p className="text-xs italic text-muted-foreground mb-2">"{study.quote}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold">{study.quotePerson}</p>
                  <p className="text-xs text-muted-foreground">{study.quoteRole}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(study.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm"><strong>500+</strong> Healthcare Facilities</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm"><strong>24/7</strong> UAE Support</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm"><strong>40%</strong> Avg. Efficiency Gain</span>
          </div>
        </div>
      </div>
    </div>
  );
};
