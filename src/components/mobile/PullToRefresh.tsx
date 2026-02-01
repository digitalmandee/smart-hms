import { useState, useRef, useCallback, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/hooks/useHaptics";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  className?: string;
  threshold?: number;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  className,
  threshold = 80 
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const haptics = useHaptics();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    if (diff > 0 && containerRef.current?.scrollTop === 0) {
      // Apply resistance for a more natural feel
      const resistance = 0.4;
      const distance = Math.min(diff * resistance, threshold * 1.5);
      setPullDistance(distance);
      
      // Haptic feedback when threshold is crossed
      if (distance >= threshold && pullDistance < threshold) {
        haptics.medium();
      }
    }
  }, [isPulling, isRefreshing, threshold, pullDistance, haptics]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      haptics.success();
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, haptics]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div 
      ref={containerRef}
      className={cn("overflow-y-auto overscroll-contain h-full", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div 
        className={cn(
          "flex items-center justify-center transition-all duration-200",
          isRefreshing && "pb-4"
        )}
        style={{ 
          height: isRefreshing ? 48 : pullDistance,
          opacity: progress
        }}
      >
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full bg-muted",
          isRefreshing && "animate-spin"
        )}>
          <Loader2 
            className={cn(
              "h-5 w-5 text-primary transition-transform",
              !isRefreshing && "animate-none"
            )}
            style={{ 
              transform: isRefreshing ? undefined : `rotate(${progress * 360}deg)` 
            }}
          />
        </div>
      </div>
      
      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: isPulling && !isRefreshing ? `translateY(${pullDistance}px)` : 'none' 
        }}
      >
        {children}
      </div>
    </div>
  );
}
