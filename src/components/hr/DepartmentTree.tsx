import { useState } from "react";
import { ChevronDown, ChevronRight, Building2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
  code: string;
  parent_department_id?: string | null;
  head_employee_id?: string | null;
  is_active?: boolean | null;
  head?: {
    id: string;
    first_name: string;
    last_name?: string | null;
  } | null;
}

interface DepartmentTreeProps {
  departments: Department[];
  selectedId?: string;
  onSelect?: (department: Department) => void;
  onEdit?: (department: Department) => void;
}

interface TreeNodeProps {
  department: Department;
  children: Department[];
  allDepartments: Department[];
  level: number;
  selectedId?: string;
  onSelect?: (department: Department) => void;
  onEdit?: (department: Department) => void;
}

function TreeNode({
  department,
  children,
  allDepartments,
  level,
  selectedId,
  onSelect,
  onEdit,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors",
          selectedId === department.id && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect?.(department)}
      >
        {hasChildren ? (
          <button
            className="p-0.5 hover:bg-accent rounded"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />

        <div className="flex-1 min-w-0">
          <span
            className={cn(
              "text-sm font-medium truncate",
              !department.is_active && "text-muted-foreground line-through"
            )}
          >
            {department.name}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            ({department.code})
          </span>
        </div>

        {department.head && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span className="truncate max-w-[100px]">
              {department.head.first_name} {department.head.last_name}
            </span>
          </div>
        )}

        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(department);
            }}
          >
            Edit
          </Button>
        )}
      </div>

      {isOpen && hasChildren && (
        <div>
          {children.map((child) => (
            <TreeNode
              key={child.id}
              department={child}
              children={allDepartments.filter(
                (d) => d.parent_department_id === child.id
              )}
              allDepartments={allDepartments}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function DepartmentTree({
  departments,
  selectedId,
  onSelect,
  onEdit,
}: DepartmentTreeProps) {
  const rootDepartments = departments.filter((d) => !d.parent_department_id);

  if (departments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No departments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rootDepartments.map((department) => (
        <TreeNode
          key={department.id}
          department={department}
          children={departments.filter(
            (d) => d.parent_department_id === department.id
          )}
          allDepartments={departments}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
