import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useParams } from "react-router-dom";
import { useFinancialDonation, useUpdateDonation } from "@/hooks/useDonations";
import { DonationReceiptPrint } from "@/components/donations/DonationReceiptPrint";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/i18n";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";

export default function DonationReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const t = useTranslation();
  const { data: donation, isLoading } = useFinancialDonation(id!);
  const updateDonation = useUpdateDonation();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    onAfterPrint: () => {
      if (donation && !donation.receipt_issued) {
        updateDonation.mutate({
          id: donation.id,
          receipt_issued: true,
          receipt_issued_at: new Date().toISOString(),
          receipt_number: donation.donation_number,
        });
      }
    },
  });

  if (isLoading) return <div className="p-6"><Skeleton className="h-96 w-full" /></div>;
  if (!donation) return <div className="p-6 text-muted-foreground">Donation not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.donationReceipt")}
        description={donation.donation_number}
        breadcrumbs={[
          { label: t("donations.title"), href: "/app/donations" },
          { label: t("donations.donationReceipt") },
        ]}
      >
        <Button onClick={() => handlePrint()}>
          <Printer className="h-4 w-4 mr-2" />
          {t("common.print")}
        </Button>
      </PageHeader>

      <div ref={printRef}>
        <DonationReceiptPrint donation={donation} />
      </div>
    </div>
  );
}
