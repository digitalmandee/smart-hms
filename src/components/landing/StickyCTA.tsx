import { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past hero (roughly 600px)
      const shouldShow = window.scrollY > 600;
      setIsVisible(shouldShow && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="flex items-center gap-3 bg-card border shadow-soft-lg rounded-full pl-6 pr-2 py-2">
        <span className="text-sm font-medium hidden sm:block">
          Ready to streamline your clinic?
        </span>
        <a
          href="/auth/signup"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </a>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
