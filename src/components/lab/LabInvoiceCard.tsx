import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCountryConfig } from "@/contexts/CountryConfigContext";
import { useCurrencyFormatter } from "@/hooks/useCurrencyFormatter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Receipt, CreditCard, Send, MessageCircle, Mail, Smartphone, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

type Lang = "en" | "ar" | "ur";
const D: Record<Lang, Record<string, string>> = {
  en: { title: "Lab Invoice", none: "No invoice is linked to this order yet.", create: "Create invoice", total: "Total", paid: "Paid", balance: "Balance due", collect: "Collect payment", send: "Send invoice to patient", view: "Open invoice", s_paid: "Paid", s_partial: "Partially paid", s_pending: "Payment pending", s_cancelled: "Cancelled", live: "Updates automatically", phone: "Patient phone", email: "Patient email", wa: "WhatsApp", sms: "SMS", mail: "Email", tests: "Tests", sent: "Invoice sent", msgHello: "Dear", msgBody: "your lab invoice", msgTotal: "Total", msgPaid: "Paid", msgBal: "Balance", msgThanks: "Thank you." },
  ar: { title: "فاتورة المختبر", none: "لا توجد فاتورة مرتبطة بهذا الطلب بعد.", create: "إنشاء فاتورة", total: "الإجمالي", paid: "المدفوع", balance: "المتبقي", collect: "تحصيل الدفع", send: "إرسال الفاتورة للمريض", view: "فتح الفاتورة", s_paid: "مدفوعة", s_partial: "مدفوعة جزئياً", s_pending: "بانتظار الدفع", s_cancelled: "ملغاة", live: "تتحدث تلقائياً", phone: "هاتف المريض", email: "بريد المريض", wa: "واتساب", sms: "رسالة نصية", mail: "بريد إلكتروني", tests: "الفحوصات", sent: "تم إرسال الفاتورة", msgHello: "عزيزي", msgBody: "فاتورة المختبر الخاصة بك", msgTotal: "الإجمالي", msgPaid: "المدفوع", msgBal: "المتبقي", msgThanks: "شكراً لكم." },
  ur: { title: "لیب انوائس", none: "اس آرڈر کے ساتھ ابھی کوئی انوائس منسلک نہیں۔", create: "انوائس بنائیں", total: "کل رقم", paid: "ادا شدہ", balance: "باقی رقم", collect: "ادائیگی وصول کریں", send: "انوائس مریض کو بھیجیں", view: "انوائس کھولیں", s_paid: "ادا شدہ", s_partial: "جزوی ادا شدہ", s_pending: "ادائیگی باقی", s_cancelled: "منسوخ", live: "خودکار طور پر اپ ڈیٹ", phone: "مریض کا فون", email: "مریض کی ای میل", wa: "واٹس ایپ", sms: "ایس ایم ایس", mail: "ای میل", tests: "ٹیسٹ", sent: "انوائس بھیج دی گئی", msgHello: "محترم", msgBody: "آپ کی لیب انوائس", msgTotal: "کل", msgPaid: "ادا شدہ", msgBal: "باقی", msgThanks: "شکریہ۔" },
};

interface Props {
  labOrderId: string;
  invoiceId?: string | null;
  patient?: { first_name?: string | null; last_name?: string | null; phone?: string | null; email?: string | null } | null;
  orderNumber: string;
}

