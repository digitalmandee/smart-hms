import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { Stethoscope, Syringe, FlaskConical, Pill, Building, MoreHorizontal, Scissors, Scan } from "lucide-react";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

// Extended type to include OT which may be added in future or used programmatically
type ExtendedCategory = ServiceCategory | "ot" | "medication";

interface ServiceCategoryBadgeProps {
  category: ExtendedCategory | null;
}

const categoryConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ReactNode; className: string }> = {
  consultation: {
    label: "Consultation",
    variant: "default",
    icon: <Stethoscope className="h-3 w-3" />,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
  },
  procedure: {
    label: "Procedure",
    variant: "secondary",
    icon: <Syringe className="h-3 w-3" />,
    className: "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200",
  },
  lab: {
    label: "Lab",
    variant: "secondary",
    icon: <FlaskConical className="h-3 w-3" />,
    className: "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200",
  },
  radiology: {
    label: "Radiology",
    variant: "secondary",
    icon: <Scan className="h-3 w-3" />,
    className: "bg-pink-100 text-pink-800 hover:bg-pink-100 border-pink-200",
  },
  pharmacy: {
    label: "Pharmacy",
    variant: "secondary",
    icon: <Pill className="h-3 w-3" />,
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  },
  medication: {
    label: "Medication",
    variant: "secondary",
    icon: <Pill className="h-3 w-3" />,
    className: "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
  },
  room: {
    label: "Room",
    variant: "secondary",
    icon: <Building className="h-3 w-3" />,
    className: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100 border-cyan-200",
  },
  ot: {
    label: "Surgery",
    variant: "secondary",
    icon: <Scissors className="h-3 w-3" />,
    className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100 border-indigo-200",
  },
  other: {
    label: "Other",
    variant: "outline",
    icon: <MoreHorizontal className="h-3 w-3" />,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
  },
};

export function ServiceCategoryBadge({ category }: ServiceCategoryBadgeProps) {
  const config = categoryConfig[category || "other"] || categoryConfig.other;

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
