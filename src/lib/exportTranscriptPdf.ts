import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type TranscriptEntry = {
  role: "user" | "assistant";
  content: string;
  ts: number;
};

type Lang = "en" | "ar" | "ur";

const STR: Record<Lang, Record<string, string>> = {
  en: {
    title: "Dr. Tabeebi — Call Transcript",
    generated: "Generated",
    language: "Language",
    time: "Time",
    speaker: "Speaker",
    message: "Message",
    you: "You",
    doctor: "Dr. Tabeebi",
    langName: "English",
    footer: "Tabeebi AI — Confidential",
  },
  ar: {
    title: "الدكتور طبيبي — نص المكالمة",
    generated: "تم الإنشاء",
    language: "اللغة",
    time: "الوقت",
    speaker: "المتحدث",
    message: "الرسالة",
    you: "أنت",
    doctor: "د. طبيبي",
    langName: "العربية",
    footer: "طبيبي الذكي — سري",
  },
  ur: {
    title: "ڈاکٹر طبیبی — کال ٹرانسکرپٹ",
    generated: "تیار شدہ",
    language: "زبان",
    time: "وقت",
    speaker: "بولنے والا",
    message: "پیغام",
    you: "آپ",
    doctor: "ڈاکٹر طبیبی",
    langName: "اردو",
    footer: "طبیبی AI — خفیہ",
  },
};

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtStamp(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

export function exportTranscriptPdf(opts: {
  entries: TranscriptEntry[];
  language: Lang;
  startedAt?: Date;
}) {
  const { entries, language } = opts;
  const startedAt = opts.startedAt ?? new Date();
  const s = STR[language];
  const isRTL = language === "ar" || language === "ur";

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(13, 148, 136);
  doc.rect(0, 0, pageWidth, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(s.title, isRTL ? pageWidth - 12 : 12, 14, { align: isRTL ? "right" : "left" });

  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const meta = `${s.generated}: ${startedAt.toLocaleString()}    ${s.language}: ${s.langName}`;
  doc.text(meta, isRTL ? pageWidth - 12 : 12, 30, { align: isRTL ? "right" : "left" });

  const head = isRTL
    ? [[s.message, s.speaker, s.time]]
    : [[s.time, s.speaker, s.message]];

  const body = entries.map((e) => {
    const speaker = e.role === "user" ? s.you : s.doctor;
    const time = fmtTime(e.ts);
    const msg = e.content || "—";
    return isRTL ? [msg, speaker, time] : [time, speaker, msg];
  });

  autoTable(doc, {
    startY: 36,
    head,
    body,
    theme: "striped",
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      halign: isRTL ? "right" : "left",
    },
    headStyles: {
      fillColor: [13, 148, 136],
      textColor: 255,
      halign: isRTL ? "right" : "left",
    },
    columnStyles: isRTL
      ? { 0: { cellWidth: "auto" }, 1: { cellWidth: 32 }, 2: { cellWidth: 22 } }
      : { 0: { cellWidth: 22 }, 1: { cellWidth: 32 }, 2: { cellWidth: "auto" } },
    margin: { left: 12, right: 12 },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(s.footer, pageWidth / 2, pageHeight - 6, { align: "center" });
    },
  });

  doc.save(`tabeebi-transcript-${fmtStamp(startedAt)}.pdf`);
}
