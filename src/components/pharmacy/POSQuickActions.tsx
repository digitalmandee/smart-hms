import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Receipt,
  RotateCcw,
  Keyboard,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePOSDashboardStats } from "@/hooks/usePOS";
import { useAuth } from "@/contexts/AuthContext";

interface POSQuickActionsProps {
  onShowLastSale?: () => void;
}

export function POSQuickActions({ onShowLastSale }: POSQuickActionsProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats } = usePOSDashboardStats(profile?.branch_id);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const shortcuts = [
    { key: "F2", action: "Focus search" },
    { key: "F4", action: "Hold transaction" },
    { key: "F8", action: "Apply discount" },
    { key: "F12", action: "Checkout" },
    { key: "Esc", action: "Clear / Close" },
  ];

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30 overflow-x-auto">
      {/* Last Sale */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs shrink-0"
        onClick={onShowLastSale}
      >
        <Receipt className="h-3.5 w-3.5 mr-1.5" />
        <span className="hidden sm:inline">Last Sale</span>
      </Button>

      {/* Returns */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 text-xs shrink-0"
        onClick={() => navigate("/app/pharmacy/returns")}
      >
        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
        <span className="hidden sm:inline">Returns</span>
      </Button>

      {/* Today's Stats */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            <span className="font-medium text-primary">
              Rs. {((stats?.todaySales || 0) / 1000).toFixed(1)}K
            </span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <div className="p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Today's Summary</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span>Sales</span>
                <span className="font-semibold">Rs. {(stats?.todaySales || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Transactions</span>
                <span className="font-semibold">{stats?.todayTransactions || 0}</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2 text-xs"
              onClick={() => navigate("/app/pharmacy/reports")}
            >
              View Full Report
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Keyboard Shortcuts */}
      <Dialog open={showShortcuts} onOpenChange={setShowShortcuts}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 text-xs shrink-0">
            <Keyboard className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to speed up your workflow
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {shortcuts.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm">{shortcut.action}</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background border rounded">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
