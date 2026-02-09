import { Building2, Users, Clock, Shield } from 'lucide-react';
import { AnimatedSection, StaggerChildren } from './AnimatedSection';

const badges = [
  { icon: Building2, value: '500+', label: 'Clinics Trust Us' },
  { icon: Users, value: '50,000+', label: 'Patients Managed' },
  { icon: Clock, value: '99.9%', label: 'Uptime Guaranteed' },
  { icon: Shield, value: '24/7', label: 'Available Always' },
];

export const TrustBadges = () => {
  return (
    <div className="bg-muted/50 border-y py-6">
      <div className="container mx-auto px-4">
        <StaggerChildren
          staggerDelay={100}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
        >
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div key={badge.label} className="flex items-center gap-2 md:gap-3 justify-center">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-base md:text-lg">{badge.value}</div>
                  <div className="text-xs md:text-sm text-muted-foreground truncate">{badge.label}</div>
                </div>
              </div>
            );
          })}
        </StaggerChildren>
      </div>
    </div>
  );
};
