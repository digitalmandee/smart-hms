import JsBarcode from "jsbarcode";

export interface CampLabelData {
  code: string; // barcode value (donation number)
  bag?: string | null;
  group?: string | null;
  donor?: string | null;
  date?: string | null;
  time?: string | null;
  volume?: number | null;
}

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

function barcodeSvg(value: string, height: number) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  try { JsBarcode(svg, value, { format: "CODE128", width: 1.6, height, displayValue: true, fontSize: 10, margin: 0 }); } catch { /* invalid */ }
  return svg.outerHTML;
}

/** Opens a print window with one bag label + two pilot-tube stickers per donation (50x25 mm stock). */
export function printCampLabels(items: CampLabelData[], opts: { campName: string; campNumber?: string | null; rtl: boolean; tc: (k: string) => string }) {
  if (!items.length) return;
  const w = window.open("", "_blank");
  if (!w) { alert("Please allow pop-ups to print"); return; }
  const { tc } = opts;
  const pages = items.map((i) => {
    const bag = `<div class="lbl"><div class="r"><b>${esc(tc("lbl_camp"))}: ${esc(opts.campName)}</b><span class="g">${esc(i.group || tc("lbl_pending"))}</span></div>
      <div class="bc">${barcodeSvg(i.code, 30)}</div>
      <div class="r s"><span>${esc(tc("lbl_donor"))}: ${esc(i.donor || "-")}</span><span>${esc(i.volume ? i.volume + " ml" : "")}</span></div>
      <div class="r s"><span>${esc(opts.campNumber || "")}${i.bag ? " • " + esc(i.bag) : ""}</span><span>${esc(i.date || "")} ${esc((i.time || "").slice(0, 5))}</span></div></div>`;
    const tube = `<div class="lbl"><div class="r s"><b>${esc(tc("lbl_sample"))}</b><span>${esc(i.group || tc("lbl_pending"))}</span></div><div class="bc">${barcodeSvg(i.code, 34)}</div><div class="r s"><span>${esc(i.date || "")}</span></div></div>`;
    return bag + tube + tube;
  }).join("");
  w.document.write(`<!DOCTYPE html><html dir="${opts.rtl ? "rtl" : "ltr"}"><head><title>Labels</title><style>
    *{margin:0;padding:0;box-sizing:border-box}@page{size:50mm 25mm;margin:0}
    body{font-family:Arial,"Noto Nastaliq Urdu","Noto Naskh Arabic",sans-serif}
    .lbl{width:50mm;height:25mm;padding:1.2mm 1.8mm;page-break-after:always;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between}
    .r{display:flex;justify-content:space-between;gap:2mm;font-size:6.5pt;white-space:nowrap;overflow:hidden}.s{font-size:5.5pt}
    .g{font-weight:700;font-size:9pt;border:0.3mm solid #000;padding:0 1mm}
    .bc{text-align:center;direction:ltr}.bc svg{max-width:100%;height:12mm}
  </style></head><body>${pages}<script>window.onload=function(){setTimeout(function(){window.print()},300);window.onafterprint=function(){window.close()}}<\/script></body></html>`);
  w.document.close();
}
