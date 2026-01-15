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
import { Plus, Folder, FolderOpen, Edit, Trash2, Loader2 } from "lucide-react";
import {
  useInventoryCategories,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  InventoryCategory,
} from "@/hooks/useInventory";
import { toast } from "sonner";

interface CategoryFormData {
  category_name: string;
  category_code: string;
  parent_id: string | null;
  description: string;
}

export default function CategoriesPage() {
  const { data: categoryTree, isLoading } = useInventoryCategories();
  const { data: allCategories } = useAllCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<InventoryCategory | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    category_name: "",
    category_code: "",
    parent_id: null,
    description: "",
  });

  const openCreateDialog = (parentId?: string) => {
    setEditingCategory(null);
    setFormData({
      category_name: "",
      category_code: "",
      parent_id: parentId || null,
      description: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (category: InventoryCategory) => {
    setEditingCategory(category);
    setFormData({
      category_name: category.category_name,
      category_code: category.category_code,
      parent_id: category.parent_id,
      description: category.description || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.category_name || !formData.category_code) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          category_name: formData.category_name,
          category_code: formData.category_code,
          parent_id: formData.parent_id,
          description: formData.description || null,
        });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync({
          category_name: formData.category_name,
          category_code: formData.category_code,
          parent_id: formData.parent_id,
          description: formData.description || null,
        });
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch {
      // Error handled by mutation
    }
  };

  const renderCategoryTree = (categories: InventoryCategory[], level = 0) => {
    return categories.map((category) => {
      const hasChildren = category.children && category.children.length > 0;

      if (hasChildren) {
        return (
          <AccordionItem key={category.id} value={category.id}>
            <div className="flex items-center">
              <AccordionTrigger className="flex-1 hover:no-underline">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">{category.category_name}</span>
                  <Badge variant="outline" className="ml-2">
                    {category.category_code}
                  </Badge>
                  <Badge variant="secondary" className="ml-1">
                    {category.children?.length} subcategories
                  </Badge>
                </div>
              </AccordionTrigger>
              <div className="flex gap-1 mr-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateDialog(category.id);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
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
            </div>
            <AccordionContent>
              <div className="ml-6 border-l pl-4">
                {category.children && renderCategoryTree(category.children, level + 1)}
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
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span>{category.category_name}</span>
            <Badge variant="outline">{category.category_code}</Badge>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openCreateDialog(category.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
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
                value={formData.category_name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category_name: e.target.value }))
                }
                placeholder="e.g., Medical Supplies"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Category Code *</Label>
              <Input
                value={formData.category_code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_code: e.target.value.toUpperCase(),
                  }))
                }
                placeholder="e.g., MED-SUP"
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
                        {cat.category_name}
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
