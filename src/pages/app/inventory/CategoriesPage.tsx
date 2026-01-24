import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Folder, FolderOpen, Edit, Loader2, Pill } from "lucide-react";
import {
  useUnifiedCategories,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  UnifiedCategory,
} from "@/hooks/useInventory";
import { toast } from "sonner";

interface CategoryFormData {
  name: string;
  description: string;
  parent_id: string | null;
  source: "inventory" | "pharmacy";
}

export default function CategoriesPage() {
  const { data: categoryTree, isLoading } = useUnifiedCategories();
  const { data: allCategories } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UnifiedCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    parent_id: null,
    source: "inventory",
  });

  const openCreateDialog = (parentId?: string, source: "inventory" | "pharmacy" = "inventory") => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      parent_id: parentId || null,
      source,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (category: UnifiedCategory) => {
    // Don't allow editing virtual categories or pharmacy categories from here
    if (category.id === "medicines-virtual") {
      toast.info("This is a virtual grouping for pharmacy categories");
      return;
    }
    if (category.source === "pharmacy") {
      toast.info("Edit pharmacy categories from the Pharmacy module");
      return;
    }
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent_id: category.parent_id,
      source: category.source,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          name: formData.name,
          description: formData.description || null,
          parent_id: formData.parent_id,
        });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync({
          name: formData.name,
          description: formData.description || null,
          parent_id: formData.parent_id,
        });
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const renderCategoryTree = (categories: UnifiedCategory[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isPharmacy = category.source === "pharmacy";
      const isVirtual = category.id === "medicines-virtual";

      const CategoryIcon = isPharmacy ? Pill : (hasChildren ? FolderOpen : Folder);
      const iconColor = isPharmacy ? "text-emerald-600 dark:text-emerald-400" : (hasChildren ? "text-primary" : "text-muted-foreground");

      if (hasChildren) {
        return (
          <AccordionItem key={category.id} value={category.id}>
            <div className="flex items-center">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`h-4 w-4 ${iconColor}`} />
                  <span className="font-medium">{category.name}</span>
                  {isPharmacy && (
                    <Badge variant="outline" className="ml-1 text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400">
                      Pharmacy
                    </Badge>
                  )}
                  <Badge variant="secondary" className="ml-1">
                    {category.children?.length} {isVirtual ? "categories" : "subcategories"}
                  </Badge>
                </div>
              </AccordionTrigger>
              {!isVirtual && (
                <div className="flex gap-1 mr-4">
                  {!isPharmacy && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCreateDialog(category.id, category.source);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditDialog(category);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <AccordionContent>
              <div className="ml-6 border-l pl-4">
                {category.children && renderCategoryTree(category.children as UnifiedCategory[], level + 1)}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      }

      return (
        <div
          key={category.id}
          className="flex items-center justify-between py-3 px-4 border-b last:border-b-0"
        >
          <div className="flex items-center gap-2">
            <CategoryIcon className={`h-4 w-4 ${iconColor}`} />
            <span>{category.name}</span>
            {isPharmacy && (
              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400">
                Pharmacy
              </Badge>
            )}
          </div>
          <div className="flex gap-1">
            {!isPharmacy && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => openCreateDialog(category.id, category.source)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEditDialog(category)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Categories"
        description="Organize items into categories and subcategories"
      />

      <div className="flex justify-end">
        <Button onClick={() => openCreateDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Category Hierarchy
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categoryTree && categoryTree.length > 0 ? (
            <Accordion type="multiple" className="w-full">
              {renderCategoryTree(categoryTree)}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories yet</p>
              <Button className="mt-4" onClick={() => openCreateDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Category
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Medical Supplies"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Parent Category</Label>
              <Select
                value={formData.parent_id || "none"}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    parent_id: v === "none" ? null : v,
                  }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select parent (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Parent (Root Category)</SelectItem>
                  {allCategories
                    ?.filter((c) => c.id !== editingCategory?.id)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Optional description..."
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createCategory.isPending || updateCategory.isPending}
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
