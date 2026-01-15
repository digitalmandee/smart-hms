import { useCallback, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useInView = (options: UseInViewOptions = {}) => {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const ref = useCallback(
    (node: HTMLDivElement | null) => {
      if (!node) return;
      if (triggerOnce && hasTriggered) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            setHasTriggered(true);
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(node);

      return () => observer.disconnect();
    },
    [threshold, rootMargin, triggerOnce, hasTriggered]
  );

  return { ref, isInView };
};
