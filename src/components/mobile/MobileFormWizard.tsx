import { useState, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export interface FormStep {
  id: string;
  title: string;
  icon?: ReactNode;
  content: ReactNode;
  isOptional?: boolean;
  validate?: () => boolean;
}

interface MobileFormWizardProps {
  steps: FormStep[];
  onComplete: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  showProgress?: boolean;
}

export function MobileFormWizard({
  steps,
  onComplete,
  isSubmitting = false,
  submitLabel = "Submit",
  showProgress = true,
}: MobileFormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  const triggerHaptic = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: ImpactStyle.Light });
    }
  };

  const goToNext = async () => {
    if (currentStep.validate && !currentStep.validate()) {
      return;
    }
    await triggerHaptic();
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const goToPrevious = async () => {
    await triggerHaptic();
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = async (index: number) => {
    await triggerHaptic();
    setCurrentStepIndex(index);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header with Progress */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        {showProgress && (
          <div className="mb-3">
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        )}
        
        {/* Step Indicators */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-primary/20 text-primary",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                    {index + 1}
                  </span>
                )}
                {step.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <Card>
          <CardContent className="pt-6">
            {currentStep.content}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 border-t bg-background px-4 py-3 flex gap-3 safe-area-bottom">
        <Button
          type="button"
          variant="outline"
          onClick={goToPrevious}
          disabled={isFirstStep || isSubmitting}
          className="h-12 px-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <Button
          type="button"
          onClick={goToNext}
          disabled={isSubmitting}
          className="flex-1 h-12"
        >
          {isSubmitting ? (
            "Processing..."
          ) : isLastStep ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              {submitLabel}
            </>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Simple inline mobile form container for existing forms
interface MobileFormContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export function MobileFormContainer({
  children,
  title,
  subtitle,
  onBack,
  actions,
}: MobileFormContainerProps) {
  return (
    <div className="flex flex-col min-h-full pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4">
        {children}
      </div>

      {/* Sticky Bottom Actions */}
      {actions && (
        <div className="sticky bottom-0 border-t bg-background px-4 py-3 safe-area-bottom">
          {actions}
        </div>
      )}
    </div>
  );
}
