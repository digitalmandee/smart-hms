import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStoreRacks } from "@/hooks/useStoreRacks";
import { LayoutGrid } from "lucide-react";

interface RackSelectorProps {
  storeId?: string;
  value: string;
  onChange: (value: string) => void;
  showAll?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RackSelector({
  storeId,
  value,
  onChange,
  showAll = false,
  placeholder = "Select rack",
  disabled = false,
  className,
}: RackSelectorProps) {
  const { data: racks, isLoading } = useStoreRacks(storeId);

  return (
    <Select value={showAll ? (value || "all") : (value || undefined)} onValueChange={onChange} disabled={disabled || isLoading || !storeId}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">All Racks</SelectItem>}
        {racks?.map((rack) => (
          <SelectItem key={rack.id} value={rack.id}>
            {rack.rack_code}{rack.rack_name ? ` - ${rack.rack_name}` : ""}
          </SelectItem>
        ))}
        {!racks?.length && !isLoading && (
          <SelectItem value="none" disabled>
            No racks found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
