import { Building2, MapPin, Users, Clock, TrendingUp, Quote } from "lucide-react";

const caseStudies = [
  {
    city: "Sharjah",
    cityColor: "bg-red-600",
    facility: "Emirates Care Hospital",
    type: "Multi-Specialty Hospital",
    metrics: [
      { label: "Beds", value: "200+" },
      { label: "Wait Time Reduced", value: "60%" },
    ],
    quote: "HealthOS transformed our operations completely. Patient flow is now seamless.",
    quotePerson: "Dr. Ahmed Al Rashid, Medical Director",
  },
  {
    city: "Ajman",
    cityColor: "bg-green-600",
    facility: "Gulf Medical Centre",
    type: "Multi-Specialty Clinic",
    metrics: [
      { label: "Staff", value: "50+" },
      { label: "Time Saved Daily", value: "4hrs" },
    ],
    quote: "Staff loves the intuitive interface. Training took just 2 days.",
    quotePerson: "Dr. Fatima Hassan, Operations Head",
  },
  {
    city: "Dubai",
    cityColor: "bg-black",
    facility: "Al Noor Medical Center",
    type: "Diagnostic Center",
    metrics: [
      { label: "Billing Errors", value: "-95%" },
      { label: "Lab Integration", value: "100%" },
    ],
    quote: "Complete visibility into operations. Revenue leakage is now zero.",
    quotePerson: "Mr. Khalid Bin Saeed, CFO",
  },
];

export const CaseStudiesSlide = () => {
  return (
    <div className="slide flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">UAE Success Stories</h2>
            <p className="text-sm text-muted-foreground">Trusted by leading healthcare facilities</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground font-medium">24 / 27</div>
      </div>

      {/* UAE Flag Bar */}
      <div className="flex h-1 mb-8 rounded-full overflow-hidden">
        <div className="w-1/4 bg-green-600" />
        <div className="w-1/2 bg-white border-y border-border" />
        <div className="w-1/4 bg-black" />
      </div>

      {/* Case Study Cards */}
      <div className="grid grid-cols-3 gap-6 flex-1">
        {caseStudies.map((study) => (
          <div
            key={study.city}
            className="bg-card border border-border rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow"
          >
            {/* City Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${study.cityColor}`}>
                {study.city.toUpperCase()}
              </div>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>

            {/* Facility Info */}
            <h3 className="text-lg font-bold mb-1">{study.facility}</h3>
            <p className="text-sm text-muted-foreground mb-4">{study.type}</p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {study.metrics.map((metric) => (
                <div key={metric.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-primary">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <div className="mt-auto bg-primary/5 rounded-lg p-3 border-l-4 border-primary">
              <Quote className="h-4 w-4 text-primary mb-1" />
              <p className="text-sm italic text-muted-foreground mb-2">"{study.quote}"</p>
              <p className="text-xs font-medium">{study.quotePerson}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-sm"><strong>500+</strong> Clinics</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm"><strong>24/7</strong> Support</span>
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
