import type { RecordField } from "./RecordSection";

export const RECORD_CONFIGS: Record<
  string,
  { titleKey: string; fields: RecordField[]; withTooth?: boolean; statuses?: string[] }
> = {
  endodontics: {
    titleKey: "dw.tab.endodontics",
    fields: [
      { name: "canals", labelKey: "dw.f.canals", type: "number" },
      { name: "working_length", labelKey: "dw.f.workingLength", type: "text" },
      { name: "apex_reading", labelKey: "dw.f.apexReading", type: "text" },
      { name: "obturation", labelKey: "dw.f.obturation", type: "text" },
      { name: "visit", labelKey: "dw.f.visit", type: "select", options: ["Access", "Cleaning & shaping", "Obturation", "Review"] },
      { name: "anaesthesia", labelKey: "dw.f.anaesthesia", type: "text" },
    ],
    statuses: ["open", "in_progress", "completed"],
  },
  oral_surgery: {
    titleKey: "dw.tab.oral_surgery",
    fields: [
      { name: "technique", labelKey: "dw.f.technique", type: "select", options: ["Simple", "Surgical", "Flap", "Bone removal"] },
      { name: "anaesthesia", labelKey: "dw.f.anaesthesia", type: "text" },
      { name: "sutures", labelKey: "dw.f.sutures", type: "text" },
      { name: "complications", labelKey: "dw.f.complications", type: "textarea" },
      { name: "instructions", labelKey: "dw.f.instructions", type: "textarea" },
    ],
    statuses: ["completed", "open"],
  },
  implantology: {
    titleKey: "dw.tab.implantology",
    fields: [
      { name: "brand", labelKey: "dw.f.implantBrand", type: "text" },
      { name: "size", labelKey: "dw.f.implantSize", type: "text" },
      { name: "torque", labelKey: "dw.f.torque", type: "number" },
      { name: "stage", labelKey: "dw.f.stage", type: "select", options: ["Placement", "Healing", "Abutment", "Crown"] },
    ],
    statuses: ["in_progress", "completed"],
  },
  orthodontics: {
    titleKey: "dw.tab.orthodontics",
    fields: [
      { name: "appliance", labelKey: "dw.f.appliance", type: "select", options: ["Fixed metal", "Fixed ceramic", "Removable", "Functional", "Retainer"] },
      { name: "archwire", labelKey: "dw.f.archwire", type: "text" },
      { name: "adjustment", labelKey: "dw.f.adjustment", type: "textarea" },
      { name: "next_visit", labelKey: "dw.f.nextVisit", type: "date" },
    ],
    withTooth: false,
    statuses: ["in_progress", "completed"],
  },
  aligners: {
    titleKey: "dw.tab.aligners",
    fields: [
      { name: "tray_number", labelKey: "dw.f.trayNumber", type: "number" },
      { name: "tray_total", labelKey: "dw.f.trayTotal", type: "number" },
      { name: "wear_hours", labelKey: "dw.f.wearHours", type: "number" },
      { name: "compliance", labelKey: "dw.f.compliance", type: "select", options: ["Good", "Fair", "Poor"] },
      { name: "next_visit", labelKey: "dw.f.nextVisit", type: "date" },
    ],
    withTooth: false,
    statuses: ["in_progress", "completed"],
  },
  ceph: {
    titleKey: "dw.tab.ceph",
    fields: [
      { name: "sna", labelKey: "dw.f.sna", type: "number" },
      { name: "snb", labelKey: "dw.f.snb", type: "number" },
      { name: "anb", labelKey: "dw.f.anb", type: "number" },
      { name: "fma", labelKey: "dw.f.fma", type: "number" },
      { name: "interpretation", labelKey: "dw.f.interpretation", type: "textarea" },
    ],
    withTooth: false,
    statuses: ["completed"],
  },
  prosthodontics: {
    titleKey: "dw.tab.prosthodontics",
    fields: [
      { name: "prosthesis", labelKey: "dw.f.prosthesis", type: "select", options: ["Crown", "Bridge", "Veneer", "Partial denture", "Complete denture", "Implant crown"] },
      { name: "shade", labelKey: "dw.f.shade", type: "text" },
      { name: "impression", labelKey: "dw.f.impression", type: "checkbox" },
      { name: "teeth", labelKey: "dw.f.teeth", type: "text" },
    ],
    statuses: ["in_progress", "completed"],
  },
  oral_medicine: {
    titleKey: "dw.tab.oral_medicine",
    fields: [
      { name: "site", labelKey: "dw.f.lesionSite", type: "text" },
      { name: "lesion_type", labelKey: "dw.f.lesionType", type: "select", options: ["Ulcer", "White patch", "Red patch", "Swelling", "Pigmentation", "Vesicle", "Other"] },
      { name: "size", labelKey: "dw.f.size", type: "text" },
      { name: "provisional_dx", labelKey: "dw.f.provisionalDx", type: "text" },
      { name: "biopsy", labelKey: "dw.f.biopsy", type: "checkbox" },
    ],
    statuses: ["open", "in_progress", "completed"],
  },
  pediatric: {
    titleKey: "dw.tab.pediatric",
    fields: [
      { name: "fluoride", labelKey: "dw.f.fluoride", type: "checkbox" },
      { name: "sealants", labelKey: "dw.f.sealants", type: "text" },
      { name: "behaviour", labelKey: "dw.f.behaviour", type: "select", options: ["Cooperative", "Anxious", "Uncooperative"] },
      { name: "eruption", labelKey: "dw.f.eruption", type: "textarea" },
    ],
    statuses: ["completed", "open"],
  },
  chairside: {
    titleKey: "dw.tab.chairside",
    fields: [
      { name: "procedures", labelKey: "dw.f.procedures", type: "textarea" },
      { name: "anaesthesia", labelKey: "dw.f.anaesthesia", type: "text" },
      { name: "materials", labelKey: "dw.f.materials", type: "textarea" },
      { name: "chair_time", labelKey: "dw.f.chairTime", type: "number" },
    ],
    statuses: ["completed", "open"],
  },
  postop: {
    titleKey: "dw.tab.postop",
    fields: [
      { name: "instructions", labelKey: "dw.f.instructions", type: "textarea" },
      { name: "follow_up_call", labelKey: "dw.f.followUpCall", type: "date" },
      { name: "pain_score", labelKey: "dw.f.painScore", type: "number" },
      { name: "healing", labelKey: "dw.f.healing", type: "select", options: ["Uneventful", "Delayed", "Infected"] },
      { name: "complications", labelKey: "dw.f.complications", type: "textarea" },
    ],
    statuses: ["open", "completed"],
  },
};
