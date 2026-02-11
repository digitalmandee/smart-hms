import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStores } from "@/hooks/useStores";
import { Warehouse } from "lucide-react";

interface StoreSelectorProps {
  branchId?: string;
  value: string;
  onChange: (value: string) => void;
  showAll?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StoreSelector({
  branchId,
  value,
  onChange,
  showAll = false,
  placeholder = "Select warehouse",
  disabled = false,
  className,
}: StoreSelectorProps) {
  const { data: stores, isLoading } = useStores(branchId);

  return (
    <Select value={showAll ? (value || "all") : value} onValueChange={onChange} disabled={disabled || isLoading}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {showAll && <SelectItem value="all">All Warehouses</SelectItem>}
        {stores?.map((store) => (
          <SelectItem key={store.id} value={store.id}>
            {store.name}
            {store.is_central && " (Central)"}
          </SelectItem>
        ))}
        {!stores?.length && !isLoading && (
          <SelectItem value="none" disabled>
            No warehouses found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
