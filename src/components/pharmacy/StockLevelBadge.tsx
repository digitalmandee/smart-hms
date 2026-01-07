import { Badge } from "@/components/ui/badge";

interface StockLevelBadgeProps {
  quantity: number;
  reorderLevel?: number;
}

export function StockLevelBadge({ quantity, reorderLevel = 10 }: StockLevelBadgeProps) {
  if (quantity <= 0) {
    return <Badge variant="destructive">Out of Stock</Badge>;
  }
  
  if (quantity <= reorderLevel) {
    return <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">Low Stock</Badge>;
  }
  
  return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">In Stock</Badge>;
}
