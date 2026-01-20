import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Palette, Image, Edit, Check, X } from "lucide-react";

export default function BranchBrandingPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Fetch all branches with their branding status
  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches-branding", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from("branches")
        .select("id, name, code, logo_url, brand_color, is_active")
        .eq("organization_id", profile.organization_id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const hasBranding = (branch: { logo_url?: string | null; brand_color?: string | null }) => {
    return !!(branch.logo_url || branch.brand_color);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Branch Branding</h1>
          <p className="text-muted-foreground">
            Customize branding for each branch
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Branch Branding Overview
          </CardTitle>
          <CardDescription>
            Each branch can have its own logo and brand colors that appear on receipts and reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : branches && branches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Logo</TableHead>
                  <TableHead>Brand Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{branch.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {branch.logo_url ? (
                        <div className="flex items-center gap-2">
                          <Image className="h-4 w-4 text-green-600" />
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {branch.brand_color ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: branch.brand_color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {branch.brand_color}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Default</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {hasBranding(branch) ? (
                        <Badge variant="default">Customized</Badge>
                      ) : (
                        <Badge variant="secondary">Using Default</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/app/settings/branches/${branch.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No branches found. Create branches first to customize their branding.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
