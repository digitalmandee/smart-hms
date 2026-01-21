import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useMedicineCategories } from "@/hooks/usePharmacy";
import { cn } from "@/lib/utils";

interface POSCategoryFilterProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function POSCategoryFilter({
  selectedCategory,
  onCategoryChange,
}: POSCategoryFilterProps) {
  const { data: categories, isLoading } = useMedicineCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 px-1 py-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-8 w-20 rounded-full bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  const activeCategories = categories?.filter((c) => c.is_active) || [];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 px-1 py-2">
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full h-8 px-4 text-xs font-medium",
            selectedCategory === null && "bg-primary text-primary-foreground"
          )}
          onClick={() => onCategoryChange(null)}
        >
          All
        </Button>
        {activeCategories.slice(0, 6).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            className={cn(
              "rounded-full h-8 px-4 text-xs font-medium shrink-0",
              selectedCategory === category.id && "bg-primary text-primary-foreground"
            )}
            onClick={() =>
              onCategoryChange(selectedCategory === category.id ? null : category.id)
            }
          >
            {category.name}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
