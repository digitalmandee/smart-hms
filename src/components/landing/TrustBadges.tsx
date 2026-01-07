import { Building2, Users, Clock, Shield } from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const badges = [
  { icon: Building2, value: '500+', label: 'Clinics Trust Us' },
  { icon: Users, value: '50,000+', label: 'Patients Managed' },
  { icon: Clock, value: '99.9%', label: 'Uptime Guaranteed' },
  { icon: Shield, value: 'HIPAA', label: 'Compliant Security' },
];

export const TrustBadges = () => {
  return (
    <div className="bg-muted/50 border-y py-6">
      <div className="container mx-auto px-4">
        <StaggerChildren
          staggerDelay={100}
          className="flex flex-wrap justify-center items-center gap-8 md:gap-16"
        >
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-lg">{badge.value}</div>
                  <div className="text-sm text-muted-foreground">{badge.label}</div>
                </div>
              </div>
            );
          })}
        </StaggerChildren>
      </div>
    </div>
  );
};
