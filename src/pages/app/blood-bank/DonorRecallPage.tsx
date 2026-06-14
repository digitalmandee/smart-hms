import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Droplet,
  PhoneCall,
  MessageCircle,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDonorRecallCandidates } from "@/hooks/useDonorRecall";
import { format } from "date-fns";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorRecallPage() {
  const navigate = useNavigate();
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [bloodGroup, setBloodGroup] = useState<string>("__all__");

  const { data: rows = [], isLoading } = useDonorRecallCandidates({
    lowStockOnly,
    bloodGroup: bloodGroup === "__all__" ? undefined : bloodGroup,
  });

  const groupCounts = useMemo(() => {
    const m = new Map<string, { eligible: number; available: number; low: boolean }>();
    for (const r of rows) {
      const cur = m.get(r.blood_group) || {
        eligible: 0,
        available: r.available_units ?? 0,
        low: !!r.low_stock,
      };
      cur.eligible += 1;
      cur.available = r.available_units ?? cur.available;
      cur.low = !!r.low_stock;
      m.set(r.blood_group, cur);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="container mx-auto space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold">
              <Droplet className="h-6 w-6 text-destructive" />
              Donor Recall List
            </h1>
            <p className="text-sm text-muted-foreground">
              Eligible repeat donors (≥56 days since last donation), prioritised by current
              stock of their blood group.
            </p>
          </div>
        </div>
      </div>

      {/* Stock summary by group */}
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-8">
        {BLOOD_GROUPS.map((g) => {
          const meta = groupCounts.find(([k]) => k === g)?.[1];
          return (
            <Card key={g} className={meta?.low ? "border-destructive/60" : ""}>
              <CardContent className="p-3 text-center">
                <div className="text-xs text-muted-foreground">{g}</div>
                <div className="text-lg font-semibold">{meta?.available ?? 0} units</div>
                <div className="text-xs text-muted-foreground">
                  {meta?.eligible ?? 0} donors eligible
                </div>
                {meta?.low && (
                  <Badge variant="destructive" className="mt-1 text-[10px]">
                    LOW
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-end justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Eligible donors</CardTitle>
          <div className="flex items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Blood group</Label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All</SelectItem>
                  {BLOOD_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <Switch
                id="lowstock"
                checked={lowStockOnly}
                onCheckedChange={setLowStockOnly}
              />
              <Label htmlFor="lowstock" className="text-sm">
                Low-stock groups only
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Group</TableHead>
                <TableHead>Last donation</TableHead>
                <TableHead>Eligible since</TableHead>
                <TableHead>Total donations</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-end">Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    Loading…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                    No eligible donors matching the filter.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.donor_id}>
                  <TableCell>
                    <div className="font-medium">
                      {r.first_name} {r.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {r.donor_number}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.blood_group}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.last_donation_date
                      ? format(new Date(r.last_donation_date), "dd MMM yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {r.eligible_from
                      ? `${format(new Date(r.eligible_from), "dd MMM yyyy")} (${r.days_since_eligible}d)`
                      : "Never donated"}
                  </TableCell>
                  <TableCell>{r.total_donations ?? 0}</TableCell>
                  <TableCell>
                    {r.low_stock ? (
                      <Badge variant="destructive" className="flex w-fit items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {r.available_units ?? 0} units
                      </Badge>
                    ) : (
                      <span className="text-sm">{r.available_units ?? 0} units</span>
                    )}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      {r.phone && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            title="Call"
                          >
                            <a href={`tel:${r.phone}`}>
                              <PhoneCall className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            asChild
                            title="WhatsApp"
                          >
                            <a
                              href={`https://wa.me/${r.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                                `Dear ${r.first_name}, you are eligible to donate blood again. Would you be available this week? Thank you.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                      {r.email && (
                        <Button size="icon" variant="ghost" asChild title="Email">
                          <a href={`mailto:${r.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
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
