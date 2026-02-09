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
        'fixed z-50 transition-all duration-300 safe-area-bottom',
        // Mobile: full-width bottom bar
        'bottom-0 left-0 right-0 p-3 sm:p-0',
        // Desktop: centered floating pill
        'sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      )}
    >
      <div className="flex items-center gap-3 bg-card/95 backdrop-blur-lg border shadow-lg rounded-xl sm:rounded-full pl-4 sm:pl-6 pr-2 py-2">
        <span className="text-sm font-medium hidden sm:block">
          Ready to streamline your clinic?
        </span>
        <a
          href="/auth/signup"
          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 sm:py-2 rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </a>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-2 hover:bg-muted rounded-full transition-colors flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
