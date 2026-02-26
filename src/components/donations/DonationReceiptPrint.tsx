import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { FinancialDonation } from "@/hooks/useDonations";

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };
  const intPart = Math.floor(num);
  return convert(intPart) + " Rupees Only";
};

const PURPOSE_LABELS: Record<string, { en: string; ar: string; ur: string }> = {
  general: { en: "General Donation", ar: "تبرع عام", ur: "عمومی عطیہ" },
  building_fund: { en: "Building Fund", ar: "صندوق البناء", ur: "تعمیراتی فنڈ" },
  equipment: { en: "Equipment", ar: "المعدات", ur: "آلات" },
  patient_welfare: { en: "Patient Welfare", ar: "رعاية المرضى", ur: "مریضوں کی فلاح" },
  zakat: { en: "Zakat", ar: "زكاة", ur: "زکوٰۃ" },
  sadaqah: { en: "Sadaqah", ar: "صدقة", ur: "صدقہ" },
  fitrana: { en: "Fitrana", ar: "فطرة", ur: "فطرانہ" },
  other: { en: "Other", ar: "أخرى", ur: "دیگر" },
};

const PAYMENT_LABELS: Record<string, { en: string; ar: string; ur: string }> = {
  cash: { en: "Cash", ar: "نقداً", ur: "نقد" },
  bank_transfer: { en: "Bank Transfer", ar: "تحويل بنكي", ur: "بینک ٹرانسفر" },
  cheque: { en: "Cheque", ar: "شيك", ur: "چیک" },
  online: { en: "Online", ar: "إلكتروني", ur: "آن لائن" },
  mobile_wallet: { en: "Mobile Wallet", ar: "محفظة إلكترونية", ur: "موبائل والٹ" },
};

interface Props {
  donation: FinancialDonation;
}

export function DonationReceiptPrint({ donation }: Props) {
  const { profile } = useAuth();
  const { data: org } = useQuery({
    queryKey: ["org-for-receipt", profile?.organization_id],
    queryFn: async () => {
      const { data } = await supabase
        .from("organizations")
        .select("name, address, phone, email, logo_url")
        .eq("id", profile?.organization_id!)
        .single();
      return data;
    },
    enabled: !!profile?.organization_id,
  });

  const donor = donation.financial_donors;
  const purpose = PURPOSE_LABELS[donation.purpose] || PURPOSE_LABELS.general;
  const payment = PAYMENT_LABELS[donation.payment_method] || PAYMENT_LABELS.cash;

  return (
    <div className="bg-white text-black p-8 max-w-2xl mx-auto border rounded-lg print:border-none print:shadow-none" style={{ fontFamily: "serif" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        {org?.logo_url && <img src={org.logo_url} alt="Logo" className="h-16 mx-auto mb-2" />}
        <h1 className="text-xl font-bold uppercase">{org?.name || "Organization"}</h1>
        {org?.address && <p className="text-sm">{org.address}</p>}
        <div className="flex justify-center gap-4 text-sm">
          {org?.phone && <span>Tel: {org.phone}</span>}
          {org?.email && <span>Email: {org.email}</span>}
        </div>
        {(org as any)?.tax_id && <p className="text-sm">Tax No: {(org as any)?.tax_id}</p>}
      </div>

      {/* Title trilingual */}
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold">DONATION RECEIPT</h2>
        <p className="text-sm" dir="rtl">إيصال تبرع</p>
        <p className="text-sm" dir="rtl">عطیہ رسید</p>
      </div>

      {/* Receipt Details */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><strong>Receipt No / رقم الإيصال / رسید نمبر:</strong></p>
          <p className="font-mono">{donation.receipt_number || donation.donation_number}</p>
        </div>
        <div className="text-right">
          <p><strong>Date / التاريخ / تاریخ:</strong></p>
          <p>{format(new Date(donation.donation_date), "dd/MM/yyyy")}</p>
        </div>
      </div>

      {/* Donor Info */}
      <div className="border rounded p-4 mb-6 text-sm">
        <p><strong>Donor Name / اسم المتبرع / عطیہ دہندہ:</strong></p>
        <p className="text-lg font-semibold">{donor?.name || "Anonymous"}</p>
        {donor?.name_ar && <p dir="rtl" className="text-base">{donor.name_ar}</p>}
        {donor?.cnic_passport && <p className="mt-1">CNIC/Passport: {donor.cnic_passport}</p>}
      </div>

      {/* Amount */}
      <div className="border rounded p-4 mb-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Amount / المبلغ / رقم</p>
            <p className="text-2xl font-bold">PKR {Number(donation.amount).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">In Words / كتابةً / الفاظ میں</p>
            <p className="font-medium">{numberToWords(Number(donation.amount))}</p>
          </div>
        </div>
      </div>

      {/* Purpose & Payment */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="border rounded p-3">
          <p className="text-muted-foreground mb-1">Purpose / الغرض / مقصد</p>
          <p className="font-semibold">{purpose.en}</p>
          <p dir="rtl">{purpose.ar}</p>
          <p dir="rtl">{purpose.ur}</p>
        </div>
        <div className="border rounded p-3">
          <p className="text-muted-foreground mb-1">Payment Method / طريقة الدفع / ادائیگی کا طریقہ</p>
          <p className="font-semibold">{payment.en}</p>
          {donation.payment_reference && <p className="text-xs mt-1">Ref: {donation.payment_reference}</p>}
        </div>
      </div>

      {/* Signature */}
      <div className="mt-12 pt-4 border-t flex justify-between text-sm">
        <div className="text-center">
          <div className="w-48 border-b border-dashed mb-1" />
          <p>Authorized Signature</p>
          <p dir="rtl" className="text-xs">التوقيع المعتمد / مجاز دستخط</p>
        </div>
        <div className="text-center">
          <div className="w-48 border-b border-dashed mb-1" />
          <p>Stamp / Seal</p>
          <p dir="rtl" className="text-xs">الختم / مہر</p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground mt-8">
        This is a computer-generated receipt. | هذا إيصال إلكتروني | یہ کمپیوٹر سے تیار شدہ رسید ہے۔
      </p>
    </div>
  );
}
