import { useInView } from '@/hooks/useInView';
import { cn } from '@/lib/utils';

type AnimationType = 'fade-up' | 'fade-left' | 'fade-right' | 'scale-in' | 'fade-in';

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: AnimationType;
  delay?: number;
  className?: string;
  threshold?: number;
}

const animationClasses: Record<AnimationType, { initial: string; animate: string }> = {
  'fade-up': {
    initial: 'opacity-0 translate-y-8',
    animate: 'opacity-100 translate-y-0',
  },
  'fade-left': {
    initial: 'opacity-0 -translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'fade-right': {
    initial: 'opacity-0 translate-x-8',
    animate: 'opacity-100 translate-x-0',
  },
  'scale-in': {
    initial: 'opacity-0 scale-95',
    animate: 'opacity-100 scale-100',
  },
  'fade-in': {
    initial: 'opacity-0',
    animate: 'opacity-100',
  },
};

export const AnimatedSection = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className,
  threshold = 0.1,
}: AnimatedSectionProps) => {
  const { ref, isInView } = useInView({ threshold });

  const { initial, animate } = animationClasses[animation];

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isInView ? animate : initial,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface StaggerChildrenProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
  childClassName?: string;
  animation?: AnimationType;
}

export const StaggerChildren = ({
  children,
  staggerDelay = 100,
  className,
  childClassName,
  animation = 'fade-up',
}: StaggerChildrenProps) => {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const { initial, animate } = animationClasses[animation];

  return (
    <div ref={ref} className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(
            'transition-all duration-500 ease-out',
            isInView ? animate : initial,
            childClassName
          )}
          style={{ transitionDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
