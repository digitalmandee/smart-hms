import { useState } from "react";
import { ModernPageHeader } from "@/components/ModernPageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw, Search, Receipt, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ModernStatsCard } from "@/components/ModernStatsCard";

export default function PharmacyReturnsPage() {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const firstName = profile?.full_name?.split(" ")[0] || "User";

  // Placeholder data - would be fetched from database
  const recentReturns = [
    { id: "1", receiptNo: "POS-2024-0045", date: "2024-01-21", items: 2, amount: 450, status: "completed" },
    { id: "2", receiptNo: "POS-2024-0039", date: "2024-01-20", items: 1, amount: 120, status: "pending" },
    { id: "3", receiptNo: "POS-2024-0032", date: "2024-01-19", items: 3, amount: 890, status: "completed" },
  ];

  return (
    <div className="space-y-6">
      <ModernPageHeader
        title="Returns & Refunds"
        userName={firstName}
        showGreeting
        icon={RotateCcw}
        iconColor="warning"
        quickStats={[
          { label: "Today's Returns", value: 3 },
          { label: "Pending", value: 1, variant: "warning" },
          { label: "This Week", value: 12 },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <ModernStatsCard
          title="Today's Returns"
          value={3}
          icon={RotateCcw}
          variant="warning"
          description="Processed today"
        />
        <ModernStatsCard
          title="Pending Approval"
          value={1}
          icon={AlertCircle}
          variant="destructive"
          description="Awaiting review"
        />
        <ModernStatsCard
          title="Total Refunded"
          value="₹1,460"
          icon={Receipt}
          variant="info"
          description="This week"
        />
        <ModernStatsCard
          title="Items Returned"
          value={6}
          icon={Package}
          variant="default"
          description="Back to stock"
        />
      </div>

      {/* Search for Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            Find Transaction
          </CardTitle>
          <CardDescription>
            Search by receipt number, patient name, or phone number to process a return
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter Receipt #, Patient Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Returns */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Returns</CardTitle>
          <CardDescription>Latest return transactions processed</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Refund Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReturns.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-medium">{item.receiptNo}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.items} items</TableCell>
                  <TableCell className="font-semibold">₹{item.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={item.status === "completed" ? "default" : "secondary"}
                      className={item.status === "completed" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
                    >
                      {item.status === "completed" ? (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      ) : null}
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
