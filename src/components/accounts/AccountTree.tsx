import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, FolderTree, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import type { Account } from "@/hooks/useAccounts";
import { formatCurrencyFull as formatBalance } from "@/lib/currency";

interface AccountTreeProps {
  accounts: Account[];
  onSelect?: (account: Account) => void;
  onEdit?: (account: Account) => void;
  onToggleStatus?: (account: Account) => void;
  selectedId?: string;
  showActions?: boolean;
}

interface AccountNodeProps {
  account: Account;
  level: number;
  onSelect?: (account: Account) => void;
  onEdit?: (account: Account) => void;
  onToggleStatus?: (account: Account) => void;
  selectedId?: string;
  showActions?: boolean;
}

const categoryColors: Record<string, string> = {
  asset: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  liability: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  equity: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  revenue: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expense: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
};

const l1CategoryBg: Record<string, string> = {
  asset: "bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500",
  liability: "bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500",
  equity: "bg-purple-50 dark:bg-purple-950/30 border-l-4 border-purple-500",
  revenue: "bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500",
  expense: "bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500",
};

/** Recursively sum current_balance of all leaf (non-header) descendants */
function getAggregateBalance(account: Account): number {
  if (!account.is_header) return account.current_balance;
  if (!account.children?.length) return 0;
  return account.children.reduce((sum, child) => sum + getAggregateBalance(child), 0);
}

function AccountNode({
  account,
  level,
  onSelect,
  onEdit,
  onToggleStatus,
  selectedId,
  showActions,
}: AccountNodeProps) {
  const [isExpanded, setIsExpanded] = useState(account.account_level <= 2);
  const hasChildren = account.children && account.children.length > 0;
  const isSelected = selectedId === account.id;
  const isL1 = account.account_level === 1;
  const isHeader = account.is_header;

  const aggregateBalance = useMemo(() => getAggregateBalance(account), [account]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const AccountIcon = isL1 ? FolderTree : hasChildren ? Folder : FileText;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group",
          isSelected && "bg-primary/10 border-l-2 border-primary",
          isL1 && l1CategoryBg[account.account_type?.category || ""],
          isHeader && !isL1 && "bg-muted/30"
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect?.(account)}
      >
        {/* Expand/Collapse */}
        <button
          onClick={handleToggle}
          className={cn(
            "p-0.5 rounded hover:bg-muted",
            !hasChildren && "invisible"
          )}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Icon */}
        <AccountIcon className={cn("h-4 w-4", isHeader ? "text-primary" : "text-muted-foreground")} />

        {/* Account Number */}
        {!isL1 && (
          <span className="font-mono text-sm text-muted-foreground min-w-[80px]">
            {account.account_number}
          </span>
        )}

        {/* Account Name */}
        <span className={cn(
          "flex-1 text-sm",
          isHeader && "font-semibold",
          isL1 && "text-base font-bold",
          !account.is_active && "text-muted-foreground line-through"
        )}>
          {account.name}
        </span>

        {/* Level Badge */}
        {isHeader && (
          <Badge variant="secondary" className="text-xs">
            L{account.account_level}
          </Badge>
        )}

        {/* Category Badge */}
        {account.account_type && !isL1 && (
          <Badge variant="outline" className={cn("text-xs", categoryColors[account.account_type.category])}>
            {account.account_type.category}
          </Badge>
        )}

        {/* Balance */}
        <span className={cn("font-mono text-sm min-w-[100px] text-right", isHeader && "font-semibold")}>
          {formatBalance(isHeader ? aggregateBalance : account.current_balance)}
        </span>

        {/* Actions */}
        {showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(account)}>
                Edit Account
              </DropdownMenuItem>
              {!account.is_system && (
                <DropdownMenuItem onClick={() => onToggleStatus?.(account)}>
                  {account.is_active ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {account.children!.map((child) => (
            <AccountNode
              key={child.id}
              account={child}
              level={level + 1}
              onSelect={onSelect}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              selectedId={selectedId}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountTree({
  accounts,
  onSelect,
  onEdit,
  onToggleStatus,
  selectedId,
  showActions = true,
}: AccountTreeProps) {
  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No accounts found. Create your first account to get started.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {accounts.map((account) => (
        <AccountNode
          key={account.id}
          account={account}
          level={0}
          onSelect={onSelect}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          selectedId={selectedId}
          showActions={showActions}
        />
      ))}
    </div>
  );
}
