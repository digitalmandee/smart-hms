import { TrendingUp, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePOSDashboardStats } from "@/hooks/usePOS";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function POSTodaySummary() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading } = usePOSDashboardStats(profile?.branch_id);

  if (isLoading) {
    return (
      <div className="p-3 border-t bg-muted/30">
        <div className="h-10 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="p-3 border-t bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Today's Sales</p>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-primary">
                Rs. {(stats?.todaySales || 0).toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">
                • {stats?.todayTransactions || 0} sales
              </span>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-primary"
          onClick={() => navigate("/app/pharmacy/reports")}
        >
          View Report
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
