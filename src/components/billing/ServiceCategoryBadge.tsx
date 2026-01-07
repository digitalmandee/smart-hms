import { Badge } from "@/components/ui/badge";
import { Database } from "@/integrations/supabase/types";
import { Stethoscope, Syringe, FlaskConical, Pill, Building, MoreHorizontal } from "lucide-react";

type ServiceCategory = Database["public"]["Enums"]["service_category"];

interface ServiceCategoryBadgeProps {
  category: ServiceCategory | null;
}

const categoryConfig: Record<ServiceCategory, { label: string; variant: "default" | "secondary" | "outline"; icon: React.ReactNode; className: string }> = {
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
  pharmacy: {
    label: "Pharmacy",
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
  other: {
    label: "Other",
    variant: "outline",
    icon: <MoreHorizontal className="h-3 w-3" />,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200",
  },
};

export function ServiceCategoryBadge({ category }: ServiceCategoryBadgeProps) {
  const config = categoryConfig[category || "other"];

  return (
    <Badge variant={config.variant} className={`gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}
