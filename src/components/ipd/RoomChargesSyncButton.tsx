import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, CheckCircle } from "lucide-react";
import { useBackfillRoomCharges } from "@/hooks/useRoomChargeSync";

interface RoomChargesSyncButtonProps {
  admissionId: string;
  admissionDate: string;
  bedType: string | null;
  bedNumber: string | null;
  wardChargePerDay?: number;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RoomChargesSyncButton({
  admissionId,
  admissionDate,
  bedType,
  bedNumber,
  wardChargePerDay,
  variant = "outline",
  size = "sm",
  className,
}: RoomChargesSyncButtonProps) {
  const { mutate: backfillCharges, isPending } = useBackfillRoomCharges();

  const handleSync = () => {
    backfillCharges({
      admissionId,
      admissionDate,
      bedType,
      bedNumber,
      wardChargePerDay,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleSync}
      disabled={isPending}
      className={className}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4 mr-2" />
      )}
      Sync Room Charges
    </Button>
  );
}

interface PostTodayChargesButtonProps {
  onPost: () => Promise<unknown>;
  isPosting: boolean;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PostTodayChargesButton({
  onPost,
  isPosting,
  variant = "outline",
  size = "default",
  className,
}: PostTodayChargesButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onPost}
      disabled={isPosting}
      className={className}
    >
      {isPosting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <CheckCircle className="h-4 w-4 mr-2" />
      )}
      Post Today's Room Charges
    </Button>
  );
}
