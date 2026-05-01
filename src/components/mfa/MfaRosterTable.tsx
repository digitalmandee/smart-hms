import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, MoreHorizontal, ShieldCheck, ShieldAlert, ShieldOff, KeyRound } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "sonner";
import { useMfaRoster, useSetMfaRequired, useGenerateRecoveryCodes, type MfaRosterEntry } from "@/hooks/useMfaAdmin";
import { RecoveryCodesDialog } from "./RecoveryCodesDialog";

function statusOf(e: MfaRosterEntry): { key: "not_required" | "required" | "enrolled" | "grace"; tone: "secondary" | "destructive" | "default" | "outline" } {
  if (e.enrolled_at) return { key: "enrolled", tone: "default" };
  if (!e.is_required) return { key: "not_required", tone: "secondary" };
  if (e.grace_period_ends_at && new Date(e.grace_period_ends_at) > new Date()) {
    return { key: "grace", tone: "outline" };
  }
  return { key: "required", tone: "destructive" };
}

const StatusIcon = ({ k }: { k: string }) => {
  if (k === "enrolled") return <ShieldCheck className="h-3.5 w-3.5" />;
  if (k === "required") return <ShieldAlert className="h-3.5 w-3.5" />;
  if (k === "grace") return <ShieldAlert className="h-3.5 w-3.5" />;
  return <ShieldOff className="h-3.5 w-3.5" />;
};

export function MfaRosterTable() {
  const { t } = useTranslation();
  const { data, isLoading } = useMfaRoster();
  const setRequired = useSetMfaRequired();
  const generateCodes = useGenerateRecoveryCodes();
  const [search, setSearch] = useState("");
  const [generatedCodes, setGeneratedCodes] = useState<{ codes: string[]; label: string } | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(e =>
      e.full_name.toLowerCase().includes(q) ||
      (e.email ?? "").toLowerCase().includes(q),
    );
  }, [data, search]);

  const handleRequire = async (userId: string, required: boolean, graceDays = 0) => {
    try {
      await setRequired.mutateAsync({ target_user_id: userId, is_required: required, grace_period_days: graceDays });
      toast.success(t("security.mfa_admin.required_success") as string);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleGenerate = async (userId: string, label: string) => {
    try {
      const res = await generateCodes.mutateAsync({ target_user_id: userId });
      setGeneratedCodes({ codes: res.codes, label });
      toast.success(t("security.mfa_admin.codes_success") as string);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="h-4 w-4 text-primary" />
          {t("security.mfa_admin.title")}
        </CardTitle>
        <CardDescription>{t("security.mfa_admin.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder={t("security.mfa_admin.search") as string}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("security.mfa_admin.col_user")}</TableHead>
                  <TableHead>{t("security.mfa_admin.col_status")}</TableHead>
                  <TableHead>{t("security.mfa_admin.col_last_verified")}</TableHead>
                  <TableHead>{t("security.mfa_admin.col_recovery")}</TableHead>
                  <TableHead className="text-right">{t("security.mfa_admin.col_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {t("security.mfa_admin.no_users")}
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((e) => {
                  const s = statusOf(e);
                  const statusLabel = t(`security.mfa_admin.status_${s.key}` as any);
                  return (
                    <TableRow key={e.user_id}>
                      <TableCell>
                        <div className="font-medium">{e.full_name}</div>
                        <div className="text-xs text-muted-foreground">{e.email}</div>
                        {e.roles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {e.roles.slice(0, 3).map(r => (
                              <Badge key={r} variant="outline" className="text-[10px] py-0">{r}</Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.tone} className="gap-1">
                          <StatusIcon k={s.key} /> {statusLabel}
                        </Badge>
                        {s.key === "grace" && e.grace_period_ends_at && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            until {new Date(e.grace_period_ends_at).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.last_verified_at
                          ? new Date(e.last_verified_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {e.recovery_codes_total > 0
                          ? `${e.recovery_codes_used}/${e.recovery_codes_total} used`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!e.is_required ? (
                              <>
                                <DropdownMenuItem onClick={() => handleRequire(e.user_id, true, 0)}>
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  {t("security.mfa_admin.action_require")} (now)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRequire(e.user_id, true, 7)}>
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  {t("security.mfa_admin.action_require")} (7d)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRequire(e.user_id, true, 30)}>
                                  <ShieldAlert className="h-4 w-4 mr-2" />
                                  {t("security.mfa_admin.action_require")} (30d)
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem onClick={() => handleRequire(e.user_id, false)}>
                                <ShieldOff className="h-4 w-4 mr-2" />
                                {t("security.mfa_admin.action_unrequire")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleGenerate(e.user_id, e.full_name)}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              {t("security.mfa_admin.action_generate_codes")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <RecoveryCodesDialog
        open={!!generatedCodes}
        onOpenChange={(o) => !o && setGeneratedCodes(null)}
        codes={generatedCodes?.codes ?? []}
        userLabel={generatedCodes?.label}
      />
    </Card>
  );
}
