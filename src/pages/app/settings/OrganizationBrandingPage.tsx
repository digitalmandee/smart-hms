import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Palette, Image, Save, Loader2 } from "lucide-react";

export default function OrganizationBrandingPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#0ea5e9");
  const [secondaryColor, setSecondaryColor] = useState("#64748b");

  // Fetch organization settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ["organization-branding", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data, error } = await supabase
        .from("organization_settings")
        .select("setting_key, setting_value")
        .eq("organization_id", profile.organization_id)
        .in("setting_key", ["logo_url", "primary_color", "secondary_color"]);
      if (error) throw error;

      const settingsMap = Object.fromEntries(
        data.map((s) => [s.setting_key, s.setting_value])
      );
      setLogoUrl(settingsMap.logo_url || "");
      setPrimaryColor(settingsMap.primary_color || "#0ea5e9");
      setSecondaryColor(settingsMap.secondary_color || "#64748b");
      return settingsMap;
    },
    enabled: !!profile?.organization_id,
  });

  const updateMutation = useMutation({
    mutationFn: async (values: { logo_url: string; primary_color: string; secondary_color: string }) => {
      if (!profile?.organization_id) throw new Error("Organization not found");
      
      const settingsToSave = [
        { key: "logo_url", value: values.logo_url },
        { key: "primary_color", value: values.primary_color },
        { key: "secondary_color", value: values.secondary_color },
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from("organization_settings")
          .upsert({ organization_id: profile.organization_id, setting_key: setting.key, setting_value: setting.value }, { onConflict: "organization_id,setting_key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organization-branding"] });
      toast({ title: "Branding Updated", description: "Organization branding has been saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update branding.", variant: "destructive" });
    },
  });

  const handleSave = () => updateMutation.mutate({ logo_url: logoUrl, primary_color: primaryColor, secondary_color: secondaryColor });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold">Organization Branding</h1>
          <p className="text-muted-foreground">Customize your organization's visual identity</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image className="h-5 w-5" />Logo</CardTitle>
            <CardDescription>Your organization's logo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input id="logo-url" placeholder="https://example.com/logo.png" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </div>
            {logoUrl && <div className="border rounded-lg p-4 bg-muted/50"><p className="text-sm text-muted-foreground mb-2">Preview:</p><img src={logoUrl} alt="Logo" className="max-h-16 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} /></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" />Brand Colors</CardTitle>
            <CardDescription>Define your color scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="flex gap-2"><Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" /><Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1" /></div>
            </div>
            <div className="space-y-2">
              <Label>Secondary Color</Label>
              <div className="flex gap-2"><Input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" /><Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}Save Changes
        </Button>
      </div>
    </div>
  );
}
