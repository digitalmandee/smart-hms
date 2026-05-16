import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, LayoutDashboard, Calendar, FlaskConical, Pill, FileText, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation, useIsRTL } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePatientDevice } from "@/hooks/usePatientDevice";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function PortalLayout() {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  const rtl = useIsRTL();
  const navigate = useNavigate();
  const [account, setAccount] = useState<{ patient_id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/portal/login", { replace: true });
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("patient_portal_accounts")
        .select("patient_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      setAccount(data ?? null);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, navigate]);

  // Register native device + push token for this portal patient
  usePatientDevice(account?.patient_id);
  usePushNotifications();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">{t("common.loading" as any)}</div>;
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <Heart className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">{t("portal.no_account_title" as any)}</h1>
          <p className="text-muted-foreground">{t("portal.no_account_body" as any)}</p>
          <Button onClick={() => signOut().then(() => navigate("/portal/login"))}>{t("portal.sign_out" as any)}</Button>
        </div>
      </div>
    );
  }

  const nav = [
    { to: "/portal/dashboard", icon: LayoutDashboard, label: t("portal.nav.dashboard" as any) },
    { to: "/portal/appointments", icon: Calendar, label: t("portal.nav.appointments" as any) },
    { to: "/portal/lab-results", icon: FlaskConical, label: t("portal.nav.lab_results" as any) },
    { to: "/portal/prescriptions", icon: Pill, label: t("portal.nav.prescriptions" as any) },
    { to: "/portal/invoices", icon: FileText, label: t("portal.nav.invoices" as any) },
    { to: "/portal/profile", icon: User, label: t("portal.nav.profile" as any) },
  ];

  return (
    <div className="min-h-screen bg-background" dir={rtl ? "rtl" : "ltr"}>
      <header className="border-b bg-card sticky top-0 z-30">
        <div className={`max-w-6xl mx-auto px-4 h-14 flex items-center gap-3 ${rtl ? "flex-row-reverse" : ""}`}>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(o => !o)}>
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/portal/dashboard" className={`flex items-center gap-2 font-semibold ${rtl ? "flex-row-reverse" : ""}`}>
            <Heart className="h-5 w-5 text-primary" />
            <span>{t("portal.title" as any)}</span>
          </Link>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={() => signOut().then(() => navigate("/portal/login"))}>
            <LogOut className="h-4 w-4 me-2" />
            {t("portal.sign_out" as any)}
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <nav className={`${open ? "block" : "hidden"} md:block space-y-1`}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  rtl ? "flex-row-reverse text-end" : ""
                } ${isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <main>
          <Outlet context={{ patientId: account.patient_id }} />
        </main>
      </div>
    </div>
  );
}
