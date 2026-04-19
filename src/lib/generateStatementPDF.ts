import jsPDF from "jspdf";
import { toPng } from "html-to-image";

/**
 * Render an offscreen DOM node to a multi-page A4 PDF and trigger a download.
 * The element should be a fully styled, fixed-width (≈794px / A4) HTML block.
 */
export async function generateStatementPDF(node: HTMLElement, filename: string): Promise<void> {
  // Snapshot the node at high resolution
  const dataUrl = await toPng(node, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
  });

  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load snapshot image"));
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pdfWidth = 210;
  const pdfHeight = 297;
  const imgWidthMm = pdfWidth;
  const imgHeightMm = (img.height * imgWidthMm) / img.width;

  if (imgHeightMm <= pdfHeight) {
    pdf.addImage(dataUrl, "PNG", 0, 0, imgWidthMm, imgHeightMm);
  } else {
    // Multi-page: slice the image vertically
    let remainingHeight = imgHeightMm;
    let yOffset = 0;
    let page = 0;
    while (remainingHeight > 0) {
      if (page > 0) pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, -yOffset, imgWidthMm, imgHeightMm);
      remainingHeight -= pdfHeight;
      yOffset += pdfHeight;
      page += 1;
      if (page > 50) break; // safety
    }
  }

  pdf.save(`${filename}.pdf`);
}

/**
 * Compute aging buckets from invoice-style entries (positive debit = charge).
 * Used by Patient SOA to show overdue distribution alongside the ledger.
 */
export function computeAgingFromEntries(
  entries: Array<{ date: string; debit: number; credit: number }>,
  asOf: Date = new Date()
) {
  const buckets = { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, days90_plus: 0 };
  // Net outstanding per entry: positive debit contributes; we approximate aging from invoice date
  // and apply credits chronologically (FIFO).
  const sorted = [...entries].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const charges: Array<{ date: string; remaining: number }> = [];
  for (const e of sorted) {
    if (e.debit > 0) charges.push({ date: e.date, remaining: e.debit });
    let credit = e.credit;
    while (credit > 0 && charges.length > 0) {
      const head = charges[0];
      const used = Math.min(head.remaining, credit);
      head.remaining -= used;
      credit -= used;
      if (head.remaining <= 0.001) charges.shift();
    }
  }
  for (const c of charges) {
    const d = c.date ? new Date(c.date) : asOf;
    const days = Math.floor((asOf.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) buckets.current += c.remaining;
    else if (days <= 30) buckets.days1_30 += c.remaining;
    else if (days <= 60) buckets.days31_60 += c.remaining;
    else if (days <= 90) buckets.days61_90 += c.remaining;
    else buckets.days90_plus += c.remaining;
  }
  return buckets;
}
