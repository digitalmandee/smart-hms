import { useRef } from "react";
import { useTranslation, useDirection } from "@/lib/i18n";
import { BloodGroupBadge } from "./BloodGroupBadge";
import { generateQRCodeUrl, getDonorVerificationUrl } from "@/lib/qrcode";
import { cn } from "@/lib/utils";
import type { BloodDonor } from "@/hooks/useBloodBank";

interface PrintableDonorCardProps {
  donor: BloodDonor;
  orgName?: string;
  orgAddress?: string;
  orgPhone?: string;
  orgSlug?: string;
}

export function PrintableDonorCard({
  donor,
  orgName = "Healthcare Organization",
  orgAddress = "",
  orgPhone = "",
  orgSlug,
}: PrintableDonorCardProps) {
  const { t } = useTranslation();
  const dir = useDirection();
  const isRTL = dir === "rtl";

  const verificationUrl = getDonorVerificationUrl(donor.donor_number, orgSlug);
  const qrUrl = generateQRCodeUrl(verificationUrl, 80);

  const age = donor.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(donor.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  const fullName = [donor.first_name, donor.last_name].filter(Boolean).join(" ");

  return (
    <div className="inline-block" dir={dir}>
      {/* FRONT */}
      <div
        className="border border-border rounded-lg overflow-hidden bg-card shadow-sm"
        style={{ width: "85.6mm", height: "53.98mm" }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-1.5 flex items-center justify-between">
          <span className="text-[9px] font-semibold truncate max-w-[60%]">
            {orgName}
          </span>
          <span className="text-[8px] font-bold tracking-wide">
            {t("bb.donorIdCard")}
          </span>
        </div>

        {/* Body */}
        <div
          className={cn(
            "flex gap-2 px-3 pt-2 pb-1",
            isRTL && "flex-row-reverse"
          )}
        >
          {/* Photo placeholder */}
          <div
            className="border border-dashed border-muted-foreground/40 rounded flex items-center justify-center bg-muted/30 shrink-0"
            style={{ width: "18mm", height: "22mm" }}
          >
            <span className="text-[7px] text-muted-foreground text-center leading-tight">
              PHOTO
            </span>
          </div>

          {/* Info */}
          <div className={cn("flex-1 min-w-0", isRTL ? "text-right" : "text-left")}>
            <p className="text-[11px] font-bold text-foreground truncate leading-tight">
              {fullName}
            </p>
            <p className="text-[9px] font-mono text-muted-foreground mt-0.5">
              {donor.donor_number}
            </p>
            <div className="mt-1">
              <BloodGroupBadge group={donor.blood_group} size="sm" />
            </div>

            {/* Mini info grid */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 mt-1.5 text-[7px]">
              <InfoField label={t("common.gender")} value={donor.gender} isRTL={isRTL} />
              <InfoField label={t("common.age")} value={age ? `${age}` : "—"} isRTL={isRTL} />
              <InfoField label={t("common.phone")} value={donor.phone || "—"} isRTL={isRTL} />
              <InfoField
                label={t("bb.totalDonations")}
                value={`${donor.total_donations}`}
                isRTL={isRTL}
              />
            </div>
          </div>

          {/* QR */}
          <div className="shrink-0 flex flex-col items-center justify-end">
            <img
              src={qrUrl}
              alt="QR"
              className="rounded"
              style={{ width: "16mm", height: "16mm" }}
            />
          </div>
        </div>
      </div>

      {/* BACK */}
      <div
        className="border border-border rounded-lg overflow-hidden bg-card shadow-sm mt-2"
        style={{ width: "85.6mm", height: "53.98mm" }}
      >
        <div className="h-full flex flex-col justify-between p-3">
          {/* Top: blood group + donation summary */}
          <div className={cn("flex items-start justify-between", isRTL && "flex-row-reverse")}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <BloodGroupBadge group={donor.blood_group} size="lg" showIcon />
            </div>
            <div className={cn("text-[8px] space-y-0.5", isRTL ? "text-left" : "text-right")}>
              <p>
                <span className="text-muted-foreground">{t("bb.totalDonations")}:</span>{" "}
                <span className="font-semibold">{donor.total_donations}</span>
              </p>
              <p>
                <span className="text-muted-foreground">{t("bb.lastDonation")}:</span>{" "}
                <span className="font-semibold">
                  {donor.last_donation_date
                    ? new Date(donor.last_donation_date).toLocaleDateString()
                    : "—"}
                </span>
              </p>
            </div>
          </div>

          {/* Middle: org info */}
          <div className={cn("text-[7px] text-muted-foreground mt-2", isRTL ? "text-right" : "text-left")}>
            {orgName && <p className="font-semibold text-foreground">{orgName}</p>}
            {orgAddress && <p>{orgAddress}</p>}
            {orgPhone && <p>{orgPhone}</p>}
          </div>

          {/* Bottom: certification text */}
          <div className="border-t border-dashed border-muted-foreground/30 pt-1 mt-auto">
            <p className={cn("text-[6.5px] text-muted-foreground italic", isRTL ? "text-right" : "text-left")}>
              {t("bb.registeredDonor")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  label,
  value,
  isRTL,
}: {
  label: string;
  value: string;
  isRTL: boolean;
}) {
  return (
    <div className={isRTL ? "text-right" : "text-left"}>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
