import { HealthOS24Logo } from "@/components/brand/HealthOS24Logo";

interface ProposalCoverPageProps {
  clientName?: string;
}

export const ProposalCoverPage = ({ clientName = "[Hospital Name]" }: ProposalCoverPageProps) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="proposal-page flex flex-col justify-between bg-gradient-to-br from-background via-background to-primary/5 p-12">
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <HealthOS24Logo variant="full" size="lg" showTagline />
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Confidential Proposal
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center items-center text-center py-16">
        {/* Gradient Bar */}
        <div className="w-32 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-full mb-8" />
        
        {/* Document Title */}
        <h2 className="text-5xl font-bold text-foreground mb-4 tracking-tight">
          HealthOS 24 Proposal
        </h2>
        <p className="text-xl text-muted-foreground mb-12">
          24/7 Smart Hospital Management System
        </p>

        {/* Client Name Box */}
        <div className="bg-card border-2 border-primary/20 rounded-2xl px-12 py-8 shadow-lg">
          <p className="text-sm text-muted-foreground mb-2">Prepared For</p>
          <h3 className="text-3xl font-bold text-primary">Capital Care International Hospital</h3>
        </div>

        {/* Version & Date */}
        <div className="mt-12 flex items-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Version 1.0</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <p className="font-medium text-foreground">HealthOS 24</p>
            <p>Enterprise Healthcare Technology</p>
          </div>
          <div className="text-right text-muted-foreground">
            <p className="font-medium text-foreground">healthos24.com</p>
            <p>+971 506802430</p>
          </div>
        </div>
      </div>
    </div>
  );
};