export function LabInvoiceCard({ labOrderId, invoiceId, patient, orderNumber }: Props) {
  const { default_language } = useCountryConfig();
  const lang = (["ar", "ur"].includes(default_language) ? default_language : "en") as Lang;
  const t = D[lang];
  const isRtl = lang !== "en";
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { formatCurrency } = useCurrencyFormatter();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [phone, setPhone] = useState(patient?.phone || "");
  const [email, setEmail] = useState(patient?.email || "");

  const { data: invoice, refetch } = useQuery({
    queryKey: ["lab-invoice", invoiceId],
    enabled: !!invoiceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, total_amount, paid_amount, status, created_at, invoice_items(id, description, quantity, unit_price, total_price)")
        .eq("id", invoiceId!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
  });

  useEffect(() => {
    if (!invoiceId) return;
    const ch = supabase
      .channel(`lab-invoice-${invoiceId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "invoices", filter: `id=eq.${invoiceId}` }, () => {
        refetch();
        qc.invalidateQueries({ queryKey: ["lab-order"] });
        qc.invalidateQueries({ queryKey: ["lab-orders"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [invoiceId, refetch, qc]);

  useEffect(() => { setPhone(patient?.phone || ""); setEmail(patient?.email || ""); }, [patient?.phone, patient?.email]);

  const total = Number(invoice?.total_amount || 0);
  const paid = Number(invoice?.paid_amount || 0);
  const balance = Math.max(total - paid, 0);
  const status: string = invoice?.status === "cancelled" ? "cancelled" : balance <= 0 && total >= 0 && invoice ? "paid" : paid > 0 ? "partial" : "pending";
  const statusStyle: Record<string, string> = {
    paid: "bg-primary/15 text-primary border-primary/30",
    partial: "bg-accent text-accent-foreground border-border",
    pending: "bg-muted text-muted-foreground border-border",
    cancelled: "bg-destructive/15 text-destructive border-destructive/30",
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const { error } = await (supabase as any).rpc("create_lab_order_invoice", { p_lab_order_id: labOrderId });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["lab-order"] });
      toast.success(t.create);
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally { setCreating(false); }
  };

  const name = `${patient?.first_name || ""} ${patient?.last_name || ""}`.trim();
  const message = invoice
    ? `${t.msgHello} ${name}, ${t.msgBody} ${invoice.invoice_number} (${orderNumber}). ${t.msgTotal}: ${formatCurrency(total)}, ${t.msgPaid}: ${formatCurrency(paid)}, ${t.msgBal}: ${formatCurrency(balance)}. ${t.msgThanks}`
    : "";

  const sendWhatsApp = () => {
    const digits = phone.replace(/[^\d]/g, "");
    if (!digits) return toast.error(t.phone);
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(message)}`, "_blank");
    toast.success(t.sent);
  };
  const sendEmail = () => {
    if (!email) return toast.error(t.email);
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(`${t.title} ${invoice?.invoice_number}`)}&body=${encodeURIComponent(message)}`;
  };
  const sendSms = async () => {
    const to = phone.trim().startsWith("+") ? phone.trim() : `+${phone.replace(/[^\d]/g, "")}`;
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-sms", { body: { to, message: message.slice(0, 480) } });
      if (error) throw error;
      toast.success(t.sent);
      setOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "SMS failed");
    } finally { setSending(false); }
  };

  return (
    <Card dir={isRtl ? "rtl" : "ltr"} className={cn(isRtl && "text-end")}>
      <CardHeader className="pb-3">
        <CardTitle className={cn("text-lg flex items-center gap-2 justify-between", isRtl && "flex-row-reverse")}>
          <span className={cn("flex items-center gap-2", isRtl && "flex-row-reverse")}>
            <Receipt className="h-5 w-5" /> {t.title}
            {invoice && <span className="font-mono text-sm text-muted-foreground">{invoice.invoice_number}</span>}
          </span>
          {invoice && <Badge variant="outline" className={statusStyle[status]}>{t[`s_${status}`]}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!invoice ? (
          <div className={cn("flex items-center justify-between gap-3", isRtl && "flex-row-reverse")}>
            <p className="text-sm text-muted-foreground">{t.none}</p>
            <Button onClick={handleCreate} disabled={creating}>
              {creating && <Loader2 className="h-4 w-4 me-2 animate-spin" />}{t.create}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{t.tests}</p>
              {(invoice.invoice_items || []).map((it: any) => (
                <div key={it.id} className={cn("flex justify-between text-sm", isRtl && "flex-row-reverse")}>
                  <span>{it.description} {Number(it.quantity) > 1 && `× ${it.quantity}`}</span>
                  <span className="font-medium">{formatCurrency(Number(it.total_price || 0))}</span>
                </div>
              ))}
            </div>
            <Separator />
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-muted-foreground">{t.total}</p><p className="font-semibold">{formatCurrency(total)}</p></div>
              <div><p className="text-muted-foreground">{t.paid}</p><p className="font-semibold">{formatCurrency(paid)}</p></div>
              <div><p className="text-muted-foreground">{t.balance}</p><p className="font-semibold">{formatCurrency(balance)}</p></div>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(invoice.created_at), "MMM d, yyyy h:mm a")} · {t.live}
            </p>
            <div className={cn("flex flex-wrap gap-2", isRtl && "flex-row-reverse")}>
              {balance > 0 && status !== "cancelled" && (
                <Button onClick={() => navigate(`/app/billing/invoices/${invoice.id}/pay`)}>
                  <CreditCard className="h-4 w-4 me-2" />{t.collect}
                </Button>
              )}
              <Button variant="outline" onClick={() => setOpen(true)}>
                <Send className="h-4 w-4 me-2" />{t.send}
              </Button>
              <Button variant="ghost" onClick={() => navigate(`/app/billing/invoices/${invoice.id}`)}>
                <ExternalLink className="h-4 w-4 me-2" />{t.view}
              </Button>
            </div>
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={isRtl ? "rtl" : "ltr"} className={cn(isRtl && "text-end")}>
          <DialogHeader><DialogTitle>{t.send}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>{t.phone}</Label><Input dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+923001234567" /></div>
            <div className="space-y-1"><Label>{t.email}</Label><Input dir="ltr" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <p className="text-sm bg-muted/50 p-3 rounded-md whitespace-pre-wrap">{message}</p>
            <div className={cn("flex flex-wrap gap-2", isRtl && "flex-row-reverse")}>
              <Button onClick={sendWhatsApp}><MessageCircle className="h-4 w-4 me-2" />{t.wa}</Button>
              <Button variant="outline" onClick={sendSms} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 me-2 animate-spin" /> : <Smartphone className="h-4 w-4 me-2" />}{t.sms}
              </Button>
              <Button variant="outline" onClick={sendEmail}><Mail className="h-4 w-4 me-2" />{t.mail}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
